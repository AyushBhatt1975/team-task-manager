require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./models'); // load associations

const app = express();

// Middleware
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '*';
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Team Task Manager API is running', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]');
  console.error('Error Stack:', err.stack);
  console.error('Request Method:', req.method);
  console.error('Request URL:', req.url);
  console.error('Request Body:', req.body);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only send stack in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ WARNING: JWT_SECRET is not set. Auth will fail!');
    }

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync all models
    // alter: true can fail in some dialects (like Postgres) with complex constraints
    // force: true will drop and recreate tables (use with caution)
    const syncOptions = { alter: true };
    if (process.env.DB_FORCE_SYNC === 'true') {
      console.log('⚠️ DB_FORCE_SYNC is enabled. Dropping and recreating tables...');
      syncOptions.force = true;
      syncOptions.alter = false;
    }

    try {
      await sequelize.sync(syncOptions);
      console.log('✅ Database synced');
    } catch (syncErr) {
      console.error('❌ Database sync failed:', syncErr.message);
      console.log('💡 Tip: If this is a new deployment, try setting the environment variable DB_FORCE_SYNC=true once to initialize the schema.');
      throw syncErr;
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
