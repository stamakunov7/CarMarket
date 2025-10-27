require('dotenv').config();

console.log('🚀 Starting CarMarket application (DEBUG MODE)...');
console.log('📊 Environment check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Present' : '❌ Missing');
console.log('  - REDIS_URL:', process.env.REDIS_URL ? '✅ Present' : '❌ Missing');

console.log('🔧 Initializing Express app...');
const express = require('express');
const app = express();

console.log('🔧 Setting up basic middleware...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('🔧 Setting up CORS...');
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

console.log('🔧 Setting up basic health endpoint...');
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Debug mode - basic health check',
    uptime: process.uptime()
  });
});

console.log('🔧 Setting up basic root endpoint...');
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.json({
    message: 'CarMarket API - Debug Mode',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

console.log('🔧 Starting server...');
const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`🚀 CarMarket server running on port ${PORT}`);
    console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
    console.log('✅ Application startup completed successfully!');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
