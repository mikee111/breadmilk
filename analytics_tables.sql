-- First, let's check what tables exist and fix the references
-- If your inventory table has a different name, we need to update the views

-- 1. Sales History for Trend Analysis (Remove foreign key constraint)
CREATE TABLE IF NOT EXISTS sales_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id VARCHAR(50),
    item_name VARCHAR(255),
    quantity_sold INT,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    sale_date DATE,
    sale_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory Movement Log (Remove foreign key constraint)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id VARCHAR(50),
    movement_type ENUM('IN', 'OUT', 'ADJUST'),
    quantity_before INT,
    quantity_change INT,
    quantity_after INT,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Demand Forecasting Data (Remove foreign key constraint)
CREATE TABLE IF NOT EXISTS demand_forecast (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id VARCHAR(50),
    forecast_date DATE,
    predicted_demand INT,
    confidence_level DECIMAL(5,2),
    forecast_model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Analytics Cache for Performance
CREATE TABLE IF NOT EXISTS analytics_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100),
    metric_value TEXT,
    calculation_date DATE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Views for Quick Analytics (Fix table name to 'inventory')

-- Stock Velocity View
CREATE OR REPLACE VIEW stock_velocity AS
SELECT 
    i.item_id,
    i.item_name,
    i.category,
    i.quantity as current_stock,
    COALESCE(SUM(s.quantity_sold), 0) as total_sold_30d,
    COALESCE(SUM(s.quantity_sold) / 30, 0) as avg_daily_sales,
    CASE 
        WHEN i.quantity > 0 AND SUM(s.quantity_sold) > 0 
        THEN i.quantity / (SUM(s.quantity_sold) / 30)
        ELSE NULL 
    END as days_of_stock
FROM inventory i
LEFT JOIN sales_history s ON i.item_id = s.item_id 
    AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY i.item_id, i.item_name, i.category, i.quantity;

-- ABC Analysis View (Fixed table name)
CREATE OR REPLACE VIEW abc_analysis AS
SELECT 
    item_id,
    item_name,
    category,
    (quantity * price) as item_value,
    CASE 
        WHEN (quantity * price) >= (
            SELECT AVG(quantity * price) * 2 FROM inventory WHERE quantity > 0
        ) THEN 'A'
        WHEN (quantity * price) >= (
            SELECT AVG(quantity * price) FROM inventory WHERE quantity > 0
        ) THEN 'B'
        ELSE 'C'
    END as abc_category
FROM inventory
WHERE quantity > 0;

-- Critical Items View (Fixed table name)
CREATE OR REPLACE VIEW critical_items_view AS
SELECT 
    i.item_id,
    i.item_name,
    i.category,
    i.quantity,
    i.price,
    CASE 
        WHEN i.quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN i.quantity <= 5 THEN 'CRITICAL'
        WHEN i.quantity <= 10 THEN 'LOW'
        ELSE 'NORMAL'
    END as stock_status,
    0 as avg_daily_sales,
    999 as days_of_stock
FROM inventory i
WHERE i.quantity <= 10
ORDER BY i.quantity ASC;

-- Insert some sample data for testing
INSERT IGNORE INTO sales_history (item_id, item_name, quantity_sold, unit_price, total_amount, sale_date, sale_time)
VALUES 
('ITEM001', 'Sample Item 1', 5, 10.00, 50.00, CURDATE(), CURTIME()),
('ITEM002', 'Sample Item 2', 3, 15.00, 45.00, CURDATE(), CURTIME()),
('ITEM003', 'Sample Item 3', 8, 8.00, 64.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CURTIME());

-- Insert sample movement data
INSERT IGNORE INTO inventory_movements (item_id, movement_type, quantity_before, quantity_change, quantity_after, reason)
VALUES 
('ITEM001', 'OUT', 20, -5, 15, 'Sale'),
('ITEM002', 'OUT', 25, -3, 22, 'Sale'),
('ITEM003', 'IN', 10, 20, 30, 'Restock');
