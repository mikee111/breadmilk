const express = require('express');
const app = express();
const db = require('./database');

// Import analytics routes
const analyticsRoutes = require('./routes/analytics');

// Middleware and other routes here

// Use analytics routes
app.use('/api/analytics', analyticsRoutes);

// Error handling and server start here

module.exports = app;

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));