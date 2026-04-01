const express = require('express');
const router = express.Router();
const db = require('../database'); // Your database connection

// Get all categories with item counts
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, COUNT(i.item_id) as item_count 
      FROM categories c
      LEFT JOIN inventory i ON c.category_id = i.category_id
      GROUP BY c.category_id
      ORDER BY c.name
    `);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ category_id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
