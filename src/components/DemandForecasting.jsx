import React, { useEffect, useMemo, useState } from 'react';
import './DemandForecasting.css';
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316'];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

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

function getItemName(sale) {
  return sale.item_name ?? sale.itemName ?? sale.name ?? 'Unknown Item';
}

function formatPct(n) {
  if (!Number.isFinite(n)) return '0%';
  const sign = n > 0 ? '+' : '';
  return `${sign}${Math.round(n)}%`;
}

function formatInt(n) {
  const x = Math.round(safeNumber(n, 0));
  return x.toLocaleString();
}

function computeMonthlySeasonalityIndex(itemSales, now = new Date()) {
  if (!itemSales.length) return 1;
  const monthNow = now.getMonth();
  const monthTotals = new Array(12).fill(0);
  let total = 0;

  for (const s of itemSales) {
    const dt = s._dt;
    if (!dt) continue;
    const q = safeNumber(s.quantity_sold ?? s.qty ?? s.quantity ?? 0, 0);
    monthTotals[dt.getMonth()] += q;
    total += q;
  }

  const avgPerMonth = total / 12;
  if (avgPerMonth <= 0) return 1;
  const idx = monthTotals[monthNow] / avgPerMonth;
  return clamp(idx, 0.75, 1.35);
}

function buildForecast({ salesData, inventoryItems, forecastDays, growthWeight, seasonalBoost, highDemandGrowthThreshold, now }) {
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
      const unitPrice = safeNumber(s.unit_price ?? s.price ?? s.unitPrice ?? 0, 0);
      return { ...s, _dt: dt, _key: key, _name: getItemName(s), _qty: qty, _unitPrice: unitPrice };
    })
    .filter((s) => s._dt && s._key && s._qty > 0);

  const byItem = new Map();
  for (const s of normalizedSales) {
    if (!byItem.has(s._key)) byItem.set(s._key, []);
    byItem.get(s._key).push(s);
  }

  const windowMs = forecastDays * 24 * 60 * 60 * 1000;
  const recentStart = new Date(now.getTime() - windowMs);
  const prevStart = new Date(now.getTime() - windowMs * 2);

  const items = [];

  for (const [key, sales] of byItem.entries()) {
    const inv = invByKey.get(key);
    const name = sales[0]?._name || inv?.item_name || inv?.name || 'Unknown Item';
    const category = inv?.category || sales[0]?.category || 'General';
    const currentStock = safeNumber(inv?.quantity ?? inv?.stock ?? inv?.current_stock ?? 0, 0);

    let recentQty = 0;
    let prevQty = 0;
    let salesCount = 0;

    for (const s of sales) {
      const dt = s._dt;
      if (!dt) continue;
      if (dt >= recentStart) recentQty += s._qty;
      else if (dt >= prevStart && dt < recentStart) prevQty += s._qty;
      salesCount += 1;
    }

    const growthPct = prevQty > 0 ? ((recentQty - prevQty) / prevQty) * 100 : (recentQty > 0 ? 100 : 0);
    const baselineDaily = recentQty / Math.max(1, forecastDays);
    const seasonalIndex = seasonalBoost ? computeMonthlySeasonalityIndex(sales, now) : 1;
    const growthAdj = 1 + clamp(growthPct, -30, 60) / 100 * growthWeight;
    const predictedDemand = Math.max(0, baselineDaily * forecastDays * seasonalIndex * growthAdj);

    const confidence = clamp(
      50 +
        Math.min(25, salesCount / 4) +
        Math.min(12, Math.abs(growthPct) / 10) +
        (seasonalBoost ? 8 : 0),
      50,
      95
    );

    const demandGap = predictedDemand - currentStock;
    const highDemandAlert = demandGap > 0 || growthPct >= highDemandGrowthThreshold;
    const trend =
      growthPct >= 10 ? 'increasing' :
      growthPct <= -10 ? 'decreasing' :
      'stable';

    items.push({
      key,
      name,
      category,
      currentStock,
      recentQty,
      prevQty,
      growthPct,
      seasonalIndex,
      predictedDemand,
      demandGap,
      highDemandAlert,
      confidence,
      trend
    });
  }

  // include inventory-only items (no sales yet) so they can still appear in "watchlist"
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
      recentQty: 0,
      prevQty: 0,
      growthPct: 0,
      seasonalIndex: 1,
      predictedDemand: 0,
      demandGap: 0,
      highDemandAlert: false,
      confidence: 50,
      trend: 'stable'
    });
  });

  const topSelling = [...items]
    .filter((x) => x.recentQty > 0)
    .sort((a, b) => b.recentQty - a.recentQty)
    .slice(0, 8);

  const predictedHighDemand = [...items]
    .sort((a, b) => (b.predictedDemand - a.predictedDemand))
    .slice(0, 10)
    .map((x, idx) => ({ ...x, rank: idx + 1 }));

  const totalPredicted = predictedHighDemand.reduce((sum, x) => sum + x.predictedDemand, 0);
  const demandShareChart = predictedHighDemand
    .filter((x) => x.predictedDemand > 0)
    .map((x) => ({
      name: x.name,
      value: Math.round((x.predictedDemand / Math.max(1, totalPredicted)) * 100)
    }));

  const growthChart = [...predictedHighDemand]
    .sort((a, b) => b.growthPct - a.growthPct)
    .slice(0, 8)
    .map((x) => ({
      name: x.name.length > 14 ? `${x.name.slice(0, 14)}…` : x.name,
      growth: Math.round(x.growthPct),
      demand: Math.round(x.predictedDemand),
      stock: Math.round(x.currentStock)
    }));

  const alerts = items.filter((x) => x.highDemandAlert);
  const seasonalLeaders = [...items]
    .filter((x) => x.seasonalIndex > 1.05 && x.recentQty > 0)
    .sort((a, b) => b.seasonalIndex - a.seasonalIndex)
    .slice(0, 6);

  return {
    stats: {
      salesRowsUsed: normalizedSales.length,
      itemsAnalyzed: items.length,
      alertCount: alerts.length,
      totalPredicted: predictedHighDemand.reduce((s, x) => s + x.predictedDemand, 0)
    },
    topSelling,
    predictedHighDemand,
    demandShareChart,
    growthChart,
    seasonalLeaders
  };
}

