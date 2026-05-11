import React, { useMemo, useState } from 'react';
import './SeasonalPredictions.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function parseSaleDate(sale) {
  const candidates = [
    sale.sale_date,
    sale.date,
    sale.created_at,
    sale.createdAt,
    sale.timestamp
  ].filter(Boolean);

  for (const c of candidates) {
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function getItemKey(sale) {
  return sale.item_id ?? sale.itemId ?? sale.itemID ?? sale.item_name ?? sale.itemName ?? sale.name ?? 'UNKNOWN';
}

function getItemName(sale, inv) {
  return sale?.item_name ?? sale?.itemName ?? sale?.name ?? inv?.item_name ?? inv?.itemName ?? inv?.name ?? 'Unknown Item';
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function fmtPct(n) {
  if (!Number.isFinite(n)) return '0%';
  const sign = n > 0 ? '+' : '';
  return `${sign}${Math.round(n)}%`;
}

function fmtInt(n) {
  return Math.round(safeNumber(n, 0)).toLocaleString();
}

const SEASONS = [
  { id: 'rainy', label: '🌧️ Rainy Season', months: [5, 6, 7, 8, 9], color: '#0ea5e9' }, // Jun–Oct
  { id: 'summer', label: '☀️ Summer', months: [2, 3, 4], color: '#f59e0b' }, // Mar–May
  { id: 'holiday', label: '🎁 Holidays', months: [10, 11], color: '#ef4444' } // Nov–Dec
];

function seasonForMonth(monthIndex) {
  for (const s of SEASONS) {
    if (s.months.includes(monthIndex)) return s.id;
  }
  return 'regular';
}

function buildSeasonalModel({ salesData, inventoryItems, now }) {
  const invByKey = new Map();
  (inventoryItems || []).forEach((it) => {
    const key = it.item_id ?? it.itemId ?? it.itemID ?? it.id ?? it.item_name ?? it.itemName ?? it.name;
    if (!key) return;
    invByKey.set(String(key), it);
  });

  const normalizedSales = (salesData || [])
    .map((s) => {
      const dt = parseSaleDate(s);
      const key = String(getItemKey(s));
      const qty = safeNumber(s.quantity_sold ?? s.qty ?? s.quantity ?? 0, 0);
      return { ...s, _dt: dt, _key: key, _qty: qty };
    })
    .filter((s) => s._dt && s._key && s._qty > 0);

  const byItem = new Map();
  for (const s of normalizedSales) {
    if (!byItem.has(s._key)) byItem.set(s._key, []);
    byItem.get(s._key).push(s);
  }

  const monthsBack = 365; // use last year when available
  const start = new Date(now.getTime() - monthsBack * 24 * 60 * 60 * 1000);

  const items = [];

  for (const [key, sales] of byItem.entries()) {
    const inv = invByKey.get(key);
    const name = getItemName(sales[0], inv);
    const category = inv?.category || sales[0]?.category || 'General';
    const currentStock = safeNumber(inv?.quantity ?? inv?.stock ?? inv?.current_stock ?? 0, 0);

    const bySeason = { rainy: 0, summer: 0, holiday: 0, regular: 0 };
    const byMonth = new Array(12).fill(0);
    let total = 0;
    let rows = 0;

    for (const s of sales) {
      const dt = s._dt;
      if (!dt || dt < start) continue;
      const q = s._qty;
      const m = dt.getMonth();
      const season = seasonForMonth(m);
      bySeason[season] = (bySeason[season] || 0) + q;
      byMonth[m] += q;
      total += q;
      rows += 1;
    }

    const avgPerMonth = total / 12;
    const seasonalIndex = {
      rainy: avgPerMonth > 0 ? bySeason.rainy / (avgPerMonth * SEASONS.find(s => s.id === 'rainy').months.length) : 0,
      summer: avgPerMonth > 0 ? bySeason.summer / (avgPerMonth * SEASONS.find(s => s.id === 'summer').months.length) : 0,
      holiday: avgPerMonth > 0 ? bySeason.holiday / (avgPerMonth * SEASONS.find(s => s.id === 'holiday').months.length) : 0
    };

    const monthNow = now.getMonth();
    const monthIndexNow = avgPerMonth > 0 ? byMonth[monthNow] / avgPerMonth : 0;

    const bestSeason = (['rainy', 'summer', 'holiday'])
      .map((sid) => ({ sid, idx: seasonalIndex[sid] || 0 }))
      .sort((a, b) => b.idx - a.idx)[0];

    const confidence = clamp(50 + Math.min(25, rows / 5) + Math.min(20, bestSeason.idx * 10), 50, 95);

    items.push({
      key,
      name,
      category,
      currentStock,
      totalSold: total,
      rows,
      bySeason,
      byMonth,
      seasonalIndex,
      bestSeason: bestSeason.sid,
      bestSeasonIndex: bestSeason.idx,
      monthIndexNow,
      confidence
    });
  }

  // include inventory-only items as low-confidence candidates
  (inventoryItems || []).forEach((inv) => {
    const key = inv.item_id ?? inv.itemId ?? inv.itemID ?? inv.id ?? inv.item_name ?? inv.itemName ?? inv.name;
    if (!key) return;
    const k = String(key);
    if (items.some((x) => x.key === k)) return;
    items.push({
      key: k,
      name: inv.item_name ?? inv.itemName ?? inv.name ?? 'Unknown Item',
      category: inv.category ?? 'General',
      currentStock: safeNumber(inv.quantity ?? inv.stock ?? 0, 0),
      totalSold: 0,
      rows: 0,
      bySeason: { rainy: 0, summer: 0, holiday: 0, regular: 0 },
      byMonth: new Array(12).fill(0),
      seasonalIndex: { rainy: 0, summer: 0, holiday: 0 },
      bestSeason: 'regular',
      bestSeasonIndex: 0,
      monthIndexNow: 0,
      confidence: 50
    });
  });

  const seasonBuckets = {
    rainy: items
      .filter((x) => x.seasonalIndex.rainy >= 1.15 && x.totalSold > 0)
      .sort((a, b) => b.seasonalIndex.rainy - a.seasonalIndex.rainy)
      .slice(0, 10),
    summer: items
      .filter((x) => x.seasonalIndex.summer >= 1.15 && x.totalSold > 0)
      .sort((a, b) => b.seasonalIndex.summer - a.seasonalIndex.summer)
      .slice(0, 10),
    holiday: items
      .filter((x) => x.seasonalIndex.holiday >= 1.15 && x.totalSold > 0)
      .sort((a, b) => b.seasonalIndex.holiday - a.seasonalIndex.holiday)
      .slice(0, 10)
  };

  const seasonalTopSelling = items
    .filter((x) => x.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);

  const activeSeasonId = seasonForMonth(now.getMonth());
  const activeSeason = SEASONS.find((s) => s.id === activeSeasonId) || null;
  const activeSeasonMonths = activeSeason?.months ?? [];

  function estimateNextSeasonDemand(item, seasonId) {
    const season = SEASONS.find((s) => s.id === seasonId);
    if (!season) return 0;
    const monthsCount = season.months.length;
    const seasonalTotal = safeNumber(item.bySeason[seasonId], 0);
    const avgPerMonthInSeason = seasonalTotal / Math.max(1, monthsCount);
    // predict one month equivalent demand as a planning unit, then scale lightly for confidence
    return avgPerMonthInSeason * (0.85 + item.confidence / 100 * 0.25);
  }

  const recommendations = items
    .map((x) => {
      const targetSeason = activeSeasonId !== 'regular' ? activeSeasonId : x.bestSeason;
      const predicted = estimateNextSeasonDemand(x, targetSeason);
      const gap = predicted - x.currentStock;
      const shouldRestock = gap > 0 && (x.seasonalIndex[targetSeason] ?? 0) >= 1.1;
      const restockQty = shouldRestock ? Math.ceil(gap + Math.max(5, predicted * 0.2)) : 0;
      return {
        ...x,
        targetSeason,
        predicted,
        gap,
        shouldRestock,
        restockQty
      };
    })
    .filter((x) => x.targetSeason !== 'regular')
    .sort((a, b) => (b.gap - a.gap))
    .slice(0, 12);

  const alerts = recommendations
    .filter((x) => x.shouldRestock)
    .slice(0, 8);

  const demandMonitorChart = items
    .filter((x) => x.totalSold > 0)
    .sort((a, b) => (b.bestSeasonIndex - a.bestSeasonIndex))
    .slice(0, 8)
    .map((x) => {
      const seasonId = x.bestSeason;
      const season = SEASONS.find((s) => s.id === seasonId);
      const seasonMonthsCount = season?.months.length ?? 1;
      const seasonTotal = safeNumber(x.bySeason[seasonId], 0);
      const seasonAvgMonth = seasonTotal / seasonMonthsCount;
      const regularAvgMonth = safeNumber(x.bySeason.regular, 0) / Math.max(1, (12 - seasonMonthsCount));
      const changePct = regularAvgMonth > 0 ? ((seasonAvgMonth - regularAvgMonth) / regularAvgMonth) * 100 : (seasonAvgMonth > 0 ? 100 : 0);
      return {
        name: x.name.length > 14 ? `${x.name.slice(0, 14)}…` : x.name,
        increase: Math.round(changePct),
        season: seasonId
      };
    });

  const seasonalAnalyticsChart = items
    .filter((x) => x.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 8)
    .map((x) => ({
      name: x.name.length > 14 ? `${x.name.slice(0, 14)}…` : x.name,
      rainy: Math.round((x.seasonalIndex.rainy || 0) * 100),
      summer: Math.round((x.seasonalIndex.summer || 0) * 100),
      holiday: Math.round((x.seasonalIndex.holiday || 0) * 100)
    }));

  return {
    activeSeasonId,
    activeSeasonMonths,
    stats: {
      salesRowsUsed: normalizedSales.length,
      itemsAnalyzed: items.length,
      alertsCount: alerts.length,
      activeSeason: activeSeason?.label ?? 'Regular'
    },
    seasonBuckets,
    seasonalTopSelling,
    recommendations,
    restockSuggestions: recommendations.filter((x) => x.shouldRestock).slice(0, 10),
    alerts,
    seasonalAnalyticsChart,
    demandMonitorChart
  };
}

function SeasonTable({ rows, seasonId }) {
  const seasonLabel =
    seasonId === 'rainy' ? 'Rainy' :
    seasonId === 'summer' ? 'Summer' :
    seasonId === 'holiday' ? 'Holiday' : 'Season';

  return (
    <div className="sp-table">
      <div className="sp-row head">
        <span>Product</span>
        <span>Season index</span>
        <span>Sold (season)</span>
        <span>Stock</span>
      </div>
      {rows.length === 0 ? (
        <div className="sp-empty">
          Not enough history yet to identify {seasonLabel.toLowerCase()} fast-sellers.
          Keep recording sales and this list will update automatically.
        </div>
      ) : (
        rows.map((x) => (
          <div key={x.key} className="sp-row">
            <span className="sp-name">
              {x.name}
              <span className="sp-pill seasonal">Seasonal</span>
            </span>
            <span className="sp-idx">{(x.seasonalIndex[seasonId] || 0).toFixed(2)}×</span>
            <span>{fmtInt(x.bySeason[seasonId] || 0)}</span>
            <span>{fmtInt(x.currentStock)}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function SeasonalPredictions({ salesData = [], inventoryItems = [], onRefresh }) {
  const [activeTab, setActiveTab] = useState('rainy');

  const model = useMemo(() => {
    return buildSeasonalModel({ salesData, inventoryItems, now: new Date() });
  }, [salesData, inventoryItems]);

  return (
    <div className="sp">
      <div className="sp-header">
        <div>
          <h2>🍂 Seasonal Predictions</h2>
          <p>
            Analyzes your sales history to predict products likely to be highly demanded during Rainy season, Summer, and Holidays—then generates restocking suggestions and demand alerts automatically.
          </p>
        </div>
        <div className="sp-actions">
          <div className="sp-chip">
            Active season: <strong>{model.stats.activeSeason}</strong>
          </div>
          <button type="button" className="sp-refresh" onClick={onRefresh}>↻ Refresh data</button>
        </div>
      </div>

      <div className="sp-kpis">
        <div className="sp-kpi teal">
          <div className="sp-kpi-label">Seasonal demand alerts</div>
          <div className="sp-kpi-value">{fmtInt(model.stats.alertsCount)}</div>
          <div className="sp-kpi-sub">Likely shortage risk</div>
        </div>
        <div className="sp-kpi indigo">
          <div className="sp-kpi-label">Items analyzed</div>
          <div className="sp-kpi-value">{fmtInt(model.stats.itemsAnalyzed)}</div>
          <div className="sp-kpi-sub">Inventory + sales</div>
        </div>
        <div className="sp-kpi amber">
          <div className="sp-kpi-label">Sales rows used</div>
          <div className="sp-kpi-value">{fmtInt(model.stats.salesRowsUsed)}</div>
          <div className="sp-kpi-sub">Valid dated records</div>
        </div>
      </div>

      <div className="sp-tabs">
        <button className={`sp-tab ${activeTab === 'rainy' ? 'active' : ''}`} onClick={() => setActiveTab('rainy')}>🌧️ Rainy Season</button>
        <button className={`sp-tab ${activeTab === 'summer' ? 'active' : ''}`} onClick={() => setActiveTab('summer')}>☀️ Summer</button>
        <button className={`sp-tab ${activeTab === 'holiday' ? 'active' : ''}`} onClick={() => setActiveTab('holiday')}>🎁 Holiday Trends</button>
        <button className={`sp-tab ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>💡 Recommendations</button>
      </div>

      {activeTab === 'rainy' && (
        <div className="sp-section">
          <div className="sp-title">1. Rainy Season Product Predictions</div>
          <SeasonTable rows={model.seasonBuckets.rainy} seasonId="rainy" />
        </div>
      )}

      {activeTab === 'summer' && (
        <div className="sp-section">
          <div className="sp-title">2. Summer Product Predictions</div>
          <SeasonTable rows={model.seasonBuckets.summer} seasonId="summer" />
        </div>
      )}

      {activeTab === 'holiday' && (
        <div className="sp-section">
          <div className="sp-title">3. Holiday Demand Trends</div>
          <SeasonTable rows={model.seasonBuckets.holiday} seasonId="holiday" />
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="sp-grid">
          <div className="sp-card">
            <div className="sp-card-title">
              <span>4. Seasonal Product Recommendations</span>
              <span className="sp-badge subtle">auto</span>
            </div>
            <div className="sp-table">
              <div className="sp-row head">
                <span>Product</span>
                <span>Target season</span>
                <span>Predicted (1 mo)</span>
                <span>Growth</span>
              </div>
              {model.recommendations.length === 0 ? (
                <div className="sp-empty">No recommendations yet—add more sales history to improve seasonal signal.</div>
              ) : (
                model.recommendations.map((x) => (
                  <div key={x.key} className="sp-row">
                    <span className="sp-name">{x.name}</span>
                    <span>
                      <span className="sp-pill">{x.targetSeason.toUpperCase()}</span>
                    </span>
                    <span>{fmtInt(x.predicted)}</span>
                    <span className={x.gap > 0 ? 'sp-neg' : 'sp-pos'}>{fmtPct((x.gap / Math.max(1, x.predicted)) * 100)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card-title">
              <span>5. Smart Restocking Suggestions</span>
              <span className="sp-badge danger">restock</span>
            </div>
            <div className="sp-table">
              <div className="sp-row head">
                <span>Item</span>
                <span>Stock</span>
                <span>Predicted</span>
                <span>Suggestion</span>
              </div>
              {model.restockSuggestions.length === 0 ? (
                <div className="sp-empty">No urgent seasonal restocks detected right now.</div>
              ) : (
                model.restockSuggestions.map((x) => (
                  <div key={x.key} className="sp-row">
                    <span className="sp-name">
                      {x.name}
                      <span className="sp-pill alert">Alert</span>
                    </span>
                    <span>{fmtInt(x.currentStock)}</span>
                    <span>{fmtInt(x.predicted)}</span>
                    <span>
                      <strong className="sp-restock">Restock {fmtInt(x.restockQty)} units</strong>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sp-grid">
        <div className="sp-card">
          <div className="sp-card-title">
            <span>7. Seasonal Top-Selling Products</span>
            <span className="sp-badge subtle">overall</span>
          </div>
          <div className="sp-table">
            <div className="sp-row head">
              <span>Product</span>
              <span>Total sold</span>
              <span>Best season</span>
              <span>Confidence</span>
            </div>
            {model.seasonalTopSelling.length === 0 ? (
              <div className="sp-empty">No sales history detected yet.</div>
            ) : (
              model.seasonalTopSelling.map((x) => (
                <div key={x.key} className="sp-row">
                  <span className="sp-name">{x.name}</span>
                  <span>{fmtInt(x.totalSold)}</span>
                  <span>
                    <span className="sp-pill seasonal">{x.bestSeason.toUpperCase()}</span>
                  </span>
                  <span>{Math.round(x.confidence)}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sp-card">
          <div className="sp-card-title">
            <span>8. Seasonal Analytics Charts</span>
            <span className="sp-badge subtle">index</span>
          </div>
          <div className="sp-chart-title">Seasonal index by product (100 = average month)</div>
          <div className="sp-chart-box">
            <ResponsiveContainer>
              <BarChart data={model.seasonalAnalyticsChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}`, 'Index']} />
                <Legend />
                <Bar dataKey="rainy" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Rainy" />
                <Bar dataKey="summer" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Summer" />
                <Bar dataKey="holiday" fill="#ef4444" radius={[6, 6, 0, 0]} name="Holiday" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="sp-grid">
        <div className="sp-card">
          <div className="sp-card-title">
            <span>9. Demand Increase / Decrease Monitoring</span>
            <span className="sp-badge subtle">% change</span>
          </div>
          <div className="sp-chart-title">Season vs regular-month average (Top seasonal movers)</div>
          <div className="sp-chart-box" style={{ height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={model.demandMonitorChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Change']} />
                <Line type="monotone" dataKey="increase" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="sp-muted" style={{ marginTop: 8 }}>
            Positive = higher demand in its best season; negative = weaker seasonal lift.
          </div>
        </div>

        <div className="sp-card">
          <div className="sp-card-title">
            <span>6. Seasonal Demand Alerts</span>
            <span className="sp-badge danger">shortage risk</span>
          </div>
          <div className="sp-alerts">
            {model.alerts.length === 0 ? (
              <div className="sp-empty">No seasonal shortage risks detected right now.</div>
            ) : (
              model.alerts.map((x) => (
                <div key={x.key} className="sp-alert">
                  <div className="sp-alert-icon">⚠️</div>
                  <div className="sp-alert-body">
                    <div className="sp-alert-title">{x.name}</div>
                    <div className="sp-alert-desc">
                      Predicted seasonal demand: <strong>{fmtInt(x.predicted)}</strong> vs stock <strong>{fmtInt(x.currentStock)}</strong>
                      <span className="sp-muted"> (target: {x.targetSeason.toUpperCase()}, conf {Math.round(x.confidence)}%)</span>
                    </div>
                    <div className="sp-alert-action">Suggested: Restock {fmtInt(x.restockQty)} units early</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

