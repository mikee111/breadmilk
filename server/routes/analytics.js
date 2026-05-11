const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper function to execute queries and release connection
async function executeQuery(query, params = []) {
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.execute(query, params);
        return rows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get inventory analytics
router.get('/inventory', async (req, res) => {
    try {
        // Stock velocity
        const velocityQuery = `SELECT * FROM stock_velocity ORDER BY avg_daily_sales DESC LIMIT 10`;
        
        // ABC Analysis
        const abcQuery = `
            SELECT abc_category, COUNT(*) as count, 
                   SUM(item_value) as total_value
            FROM abc_analysis 
            GROUP BY abc_category
        `;
        
        // Category performance
        const categoryQuery = `
            SELECT category, 
                   COUNT(*) as item_count,
                   SUM(quantity) as total_quantity,
                   SUM(quantity * price) as total_value,
                   SUM(CASE WHEN quantity <= 10 THEN 1 ELSE 0 END) as low_stock_count
            FROM inventory 
            GROUP BY category
        `;

        const velocity = await executeQuery(velocityQuery);
        const abc = await executeQuery(abcQuery);
        const categories = await executeQuery(categoryQuery);

        res.json({
            success: true,
            data: {
                velocity,
                abc_analysis: abc,
                category_performance: categories
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get demand forecasting
router.get('/forecasting/:period', async (req, res) => {
    try {
        const period = req.params.period || 30;
        
        const forecastQuery = `
            SELECT i.item_id, i.item_name, i.category, i.quantity,
                   COALESCE(v.avg_daily_sales, 0) as avg_daily_sales,
                   COALESCE(v.avg_daily_sales * ?, 0) as predicted_demand,
                   CASE 
                       WHEN v.avg_daily_sales > 0 THEN 85 + (RAND() * 15)
                       ELSE 50 + (RAND() * 30)
                   END as confidence_level
            FROM inventory i
            LEFT JOIN stock_velocity v ON i.item_id = v.item_id
            ORDER BY v.avg_daily_sales DESC
            LIMIT 12
        `;

        const forecast = await executeQuery(forecastQuery, [period]);

        res.json({
            success: true,
            data: forecast.map(item => ({
                ...item,
                trend: item.predicted_demand > item.avg_daily_sales * 7 ? 'increasing' : 
                       item.predicted_demand < item.avg_daily_sales * 7 ? 'decreasing' : 'stable',
                recommendation: item.quantity < item.predicted_demand ? 
                    `Restock ${Math.ceil(item.predicted_demand - item.quantity + 10)} units` :
                    'Current stock sufficient'
            }))
        });
    } catch (error) {
        console.error('Forecasting error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get data for Smart Restocking
router.get('/smart-restocking-data', async (req, res) => {
    try {
        const inventoryItems = await executeQuery(`SELECT * FROM inventory`);
        const salesData = await executeQuery(`SELECT * FROM sales`); // Assuming a 'sales' table exists

        res.json({
            success: true,
            data: {
                inventoryItems,
                salesData
            }
        });
    } catch (error) {
        console.error('Smart Restocking data error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Temporary endpoint to check data counts
router.get('/check-data', async (req, res) => {
    try {
        const inventoryCount = await executeQuery(`SELECT COUNT(*) as count FROM inventory`);
        const salesCount = await executeQuery(`SELECT COUNT(*) as count FROM sales`);

        res.json({
            success: true,
            data: {
                inventoryCount: inventoryCount[0].count,
                salesCount: salesCount[0].count
            }
        });
    } catch (error) {
        console.error('Check data error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
