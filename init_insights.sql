-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS expense_manager;
USE expense_manager;

-- Create expenses table with exact structure
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255),
    amount DECIMAL(10,2),
    date DATE,
    description TEXT
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_manager.* TO 'user'@'%';
FLUSH PRIVILEGES;