export default function DemandForecasting({
  salesData = [],
  inventoryItems = [],
  onRefresh,
  defaultPeriod = 30
}) {
  const [forecastDays, setForecastDays] = useState(defaultPeriod);
  const [seasonalBoost, setSeasonalBoost] = useState(true);
  const [highDemandGrowthThreshold, setHighDemandGrowthThreshold] = useState(20);

  useEffect(() => {
    setForecastDays(defaultPeriod);
  }, [defaultPeriod]);

  const forecast = useMemo(() => {
    return buildForecast({
      salesData,
      inventoryItems,
      forecastDays,
      growthWeight: 0.45,
      seasonalBoost,
      highDemandGrowthThreshold,
      now: new Date()
    });
  }, [salesData, inventoryItems, forecastDays, seasonalBoost, highDemandGrowthThreshold]);

  return (
    <div className="df">
      <div className="df-header">
        <div>
          <h2>📈 Demand Forecasting</h2>
          <p>
            Automatically analyzes sales history + inventory levels to highlight fast sellers, seasonal trends, and items likely to surge in demand.
          </p>
        </div>
        <div className="df-controls">
          <select value={forecastDays} onChange={(e) => setForecastDays(Number(e.target.value))}>
            <option value={7}>Next 7 days</option>
            <option value={30}>Next 30 days</option>
            <option value={90}>Next 90 days</option>
          </select>
          <label className="df-toggle">
            <input
              type="checkbox"
              checked={seasonalBoost}
              onChange={(e) => setSeasonalBoost(e.target.checked)}
            />
            Seasonal boost
          </label>
          <select value={highDemandGrowthThreshold} onChange={(e) => setHighDemandGrowthThreshold(Number(e.target.value))}>
            <option value={10}>Alerts: growth ≥ 10%</option>
            <option value={20}>Alerts: growth ≥ 20%</option>
            <option value={30}>Alerts: growth ≥ 30%</option>
          </select>
          <button type="button" className="df-refresh" onClick={onRefresh}>
            ↻ Refresh data
          </button>
        </div>
      </div>

      <div className="df-kpis">
        <div className="df-kpi teal">
          <div className="df-kpi-label">Predicted units ({forecastDays}d)</div>
          <div className="df-kpi-value">{formatInt(forecast.stats.totalPredicted)}</div>
          <div className="df-kpi-sub">Across your top forecasted items</div>
        </div>
        <div className="df-kpi red">
          <div className="df-kpi-label">High-demand alerts</div>
          <div className="df-kpi-value">{forecast.stats.alertCount}</div>
          <div className="df-kpi-sub">Stock gap or strong growth</div>
        </div>
        <div className="df-kpi indigo">
          <div className="df-kpi-label">Items analyzed</div>
          <div className="df-kpi-value">{formatInt(forecast.stats.itemsAnalyzed)}</div>
          <div className="df-kpi-sub">Inventory + sales mapping</div>
        </div>
        <div className="df-kpi amber">
          <div className="df-kpi-label">Sales rows used</div>
          <div className="df-kpi-value">{formatInt(forecast.stats.salesRowsUsed)}</div>
          <div className="df-kpi-sub">Valid dated sales records</div>
        </div>
      </div>

      <div className="df-grid">
        <div className="df-card">
          <div className="df-card-title">
            <span>🏆 Top-Selling Products (recent {forecastDays}d)</span>
            <span className="df-badge subtle">fast sellers</span>
          </div>
          <div className="df-table">
            <div className="df-row head">
              <span>Product</span>
              <span>Sold</span>
              <span>Trend</span>
              <span>Growth</span>
            </div>
            {forecast.topSelling.length === 0 ? (
              <div className="df-empty">
                No sales records found yet. Once you start recording sales, this will automatically populate.
              </div>
            ) : (
              forecast.topSelling.map((x) => (
                <div key={x.key} className="df-row">
                  <span className="df-name">
                    {x.name}
                    {x.growthPct >= 15 && <span className="df-pill trend">Trending</span>}
                  </span>
                  <span>{formatInt(x.recentQty)}</span>
                  <span>
                    <span className={`df-pill ${x.trend}`}>
                      {x.trend === 'increasing' ? 'Up' : x.trend === 'decreasing' ? 'Down' : 'Stable'}
                    </span>
                  </span>
                  <span className={x.growthPct >= 0 ? 'df-pos' : 'df-neg'}>{formatPct(x.growthPct)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="df-card">
          <div className="df-card-title">
            <span>🚨 Predicted High-Demand Items</span>
            <span className="df-badge danger">forecast</span>
          </div>
          <div className="df-table">
            <div className="df-row head">
              <span>Item</span>
              <span>Forecast</span>
              <span>Stock</span>
              <span>Alert</span>
            </div>
            {forecast.predictedHighDemand.map((x) => (
              <div key={x.key} className="df-row">
                <span className="df-name">
                  <strong>{x.rank}.</strong> {x.name}
                  {x.growthPct >= 20 && <span className="df-pill trend">High growth</span>}
                </span>
                <span>
                  {formatInt(x.predictedDemand)}
                  <span className="df-muted"> ({Math.round(x.confidence)}% conf.)</span>
                </span>
                <span>{formatInt(x.currentStock)}</span>
                <span>
                  {x.highDemandAlert ? (
                    <span className="df-pill alert">High demand</span>
                  ) : (
                    <span className="df-pill stable">Normal</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="df-grid">
        <div className="df-card">
          <div className="df-card-title">
            <span>📊 Demand Percentage Charts</span>
            <span className="df-badge subtle">% share + growth</span>
          </div>
          <div className="df-charts">
            <div className="df-chart">
              <div className="df-chart-title">Forecast demand share (Top items)</div>
              <div className="df-chart-box">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={forecast.demandShareChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {forecast.demandShareChart.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Demand share']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="df-chart">
              <div className="df-chart-title">Growth vs forecast (Top movers)</div>
              <div className="df-chart-box">
                <ResponsiveContainer>
                  <BarChart data={forecast.growthChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} height={50} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v, n) => {
                        if (n === 'growth') return [`${v}%`, 'Growth'];
                        return [formatInt(v), n === 'demand' ? 'Forecast' : 'Stock'];
                      }}
                    />
                    <Bar dataKey="growth" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="df-muted" style={{ marginTop: 8 }}>
                Positive growth = demand increase (recent window vs previous window).
              </div>
            </div>
          </div>
        </div>

        <div className="df-card">
          <div className="df-card-title">
            <span>🍂 Seasonal Product Trends</span>
            <span className="df-badge subtle">month factor</span>
          </div>
          {forecast.seasonalLeaders.length === 0 ? (
            <div className="df-empty">
              Not enough dated history to detect seasonal patterns yet. Keep recording sales and this will start showing seasonal leaders.
            </div>
          ) : (
            <div className="df-seasonal">
              {forecast.seasonalLeaders.map((x) => (
                <div key={x.key} className="df-seasonal-item">
                  <div className="df-seasonal-name">
                    {x.name}
                    <span className="df-pill seasonal">Seasonal</span>
                  </div>
                  <div className="df-seasonal-meta">
                    <span className="df-muted">Season index:</span> <strong>{x.seasonalIndex.toFixed(2)}×</strong>
                    <span className="df-muted" style={{ marginLeft: 10 }}>Growth:</span>{' '}
                    <strong className={x.growthPct >= 0 ? 'df-pos' : 'df-neg'}>{formatPct(x.growthPct)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="df-mini-line">
            <div className="df-chart-title">Demand trend index (signal)</div>
            <div className="df-chart-box" style={{ height: 220 }}>
              <ResponsiveContainer>
                <LineChart
                  data={forecast.growthChart.map((x) => ({
                    name: x.name,
                    index: clamp(100 + x.growth * 0.8, 40, 180)
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${Math.round(Number(v))}`, 'Index']} />
                  <Line type="monotone" dataKey="index" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="df-muted" style={{ marginTop: 8 }}>
              Higher index = rising demand signal. Use together with stock gaps to plan restocks early.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

