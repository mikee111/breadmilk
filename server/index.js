// Import routes
const inventoryRoutes = require('./routes/inventory');
const categoriesRoutes = require('./routes/categories');

// Make sure you've added these middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoriesRoutes);