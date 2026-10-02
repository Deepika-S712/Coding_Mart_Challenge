const express = require('express');
const cors = require('cors');
const accountantRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[Accountant API] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    module: 'Accountant Module Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Accountant API Router
app.use('/api/accountant', accountantRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
