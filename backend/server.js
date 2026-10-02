const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    module: 'CMS Faculty Module',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

const PORT = config.port;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[CMS Faculty Backend] Running on http://localhost:${PORT}`);
    console.log(`[CMS Faculty Backend] Health: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
