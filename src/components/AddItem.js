import React, { useState, useEffect } from 'react';
import './AddNewItemPage.css';

export default function AddItemsTable({ onSave }) {
  const [rows, setRows] = useState([
    { name: '', quantity: '', price: '', category: '', itemID: '' }
  ]);

  const handleAddRow = () => {
    setRows([...rows, { name: '', quantity: '', price: '', category: '', itemID: '' }]);
  };

  const handleInputChange = (idx, field, value) => {
    const updated = rows.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    setRows(updated);
  };

  const handleSave = () => {
    if (onSave) onSave(rows);
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
            <th>Item ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <input
                  type="text"
                  value={row.name}
                  onChange={e => handleInputChange(i, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.quantity}
                  onChange={e => handleInputChange(i, 'quantity', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.price}
                  onChange={e => handleInputChange(i, 'price', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.category}
                  onChange={e => handleInputChange(i, 'category', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.itemID}
                  onChange={e => handleInputChange(i, 'itemID', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-item-btn" onClick={handleAddRow}>
        <span className="add-item-btn-icon">+</span>
        Add new Items
      </button>
      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

export function AllItemsTable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/inventory/items')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  return (
    <div className="all-items-table-container">
      <h2>All Items</h2>
      <table className="add-item-table">
        <thead>
          <tr>
            <th>Item name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Category</th>
            <th>Item ID</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.item_id || item.itemID || i}>
              <td>{item.item_name || item.itemName || item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.category}</td>
              <td>{item.item_id || item.itemID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}