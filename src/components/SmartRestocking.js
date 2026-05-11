import React, { Component } from 'react';

class SmartRestocking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventoryItems: [],
      salesData: [],
      lowStockThreshold: 10, // Default threshold
      criticalStockThreshold: 5, // New critical stock threshold
      fastMovingThreshold: 50, // Default sales count for fast-moving
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      // Fetch inventory items
      const response = await fetch('/api/analytics/smart-restocking-data');
      const result = await response.json();

      if (result.success && result.data) {
        const inventoryItems = Array.isArray(result.data.inventoryItems) ? result.data.inventoryItems : [];
        const salesData = Array.isArray(result.data.salesData) ? result.data.salesData : [];
        this.setState({ inventoryItems, salesData });
      } else {
        console.error('API returned an error or no data:', result.message);
        this.setState({ inventoryItems: [], salesData: [] });
      }
    } catch (error) {
      console.error('Error fetching data for smart restocking:', error);
    }
  };

  // Low Stock Detection
  getLowStockItems = () => {
    const { inventoryItems, lowStockThreshold } = this.state;
    return (inventoryItems || []).filter(item => item.quantity <= lowStockThreshold);
  };

  // Fast-Moving Product Monitoring
  getFastMovingProducts = () => {
    const { inventoryItems, salesData, fastMovingThreshold } = this.state;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = (salesData || []).filter(sale => new Date(sale.saleDate) >= thirtyDaysAgo);

    const productSales = recentSales.reduce((acc, sale) => {
      acc[sale.itemId] = (acc[sale.itemId] || 0) + sale.quantity;
      return acc;
    }, {});

    return (inventoryItems || []).filter(item => productSales[item.id] >= fastMovingThreshold);
  };

  // Automatic Restock Recommendations and Suggested Reorder Quantity
  getRestockRecommendations = () => {
    const { inventoryItems, salesData, lowStockThreshold } = this.state;
    const recommendations = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = (salesData || []).filter(sale => new Date(sale.saleDate) >= thirtyDaysAgo);

    const salesHistory = {}; // { itemId: [{saleDate, quantity}, ...] }
    recentSales.forEach(sale => {
      if (!salesHistory[sale.itemId]) {
        salesHistory[sale.itemId] = [];
      }
      salesHistory[sale.itemId].push(sale);
    });

    (inventoryItems || []).forEach(item => {
      if (item.quantity <= lowStockThreshold) {
        const itemRecentSales = salesHistory[item.id] || [];
        const totalRecentSalesQuantity = itemRecentSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const avgDailySales = totalRecentSalesQuantity / 30; // Average over last 30 days

        // Reorder enough for 7 days of average sales, plus buffer to reach lowStockThreshold + 5
        const targetStock = lowStockThreshold + 5; // Aim for 5 units above threshold
        const neededForFutureSales = Math.ceil(avgDailySales * 7);
        const reorderQuantity = Math.max(0, neededForFutureSales + targetStock - item.quantity);
        
        if (reorderQuantity > 0) {
          recommendations.push({
            item,
            reason: 'Low Stock',
            suggestedQuantity: Math.max(5, reorderQuantity), // Minimum reorder of 5
          });
        }
      }
    });

    return recommendations;
  };

  render() {
    const lowStockItems = this.getLowStockItems();
    const fastMovingProducts = this.getFastMovingProducts();
    const restockRecommendations = this.getRestockRecommendations();

    const totalItems = (this.state.inventoryItems || []).length;
    const lowStockCount = lowStockItems.length;
    const fastMovingCount = fastMovingProducts.length;
    const recommendationsCount = restockRecommendations.length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Smart Restocking Dashboard</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Comprehensive insights and recommendations for efficient inventory management.
        </p>

        {/* Summary Analytics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {/* Card 1: Total Products */}
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Total Products</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalItems}</p>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>All items in inventory</span>
          </div>

          {/* Card 2: Low Stock Items */}
          <div style={{ background: 'linear-gradient(135deg, #f6d365, #fda085)', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Low Stock Items</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{lowStockCount}</p>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Below threshold ({this.state.lowStockThreshold})</span>
          </div>

          {/* Card 3: Fast-Moving Products */}
          <div style={{ background: 'linear-gradient(135deg, #84fab0, #8fd3f4)', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Fast-Moving Products</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{fastMovingCount}</p>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>High sales in last 30 days</span>
          </div>

          {/* Card 4: Restock Recommendations */}
          <div style={{ background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', color: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Restock Recommendations</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{recommendationsCount}</p>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Items needing replenishment</span>
          </div>
        </div>

        {/* Low Stock Detection (Reorder Alerts & Notifications) */}
        <div style={{ marginBottom: '40px', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#e53e3e', marginBottom: '15px' }}>🚨 Low Stock Alerts & Notifications</h3>
          {lowStockItems.length === 0 ? (
            <p style={{ color: '#555' }}>No items are currently below the low stock threshold. All good!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Product Name</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Current Stock</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Min Stock Level</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => {
                    const stockStatus = item.quantity <= this.state.criticalStockThreshold ? 'Critical' : 'Low';
                    const statusColor = item.quantity <= this.state.criticalStockThreshold ? '#e53e3e' : '#f6ad55';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#333' }}>{item.itemName}</td>
                        <td style={{ padding: '12px 15px', color: statusColor, fontWeight: 'bold' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 15px', color: '#555' }}>{this.state.lowStockThreshold}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: statusColor,
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}>
                            {stockStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fast-Moving Products Monitoring */}
        <div style={{ marginBottom: '40px', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#3182ce', marginBottom: '15px' }}>⚡ Fast-Moving Products Monitoring</h3>
          {fastMovingProducts.length === 0 ? (
            <p style={{ color: '#555' }}>No products currently identified as fast-moving in the last 30 days.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Product Name</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Current Stock</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Sold (30 Days)</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Demand Indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {fastMovingProducts.map(item => {
                    const totalSales = (this.state.salesData || []).filter(sale => sale.itemId === item.id && new Date(sale.saleDate) >= thirtyDaysAgo).reduce((sum, sale) => sum + sale.quantity, 0);
                    const demandIndicator = totalSales >= this.state.fastMovingThreshold ? 'High Demand' : 'Moderate Demand';
                    const demandColor = totalSales >= this.state.fastMovingThreshold ? '#3182ce' : '#4299e1';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#333' }}>{item.itemName}</td>
                        <td style={{ padding: '12px 15px', color: '#555' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 15px', color: '#3182ce', fontWeight: 'bold' }}>{totalSales}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: demandColor,
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}>
                            {demandIndicator}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Restock Recommendations */}
        <div style={{ marginBottom: '40px', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#38a169', marginBottom: '15px' }}>📦 Restock Recommendations</h3>
          {restockRecommendations.length === 0 ? (
            <p style={{ color: '#555' }}>No restock recommendations at this time. Inventory levels are healthy.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Product Name</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Current Stock</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Suggested Quantity</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {restockRecommendations.map(rec => (
                    <tr key={rec.item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#333' }}>{rec.item.itemName}</td>
                      <td style={{ padding: '12px 15px', color: '#555' }}>{rec.item.quantity}</td>
                      <td style={{ padding: '12px 15px', color: '#007bff', fontWeight: 'bold' }}>{rec.suggestedQuantity}</td>
                      <td style={{ padding: '12px 15px', color: '#555' }}>{rec.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SmartRestocking;
