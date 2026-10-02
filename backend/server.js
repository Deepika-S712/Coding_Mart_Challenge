const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow development frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'College Management Admin API is online',
    timestamp: new Date().toISOString(),
  });
});

// Admin REST API Routes
app.use('/api/admin', authRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/admin', studentRoutes);
app.use('/api/admin', facultyRoutes);
app.use('/api/admin', departmentRoutes);
app.use('/api/admin', courseRoutes);
app.use('/api/admin', subjectRoutes);
app.use('/api/admin', timetableRoutes);
app.use('/api/admin', reportRoutes);

// Catch 404 and Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(`🚀 College Management Admin API running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================`);
  });
}

module.exports = app;
