import React from 'react';
import AddItemsTable from './AddItemsTable';
import './AddNewItemPage.css';

export default function AddNewItemPage() {
  const handleAddRow = () => {
    // Your logic for adding a new row
    console.log("Add row button clicked");
  };

  return (
    <div className="add-item-page-root" style={{ display: 'flex', minHeight: '100vh' }}>
      <nav className="sidebar-menu" style={{
        width: 240,
        background: '#5363f6',
        color: '#111',
        paddingTop: 32,
        fontSize: 18,
        minHeight: '100vh'
      }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 28 }}>User Login and Logout</li>
          <li style={{ marginBottom: 8 }}>Add and Updates<br />Inventory Items</li>
          <li style={{
            marginBottom: 28,
            background: '#b6e3b6',
            borderRadius: 4,
            padding: '6px 8px'
          }}>
            Add Items
          </li>
          <li style={{ marginBottom: 28 }}>Update Items</li>
          <li style={{ marginBottom: 28 }}>Delete Products</li>
          <li style={{ marginBottom: 28 }}>View Inventory List</li>
          <li style={{ marginBottom: 28 }}>Low Stocks Alert</li>
        </ul>
      </nav>
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        <div className="add-item-table-container">
          <AddItemsTable />
        </div>
        <button className="add-item-btn" onClick={handleAddRow}>
          <span className="add-item-btn-icon">+</span>
          Add New Item
        </button>
      </div>
    </div>
  );
}
