import React, { useState } from 'react';
import './AddNewItemPage.css';

export default function AddItemsTable() {
  const [rows, setRows] = useState([{}, {}, {}, {}]); // 4 empty rows initially

  const handleAddRow = () => {
    setRows([...rows, {}]);
  };

  return (
    <div className="add-item-table-container">
      <table className="add-item-table">
        <thead>
          <tr>
            <th>Item name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, i) => (
            <tr key={i}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="add-item-btn"
        onClick={handleAddRow}
      >
        <span className="add-item-btn-icon">+</span>
        Add new Items
      </button>
    </div>
  );
}

// Add this component to your critical items menu/view in UserDashboard.js as needed.
// Example usage: <CriticalItemsList criticalItems={criticalItems} lowStockThreshold={10} />

export function CriticalItemsList({ criticalItems, lowStockThreshold = 10, showAlert, onRequestRestock, onMarkOrdered, onAddToRestock }) {
  // Helper for estimated days left (simple version)
  const estimateDaysLeft = (item) => {
    const avgDailyUsage = item.avg_daily_usage || 1;
    return avgDailyUsage > 0 ? Math.floor(item.quantity / avgDailyUsage) : 'N/A';
  };

  // Sort by urgency (lowest quantity first)
  const sorted = [...(criticalItems || [])].sort((a, b) => a.quantity - b.quantity);

  return (
    <div>
      {showAlert && (
        <div style={{
          background: '#ff9800',
          color: '#fff',
          padding: '12px',
          borderRadius: 6,
          marginBottom: 16,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ⚠️ Stock Alert: Some items are below the critical threshold!
        </div>
      )}
      {sorted.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No critical items.</p>
      ) : (
        <div>
          {sorted.map(item => {
            const below = lowStockThreshold - parseInt(item.quantity);
            return (
              <div key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                  padding: 16,
                  borderRadius: 8,
                  background: '#fff3e0',
                  border: '2px solid #ff9800',
                  boxShadow: '0 2px 8px rgba(255,152,0,0.08)'
                }}>
                <span style={{ flex: 2, color: '#d32f2f', fontWeight: 700 }}>
                  {item.name}
                </span>
                <span style={{ flex: 1, color: '#d32f2f', fontWeight: 600 }}>
                  {item.quantity} units
                  <span style={{ marginLeft: 8, color: '#ff5722', fontWeight: 500 }}>
                    ({below} below threshold)
                  </span>
                </span>
                <span style={{ flex: 1, color: '#888' }}>
                  Last Restocked: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                </span>
                <span style={{ flex: 1, color: '#1976d2', fontWeight: 600 }}>
                  Est. Days Left: {estimateDaysLeft(item)}
                </span>
                <span style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <button style={{
                    background: '#ff9800', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer'
                  }} onClick={() => onRequestRestock && onRequestRestock(item)}>Request Restock</button>
                  <button style={{
                    background: '#43a047', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer'
                  }} onClick={() => onMarkOrdered && onMarkOrdered(item)}>Mark as Ordered</button>
                  <button style={{
                    background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer'
                  }} onClick={() => onAddToRestock && onAddToRestock(item)}>Add to Restock List</button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// No changes needed here for your last request. 
// The CriticalItemsList component is already implemented with all the requested features:
// - Stock Threshold Indicator
// - Highlight Color
// - Sort by Urgency
// - Last Restocked Date
// - Auto-Generated Alert (via showAlert prop)
// - Quick Action Buttons
// - Estimated Days Left

// To use it, just import and render <CriticalItemsList /> in your UserDashboard.js as shown in previous responses.
