import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/database.js';
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✓ Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('✓ SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✓ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('✓ SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✓ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('✗ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

// Trigger restart
