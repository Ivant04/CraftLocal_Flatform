require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Local Craft Backend running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error('[UnhandledRejection Error]:', err.message);
      // Keep server running in dev or close gracefully
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error('[UncaughtException Error]:', err.message);
      console.error(err.stack);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
