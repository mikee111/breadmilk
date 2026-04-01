const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ...existing code from your original server.js...
// (Copy all the content from c:\bakeshop\server.js)

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bakeshop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ...rest of your existing server code...
