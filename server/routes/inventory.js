const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Make sure you have this package installed

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',  // Update with your actual password if needed
  database: 'bakeshop'
};

// Get all inventory items
router.get('/items', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM inventory');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ message: 'Failed to fetch inventory items', error: error.message });
  }
});

// Add new inventory item(s)
router.post('/items', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    // Handle both single item and array of items
    const items = Array.isArray(req.body) ? req.body : [req.body];
    
    const results = [];
    
    for (const item of items) {
      // Validate required fields
      if (!item.item_name || !item.quantity || !item.price || !item.category) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: item_name, quantity, price, category'
        });
      }

      // Insert item (item_id will be auto-generated)
      const query = `
        INSERT INTO inventory (item_name, quantity, price, category, created_at, \`updated-at\`)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.execute(query, [
        item.item_name,
        parseInt(item.quantity),
        parseFloat(item.price),
        item.category
      ]);
      
      results.push({
        item_id: result.insertId,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      });
    }
    
    res.json({
      success: true,
      message: `Successfully added ${results.length} item(s)`,
      data: results
    });
    
  } catch (error) {
    console.error('Error adding items:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    });
  }
});

// Get items by category
router.get('/items/category/:categoryId', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM inventory WHERE category_id = ?',
      [req.params.categoryId]
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items by category:', error);
    res.status(500).json({ message: 'Failed to fetch items by category', error: error.message });
  }
});

// Update an item
router.put('/items/:itemId', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { item_name, quantity, price, category } = req.body;
    
    const [result] = await connection.execute(
      'UPDATE inventory SET item_name = ?, quantity = ?, price = ?, category = ? WHERE item_id = ?',
      [item_name, quantity, price, category, req.params.itemId]
    );
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Item not found' });
    } else {
      res.json({ message: 'Item updated successfully' });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
});

// Add this route to handle the alternative update endpoint
router.put('/items/update/:itemId', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { item_name, quantity, price, category } = req.body;
    
    const [result] = await connection.execute(
      'UPDATE inventory SET item_name = ?, quantity = ?, price = ?, category = ? WHERE item_id = ?',
      [item_name, quantity, price, category, req.params.itemId]
    );
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Item not found' });
    } else {
      res.json({ message: 'Item updated successfully' });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
});

module.exports = router;