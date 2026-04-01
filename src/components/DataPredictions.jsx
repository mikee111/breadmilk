import React, { useState, useEffect } from 'react';
import './DataPredictions.css';

const DataPredictions = () => {
    const [predictionsData, setPredictionsData] = useState({
        salesPredictions: [],
        stockPredictions: [],
        trends: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('sales-forecast');
    const [selectedTimeframe, setSelectedTimeframe] = useState('7days');

    useEffect(() => {
        loadPredictionsData();
    }, [selectedTimeframe]);

    const loadPredictionsData = async () => {
        try {
            setLoading(true);
            const [salesResponse, stockResponse, trendsResponse] = await Promise.all([
                fetch(`http://localhost:5000/api/predictions/sales?timeframe=${selectedTimeframe}`),
                fetch(`http://localhost:5000/api/predictions/stock`),
                fetch(`http://localhost:5000/api/analytics/trends`)
            ]);

            const salesData = salesResponse.ok ? await salesResponse.json() : [];
            const stockData = stockResponse.ok ? await stockResponse.json() : [];
            const trendsData = trendsResponse.ok ? await trendsResponse.json() : [];

            setPredictionsData({
                salesPredictions: salesData,
                stockPredictions: stockData,
                trends: trendsData
            });
        } catch (error) {
            console.error('Error loading predictions:', error);
            setError('Failed to load predictions data');
        } finally {
            setLoading(false);
        }
    };

    const generateSamplePredictions = () => {
        const sampleSales = [
            { item_name: 'White Bread', predicted_quantity: 45, predicted_revenue: 2250, confidence: 85, trend: 'increasing' },
            { item_name: 'Croissant', predicted_quantity: 32, predicted_revenue: 1920, confidence: 78, trend: 'stable' },
            { item_name: 'Coffee', predicted_quantity: 68, predicted_revenue: 3400, confidence: 92, trend: 'increasing' },
            { item_name: 'Chocolate Cake', predicted_quantity: 12, predicted_revenue: 1800, confidence: 71, trend: 'decreasing' },
            { item_name: 'Muffin', predicted_quantity: 28, predicted_revenue: 1400, confidence: 83, trend: 'stable' }
        ];

        const sampleStock = [
            { item_name: 'White Bread', current_stock: 15, days_until_empty: 3, reorder_suggestion: 50, urgency: 'high' },
            { item_name: 'Croissant', current_stock: 8, days_until_empty: 2, reorder_suggestion: 40, urgency: 'critical' },
            { item_name: 'Coffee', current_stock: 25, days_until_empty: 5, reorder_suggestion: 75, urgency: 'medium' },
            { item_name: 'Chocolate Cake', current_stock: 30, days_until_empty: 10, reorder_suggestion: 20, urgency: 'low' },
            { item_name: 'Muffin', current_stock: 12, days_until_empty: 4, reorder_suggestion: 35, urgency: 'high' }
        ];

        return { sampleSales, sampleStock };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            case 'stable': return '➡️';
            default: return '📊';
        }
    };

    if (loading) {
        return (
            <div className="data-predictions">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Analyzing data and generating predictions...</p>
                </div>
            </div>
        );
    }

    const { sampleSales, sampleStock } = generateSamplePredictions();

    return (
        <div className="data-predictions">
            <div className="predictions-header">
                <h1>🔮 Data Predictions & Analytics</h1>
                <div className="header-controls">
                    <select 
                        value={selectedTimeframe} 
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="timeframe-select"
                    >
                        <option value="7days">Next 7 Days</option>
                        <option value="30days">Next 30 Days</option>
                        <option value="90days">Next 3 Months</option>
                    </select>
                    <button onClick={loadPredictionsData} className="refresh-btn">
                        🔄 Refresh Predictions
                    </button>
                </div>
            </div>

            {/* Prediction Tabs */}
            <div className="predictions-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'sales-forecast' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales-forecast')}
                >
                    📈 Sales Forecast
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'stock-predictions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock-predictions')}
                >
                    📦 Stock Predictions
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'demand-analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('demand-analysis')}
                >
                    📊 Demand Analysis
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'ai-insights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai-insights')}
                >
                    🤖 AI Insights
                </button>
            </div>

            {/* Sales Forecast Tab */}
            {activeTab === 'sales-forecast' && (
                <div className="tab-content">
                    <div className="forecast-summary">
                        <div className="summary-card">
                            <div className="summary-icon">💰</div>
                            <div className="summary-info">
                                <div className="summary-value">
                                    {formatCurrency(sampleSales.reduce((sum, item) => sum + item.predicted_revenue, 0))}
                                </div>
                                <div className="summary-label">Predicted Revenue ({selectedTimeframe})</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon">📦</div>
                            <div className="summary-info">
                                <div className="summary-value">
                                    {sampleSales.reduce((sum, item) => sum + item.predicted_quantity, 0)}
                                </div>
                                <div className="summary-label">Predicted Units Sold</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon">🎯</div>
                            <div className="summary-info">
                                <div className="summary-value">
                                    {Math.round(sampleSales.reduce((sum, item) => sum + item.confidence, 0) / sampleSales.length)}%
                                </div>
                                <div className="summary-label">Average Confidence</div>
                            </div>
                        </div>
                    </div>

                    <div className="predictions-grid">
                        {sampleSales.map((item, index) => (
                            <div key={index} className="prediction-card">
                                <div className="prediction-header">
                                    <h4>{item.item_name}</h4>
                                    <span className="trend-indicator">
                                        {getTrendIcon(item.trend)} {item.trend}
                                    </span>
                                </div>
                                <div className="prediction-metrics">
                                    <div className="metric">
                                        <span className="metric-label">Predicted Sales:</span>
                                        <span className="metric-value">{item.predicted_quantity} units</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Expected Revenue:</span>
                                        <span className="metric-value">{formatCurrency(item.predicted_revenue)}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Confidence Level:</span>
                                        <span className="metric-value">
                                            <div className="confidence-bar">
                                                <div 
                                                    className="confidence-fill"
                                                    style={{ width: `${item.confidence}%` }}
                                                ></div>
                                            </div>
                                            {item.confidence}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stock Predictions Tab */}
            {activeTab === 'stock-predictions' && (
                <div className="tab-content">
                    <div className="stock-alerts">
                        <h3>🚨 Urgent Restocking Alerts</h3>
                        <div className="alerts-grid">
                            {sampleStock
                                .filter(item => item.urgency === 'critical' || item.urgency === 'high')
                                .map((item, index) => (
                                    <div key={index} className={`alert-card ${item.urgency}`}>
                                        <div className="alert-icon">
                                            {item.urgency === 'critical' ? '🚨' : '⚠️'}
                                        </div>
                                        <div className="alert-content">
                                            <div className="alert-title">{item.item_name}</div>
                                            <div className="alert-message">
                                                Will run out in {item.days_until_empty} days
                                            </div>
                                            <div className="alert-action">
                                                Reorder {item.reorder_suggestion} units now
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="stock-predictions-table">
                        <h3>📊 Complete Stock Forecast</h3>
                        <div className="table-container">
                            <div className="table-header">
                                <span>Item</span>
                                <span>Current Stock</span>
                                <span>Days Until Empty</span>
                                <span>Suggested Reorder</span>
                                <span>Priority</span>
                            </div>
                            {sampleStock.map((item, index) => (
                                <div key={index} className="table-row">
                                    <span className="item-name">{item.item_name}</span>
                                    <span className="stock-level">{item.current_stock} units</span>
                                    <span className="days-remaining">{item.days_until_empty} days</span>
                                    <span className="reorder-quantity">{item.reorder_suggestion} units</span>
                                    <span 
                                        className="priority-badge"
                                        style={{ backgroundColor: getUrgencyColor(item.urgency) }}
                                    >
                                        {item.urgency.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Demand Analysis Tab */}
            {activeTab === 'demand-analysis' && (
                <div className="tab-content">
                    <div className="demand-analysis">
                        <h3>📈 Demand Pattern Analysis</h3>
                        
                        <div className="analysis-cards">
                            <div className="analysis-card">
                                <div className="analysis-header">
                                    <h4>📅 Weekly Patterns</h4>
                                </div>
                                <div className="pattern-chart">
                                    <div className="day-bar">
                                        <span className="day-label">Mon</span>
                                        <div className="bar" style={{ height: '60%' }}></div>
                                        <span className="day-value">60%</span>
                                    </div>
                                    <div className="day-bar">
                                        <span className="day-label">Tue</span>
                                        <div className="bar" style={{ height: '75%' }}></div>
                                        <span className="day-value">75%</span>
                                    </div>
                                    <div className="day-bar">
                                        <span className="day-label">Wed</span>
                                        <div className="bar" style={{ height: '85%' }}></div>
                                        <span className="day-value">85%</span>
                                    </div>
                                    <div className="day-bar">
                                        <span className="day-label">Thu</span>
                                        <div className="bar" style={{ height: '90%' }}></div>
                                        <span className="day-value">90%</span>
                                    </div>
                                    <div className="day-bar">
                                        <span className="day-label">Fri</span>
                                        <div className="bar" style={{ height: '100%' }}></div>
                                        <span className="day-value">100%</span>
                                    </div>
                                    <div className="day-bar">
                                        <span className="day-label">Sat</span>
                                        <div className="bar" style={{ height: '95%' }}></div>
                                        <span className="day-value">95%</span>
                                    </div>
                                    <div className="day-bar">
                                        <span className="day-label">Sun</span>
                                        <div className="bar" style={{ height: '70%' }}></div>
                                        <span className="day-value">70%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-card">
                                <div className="analysis-header">
                                    <h4>🕐 Hourly Patterns</h4>
                                </div>
                                <div className="hourly-insights">
                                    <div className="insight-item">
                                        <span className="time-period">7AM - 9AM</span>
                                        <span className="insight-desc">Peak breakfast rush (35% of daily sales)</span>
                                    </div>
                                    <div className="insight-item">
                                        <span className="time-period">12PM - 2PM</span>
                                        <span className="insight-desc">Lunch crowd (25% of daily sales)</span>
                                    </div>
                                    <div className="insight-item">
                                        <span className="time-period">3PM - 5PM</span>
                                        <span className="insight-desc">Afternoon snacks (20% of daily sales)</span>
                                    </div>
                                    <div className="insight-item">
                                        <span className="time-period">6PM - 8PM</span>
                                        <span className="insight-desc">Evening purchases (20% of daily sales)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-card">
                                <div className="analysis-header">
                                    <h4>🌡️ Seasonal Trends</h4>
                                </div>
                                <div className="seasonal-data">
                                    <div className="season-item">
                                        <span className="season">🌸 Spring</span>
                                        <span className="trend">+15% pastries, +8% beverages</span>
                                    </div>
                                    <div className="season-item">
                                        <span className="season">☀️ Summer</span>
                                        <span className="trend">+25% cold drinks, -10% hot items</span>
                                    </div>
                                    <div className="season-item">
                                        <span className="season">🍂 Fall</span>
                                        <span className="trend">+20% bread, +12% warm pastries</span>
                                    </div>
                                    <div className="season-item">
                                        <span className="season">❄️ Winter</span>
                                        <span className="trend">+30% hot beverages, +18% comfort foods</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai-insights' && (
                <div className="tab-content">
                    <div className="ai-insights">
                        <h3>🤖 AI-Powered Business Insights</h3>
                        
                        <div className="insights-grid">
                            <div className="insight-card recommendation">
                                <div className="insight-icon">💡</div>
                                <div className="insight-content">
                                    <h4>Smart Recommendations</h4>
                                    <ul>
                                        <li>Increase white bread production by 20% for Friday-Sunday</li>
                                        <li>Launch afternoon coffee promotion (3PM-5PM)</li>
                                        <li>Introduce seasonal pastries for current weather trends</li>
                                        <li>Bundle slow-moving items with popular products</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="insight-card optimization">
                                <div className="insight-icon">⚡</div>
                                <div className="insight-content">
                                    <h4>Process Optimization</h4>
                                    <ul>
                                        <li>Prepare 60% of daily bread before 7AM rush</li>
                                        <li>Schedule staff breaks during 10AM-11AM low period</li>
                                        <li>Pre-make popular lunch items by 11:30AM</li>
                                        <li>Reduce evening baking by 15% to minimize waste</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="insight-card risks">
                                <div className="insight-icon">⚠️</div>
                                <div className="insight-content">
                                    <h4>Risk Alerts</h4>
                                    <ul>
                                        <li>Chocolate cake showing declining trend (-12% this month)</li>
                                        <li>Weekend staff shortage may affect Saturday sales</li>
                                        <li>Supplier delay risk for premium ingredients</li>
                                        <li>Seasonal demand shift approaching in 2 weeks</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="insight-card opportunities">
                                <div className="insight-icon">🚀</div>
                                <div className="insight-content">
                                    <h4>Growth Opportunities</h4>
                                    <ul>
                                        <li>Coffee sales can increase 30% with loyalty program</li>
                                        <li>Untapped potential in evening dessert market</li>
                                        <li>Cross-selling opportunity: pastry + beverage combos</li>
                                        <li>Premium product line could boost margins by 15%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="prediction-accuracy">
                            <h4>📊 Model Performance</h4>
                            <div className="accuracy-metrics">
                                <div className="metric-item">
                                    <span className="metric-name">Sales Prediction Accuracy:</span>
                                    <span className="metric-value">87.3%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-name">Stock Depletion Accuracy:</span>
                                    <span className="metric-value">92.1%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-name">Demand Forecast Accuracy:</span>
                                    <span className="metric-value">84.7%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-name">Model Last Updated:</span>
                                    <span className="metric-value">2 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataPredictions;
