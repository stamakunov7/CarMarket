require('dotenv').config();

console.log('🚀 Starting CarMarket application...');
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

// Basic health endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'CarMarket API is running',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.json({
    message: 'CarMarket API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  console.log('🧪 Origin:', req.headers.origin);
  res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Mock API endpoints for testing
app.get('/api/listings', (req, res) => {
  console.log('📋 Listings endpoint requested');
  console.log('📋 Origin:', req.headers.origin);
  console.log('📋 User-Agent:', req.headers['user-agent']);
  console.log('📋 Query params:', req.query);
  res.json({
    success: true,
    data: {
      listings: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      }
    },
    message: 'No listings found'
  });
});

app.get('/api/listings/:id', (req, res) => {
  console.log(`📋 Single listing endpoint requested for ID: ${req.params.id}`);
  res.status(404).json({
    success: false,
    message: 'Listing not found'
  });
});

app.get('/api/listings/filters/options', (req, res) => {
  console.log('🔍 Filter options endpoint requested');
  res.json({
    success: true,
    data: {
      makes: [],
      models: [],
      bodyTypes: [],
      fuelTypes: [],
      transmissions: [],
      conditions: [],
      colors: []
    }
  });
});

// Auth endpoints (mock)
app.post('/api/register', (req, res) => {
  console.log('👤 Register endpoint requested');
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: { id: 1, username: req.body.username, email: req.body.email }
  });
});

app.post('/api/login', (req, res) => {
  console.log('🔐 Login endpoint requested');
  res.json({
    success: true,
    message: 'Login successful',
    user: { id: 1, username: 'testuser', email: req.body.email },
    token: 'mock-jwt-token'
  });
});

app.get('/api/me', (req, res) => {
  console.log('👤 Me endpoint requested');
  res.json({
    success: true,
    user: { id: 1, username: 'testuser', email: 'test@example.com' }
  });
});

// User listings endpoints (mock)
app.get('/api/users/me/listings', (req, res) => {
  console.log('📋 User listings endpoint requested');
  res.json({
    success: true,
    listings: []
  });
});

app.post('/api/users/me/listings', (req, res) => {
  console.log('➕ Create listing endpoint requested');
  res.status(201).json({
    success: true,
    message: 'Listing created successfully',
    listing: { id: 1, ...req.body }
  });
});

// Support endpoint
app.post('/api/support', (req, res) => {
  console.log('📧 Support endpoint requested');
  res.json({
    success: true,
    message: 'Support request received'
  });
});

console.log('🔧 Starting server...');
const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`🚀 CarMarket server running on port ${PORT}`);
    console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
    console.log(`📋 API endpoints available at: http://localhost:${PORT}/api`);
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