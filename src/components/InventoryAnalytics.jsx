import React, { useState, useEffect } from 'react';
import './InventoryAnalytics.css';

const InventoryAnalytics = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/inventory/items');
            if (response.ok) {
                const data = await response.json();
                setInventoryData(data);
            } else {
                throw new Error('Failed to fetch inventory data');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const getInventoryStats = () => {
        const totalItems = inventoryData.length;
        const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const lowStockItems = inventoryData.filter(item => item.quantity <= 10);
        const outOfStockItems = inventoryData.filter(item => item.quantity === 0);
        const categories = [...new Set(inventoryData.map(item => item.category))].filter(Boolean);

        return {
            totalItems,
            totalValue,
            lowStockCount: lowStockItems.length,
            outOfStockCount: outOfStockItems.length,
            categoriesCount: categories.length,
            avgItemValue: totalItems > 0 ? totalValue / totalItems : 0
        };
    };

    const getCategoryBreakdown = () => {
        const categories = {};
        inventoryData.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = {
                    count: 0,
                    totalValue: 0,
                    lowStock: 0
                };
            }
            categories[category].count++;
            categories[category].totalValue += item.quantity * item.price;
            if (item.quantity <= 10) categories[category].lowStock++;
        });
        return categories;
    };

    const getFilteredItems = () => {
        if (selectedCategory === 'all') return inventoryData;
        return inventoryData.filter(item => 
            (item.category || 'Uncategorized') === selectedCategory
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="inventory-analytics">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading inventory analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-analytics">
                <div className="error-container">
                    <p>❌ {error}</p>
                    <button onClick={fetchInventoryData} className="retry-btn">
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    const stats = getInventoryStats();
    const categoryData = getCategoryBreakdown();
    const filteredItems = getFilteredItems();

    return (
        <div className="inventory-analytics">
            <div className="analytics-header">
                <h1>📊 Inventory Analytics</h1>
                <div className="header-actions">
                    <button onClick={fetchInventoryData} className="refresh-btn">
                        🔄 Refresh Data
                    </button>
                    <button className="export-btn">
                        📤 Export Report
                    </button>
                </div>
            </div>

            {/* Analytics Tabs */}
            <div className="analytics-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📈 Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    📂 Categories
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    ⚠️ Stock Alerts
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="tab-content">
                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card total-items">
                            <div className="kpi-icon">📦</div>
                            <div className="kpi-info">
                                <div className="kpi-value">{stats.totalItems}</div>
                                <div className="kpi-label">Total Items</div>
                            </div>
                        </div>
                        <div className="kpi-card total-value">
                            <div className="kpi-icon">💰</div>
                            <div className="kpi-info">
                                <div className="kpi-value">{formatCurrency(stats.totalValue)}</div>
                                <div className="kpi-label">Total Value</div>
                            </div>
                        </div>
                        <div className="kpi-card low-stock">
                            <div className="kpi-icon">⚠️</div>
                            <div className="kpi-info">
                                <div className="kpi-value">{stats.lowStockCount}</div>
                                <div className="kpi-label">Low Stock Items</div>
                            </div>
                        </div>
                        <div className="kpi-card categories">
                            <div className="kpi-icon">📂</div>
                            <div className="kpi-info">
                                <div className="kpi-value">{stats.categoriesCount}</div>
                                <div className="kpi-label">Categories</div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="inventory-table-section">
                        <h3>📋 Inventory Overview</h3>
                        <div className="table-container">
                            <div className="table-header">
                                <span>Item Name</span>
                                <span>Category</span>
                                <span>Quantity</span>
                                <span>Price</span>
                                <span>Total Value</span>
                                <span>Status</span>
                            </div>
                            {inventoryData.slice(0, 10).map(item => (
                                <div key={item.item_id} className="table-row">
                                    <span className="item-name">{item.item_name}</span>
                                    <span className="item-category">
                                        <div className="category-tag">{item.category || 'Uncategorized'}</div>
                                    </span>
                                    <span className="item-quantity">{item.quantity}</span>
                                    <span className="item-price">{formatCurrency(item.price)}</span>
                                    <span className="item-total-value">
                                        {formatCurrency(item.quantity * item.price)}
                                    </span>
                                    <span className={`item-status ${
                                        item.quantity === 0 ? 'out-stock' :
                                        item.quantity <= 10 ? 'low-stock' : 'in-stock'
                                    }`}>
                                        {item.quantity === 0 ? 'Out of Stock' :
                                         item.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {inventoryData.length > 10 && (
                            <div className="view-all-btn">
                                <button>View All {inventoryData.length} Items</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="tab-content">
                    <div className="categories-header">
                        <h3>📂 Category Analysis</h3>
                        <div className="category-filter">
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="category-select"
                            >
                                <option value="all">All Categories</option>
                                {Object.keys(categoryData).map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category Cards */}
                    <div className="categories-grid">
                        {Object.entries(categoryData).map(([category, data]) => (
                            <div key={category} className="category-card">
                                <div className="category-header">
                                    <h4>📂 {category}</h4>
                                    <span className="category-count">{data.count} items</span>
                                </div>
                                <div className="category-stats">
                                    <div className="stat">
                                        <span className="stat-label">Total Value:</span>
                                        <span className="stat-value">{formatCurrency(data.totalValue)}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Low Stock:</span>
                                        <span className={`stat-value ${data.lowStock > 0 ? 'warning' : 'good'}`}>
                                            {data.lowStock} items
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Avg Value:</span>
                                        <span className="stat-value">
                                            {formatCurrency(data.totalValue / data.count)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filtered Items List */}
                    {selectedCategory !== 'all' && (
                        <div className="filtered-items">
                            <h4>Items in {selectedCategory}</h4>
                            <div className="items-table">
                                <div className="table-header">
                                    <span>Item Name</span>
                                    <span>Quantity</span>
                                    <span>Price</span>
                                    <span>Total Value</span>
                                    <span>Status</span>
                                </div>
                                {filteredItems.map(item => (
                                    <div key={item.item_id} className="table-row">
                                        <span className="item-name">{item.item_name}</span>
                                        <span className="item-qty">{item.quantity}</span>
                                        <span className="item-price">{formatCurrency(item.price)}</span>
                                        <span className="item-total">
                                            {formatCurrency(item.quantity * item.price)}
                                        </span>
                                        <span className={`item-status ${
                                            item.quantity === 0 ? 'out-stock' :
                                            item.quantity <= 10 ? 'low-stock' : 'in-stock'
                                        }`}>
                                            {item.quantity === 0 ? 'Out' :
                                             item.quantity <= 10 ? 'Low' : 'Good'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="tab-content">
                    <div className="alerts-section">
                        <h3>⚠️ Stock Alerts</h3>
                        
                        {/* Critical Alerts */}
                        <div className="alert-group">
                            <h4>🚨 Critical (Out of Stock)</h4>
                            {inventoryData.filter(item => item.quantity === 0).length === 0 ? (
                                <div className="no-alerts">
                                    <p>✅ No items are out of stock!</p>
                                </div>
                            ) : (
                                <div className="alerts-list">
                                    {inventoryData
                                        .filter(item => item.quantity === 0)
                                        .map(item => (
                                            <div key={item.item_id} className="alert-item critical">
                                                <div className="alert-icon">🚨</div>
                                                <div className="alert-info">
                                                    <div className="alert-title">{item.item_name}</div>
                                                    <div className="alert-message">
                                                        Out of stock - requires immediate attention
                                                    </div>
                                                    <div className="alert-action">
                                                        Recommended: Order immediately
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Warning Alerts */}
                        <div className="alert-group">
                            <h4>⚠️ Warning (Low Stock)</h4>
                            {inventoryData.filter(item => item.quantity > 0 && item.quantity <= 10).length === 0 ? (
                                <div className="no-alerts">
                                    <p>✅ No items are at low stock levels!</p>
                                </div>
                            ) : (
                                <div className="alerts-list">
                                    {inventoryData
                                        .filter(item => item.quantity > 0 && item.quantity <= 10)
                                        .map(item => (
                                            <div key={item.item_id} className="alert-item warning">
                                                <div className="alert-icon">⚠️</div>
                                                <div className="alert-info">
                                                    <div className="alert-title">{item.item_name}</div>
                                                    <div className="alert-message">
                                                        Only {item.quantity} units remaining
                                                    </div>
                                                    <div className="alert-action">
                                                        Recommended: Restock within 3-5 days
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Recommendations */}
                        <div className="recommendations">
                            <h4>💡 Smart Recommendations</h4>
                            <div className="recommendation-cards">
                                <div className="recommendation-card">
                                    <div className="rec-icon">📈</div>
                                    <div className="rec-content">
                                        <div className="rec-title">Optimize Stock Levels</div>
                                        <div className="rec-description">
                                            {stats.lowStockCount > 0 ? 
                                                `${stats.lowStockCount} items need restocking to maintain optimal levels` :
                                                'All items are well-stocked! Great inventory management!'
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="recommendation-card">
                                    <div className="rec-icon">💰</div>
                                    <div className="rec-content">
                                        <div className="rec-title">Inventory Investment</div>
                                        <div className="rec-description">
                                            Total inventory value: {formatCurrency(stats.totalValue)}
                                            <br />Average per item: {formatCurrency(stats.avgItemValue)}
                                        </div>
                                    </div>
                                </div>
                                <div className="recommendation-card">
                                    <div className="rec-icon">📊</div>
                                    <div className="rec-content">
                                        <div className="rec-title">Category Balance</div>
                                        <div className="rec-description">
                                            You have {stats.categoriesCount} categories with balanced distribution
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryAnalytics;
