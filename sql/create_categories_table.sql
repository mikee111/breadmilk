-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sales predictions table
CREATE TABLE IF NOT EXISTS sales_predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    predicted_date DATE,
    predicted_quantity INT,
    predicted_revenue DECIMAL(10,2),
    confidence_level DECIMAL(5,2),
    prediction_model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Stock predictions table
CREATE TABLE IF NOT EXISTS stock_predictions (
    stock_prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    current_stock INT,
    predicted_stock_out_date DATE,
    suggested_reorder_quantity INT,
    suggested_reorder_date DATE,
    prediction_accuracy DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Analytics cache table for better performance
CREATE TABLE IF NOT EXISTS analytics_cache (
    cache_id INT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(100) NOT NULL UNIQUE,
    cache_data JSON,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Historical sales trends table
CREATE TABLE IF NOT EXISTS sales_trends (
    trend_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    trend_date DATE,
    avg_daily_sales DECIMAL(8,2),
    sales_velocity DECIMAL(8,2),
    seasonal_factor DECIMAL(5,2),
    trend_direction ENUM('increasing', 'decreasing', 'stable'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    UNIQUE KEY unique_item_date (item_id, trend_date)
);

-- Insert default categories
INSERT IGNORE INTO categories (name, description) VALUES
('Bread', 'Various types of bread and baked goods'),
('Pastries', 'Sweet pastries and desserts'),
('Beverages', 'Drinks and liquid refreshments'),
('Ingredients', 'Baking ingredients and supplies'),
('Seasonal', 'Seasonal and special occasion items');
