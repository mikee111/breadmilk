-- Users table for authentication
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- Store hashed passwords only
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'staff',  -- 'admin', 'staff', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Categories table
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory items table
CREATE TABLE inventory_items (
  item_id VARCHAR(50) PRIMARY KEY,  -- Your custom ID format
  item_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  low_stock_threshold INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Inventory transaction history
CREATE TABLE inventory_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  item_id VARCHAR(50) NOT NULL,
  user_id INT,
  transaction_type ENUM('add', 'remove', 'update', 'restock') NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (item_id) REFERENCES inventory_items(item_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert some default categories
INSERT INTO categories (name, description) VALUES
('Chips', 'Snack foods like potato chips and similar items'),
('Bread', 'All bread products'),
('Beverages', 'Drinks including water, soda, and juice'),
('Canned Goods', 'Preserved foods in cans'),
('Dairy', 'Milk, cheese, and other dairy products'),
('Misc', 'Miscellaneous items');
