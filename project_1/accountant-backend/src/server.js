require('dotenv').config();
const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Attempt database initialization
    await initDb();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[Accountant Backend] Server running on port ${PORT}`);
      console.log(`[Accountant Backend] API base: http://localhost:${PORT}/api/accountant`);
      console.log(`[Accountant Backend] Health check: http://localhost:${PORT}/health`);
      console.log('====================================================');
    });

    const shutdown = () => {
      console.log('\n[Accountant Backend] Shutting down gracefully...');
      server.close(() => {
        console.log('[Accountant Backend] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Accountant Backend] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
