const mysql = require('mysql2/promise');

// Update these values to match your MySQL configuration
const dbConfig = {
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'bakeshop' // Replace with your actual database name
};

module.exports = {
  getConnection: async () => {
    return await mysql.createConnection(dbConfig);
  },
  dbConfig
};
