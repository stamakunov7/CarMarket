console.log('🔧 Loading dotenv...');
require('dotenv').config();
console.log('✅ Dotenv loaded');

console.log('🚀 Starting CarMarket application with full database integration...');
console.log('📊 Environment check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Present' : '❌ Missing');
console.log('  - REDIS_URL:', process.env.REDIS_URL ? '✅ Present' : '❌ Missing');
console.log('  - TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Present' : '❌ Missing');
console.log('  - TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? '✅ Present' : '❌ Missing');

console.log('🔧 Initializing Express app...');
const express = require('express');
const app = express();
console.log('✅ Express loaded');

console.log('🔧 Setting up middleware...');
// Behind Railway/Vercel proxies, trust the X-Forwarded-* headers
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Basic middleware set');

console.log('🔧 Setting up CORS...');
const cors = require('cors');
console.log('✅ CORS loaded');
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://car-market-sage.vercel.app',
    'https://car-market-sage.vercel.app/'
  ],
  credentials: true
}));

// Security middleware
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/api', generalLimiter);
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);

// Simple caching system (Redis with in-memory fallback)
let redisClient = null;
let redisConnected = false;
const inMemoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let redisHeartbeatInterval = null;

// Helper function to get Redis URL from various Railway environment variables
function getRedisUrl() {
  // Priority 1: REDIS_URL (Railway automatically provides this when services are linked)
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  // Priority 2: REDIS_PUBLIC_URL (for cross-service connections via TCP proxy)
  if (process.env.REDIS_PUBLIC_URL) {
    return process.env.REDIS_PUBLIC_URL;
  }
  
  // Priority 3: Build URL from individual components (Railway provides these)
  if (process.env.REDISHOST && process.env.REDISPORT) {
    const user = process.env.REDISUSER || 'default';
    const password = process.env.REDISPASSWORD || process.env.REDIS_PASSWORD || '';
    const host = process.env.REDISHOST;
    const port = process.env.REDISPORT || '6379';
    
    if (password) {
      return `redis://${user}:${password}@${host}:${port}`;
    } else {
      return `redis://${user}@${host}:${port}`;
    }
  }
  
  return null;
}

// Initialize Redis connection with retry logic (similar to database)
async function initializeRedis() {
  const redisUrl = getRedisUrl();
  
  if (!redisUrl) {
    console.log('ℹ️  Redis not configured, using in-memory cache only');
    console.log('💡 Railway will provide REDIS_URL automatically when Redis service is linked');
    return false;
  }

  console.log('🔗 Redis URL detected (host hidden for security)');
  
  const maxRetries = 10; // Railway Redis can be slow to wake
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Redis connection attempt ${attempt}/${maxRetries}...`);
      
      const { createClient } = require('redis');
      
      // Close previous connection if exists
      if (redisClient) {
        try {
          await redisClient.quit();
        } catch (e) {
          // Ignore errors when closing
        }
      }

      redisClient = createClient({ 
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 20) {
              console.warn('⚠️ Redis: Max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis Client Error:', err.message);
        redisConnected = false;
      });
      
      redisClient.on('connect', () => {
        console.log('🔄 Redis connecting...');
      });
      
      redisClient.on('ready', () => {
        console.log('✅ Redis ready');
        redisConnected = true;
      });
      
      redisClient.on('end', () => {
        console.warn('⚠️ Redis connection ended');
        redisConnected = false;
      });
      
      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Connect with timeout
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
      ]);

      // Test connection with ping
      await Promise.race([
        redisClient.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 5000))
      ]);

      console.log('✅ Redis connected for caching');
      redisConnected = true;

      // Start heartbeat to keep Redis awake (ping every 30 seconds)
      startRedisHeartbeat();

      return true;
    } catch (error) {
      console.error(`❌ Redis connection attempt ${attempt} failed:`, error.message);
      redisConnected = false;
      
      if (attempt === maxRetries) {
        console.warn('⚠️ Redis not available after retries, using in-memory cache only');
        console.warn('💡 Redis may be sleeping on Railway. It will wake up on first connection.');
        redisClient = null;
        return false;
      }
      
      console.log(`⏳ Waiting ${retryDelay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return false;
}

// Heartbeat to keep Redis awake on Railway
function startRedisHeartbeat() {
  if (redisHeartbeatInterval) {
    clearInterval(redisHeartbeatInterval);
  }
  
  redisHeartbeatInterval = setInterval(async () => {
    if (redisClient && redisConnected) {
      try {
        await Promise.race([
          redisClient.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Heartbeat timeout')), 3000))
        ]);
      } catch (error) {
        console.warn('⚠️ Redis heartbeat failed:', error.message);
        redisConnected = false;
      }
    }
  }, 30000); // Ping every 30 seconds to keep Railway Redis awake
}

// Initialize Redis in background
initializeRedis().then((connected) => {
  if (connected) {
    console.log('✅ Redis initialization complete');
  } else {
    console.log('ℹ️  Redis initialization skipped, using in-memory cache');
  }
}).catch((e) => {
  console.error('❌ Unexpected Redis init error:', e);
});

// Helper function to try reconnecting Redis if needed (lightweight reconnect)
async function ensureRedisConnection() {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return false;
  
  // If we have a client but it's not connected, try to reconnect
  if (redisClient && !redisConnected) {
    try {
      // Check if client is still valid, if not create new one
      try {
        await Promise.race([
          redisClient.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 2000))
        ]);
        redisConnected = true;
        return true;
      } catch (pingError) {
        // Connection lost, try to reconnect the existing client
        try {
          await redisClient.connect();
          await redisClient.ping();
          redisConnected = true;
          startRedisHeartbeat();
          console.log('✅ Redis reconnected successfully');
          return true;
        } catch (reconnectError) {
          // Reconnection failed, will use fallback
          redisConnected = false;
        }
      }
    } catch (e) {
      redisConnected = false;
    }
  }
  
  // If no client exists but Redis URL is configured, try full initialization (but only once)
  if (!redisClient && redisUrl) {
    try {
      console.log('🔄 Attempting to connect to Redis...');
      await initializeRedis();
    } catch (e) {
      // Silently fail - will use fallback cache
    }
  }
  
  return redisConnected;
}

// Cache helper functions
async function getCached(key) {
  // Try to reconnect if Redis is not connected but was configured
  const redisUrl = getRedisUrl();
  if (redisUrl && (!redisClient || !redisConnected)) {
    await ensureRedisConnection();
  }
  
  if (redisClient && redisConnected) {
    try {
      const cached = await Promise.race([
        redisClient.get(key),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis get timeout')), 2000))
      ]);
      if (cached) {
        console.log(`✅ Cache hit (Redis): ${key}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis get error:', error.message);
      redisConnected = false;
    }
  }
  
  // Fallback to in-memory cache
  const item = inMemoryCache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    console.log(`✅ Cache hit (Memory): ${key}`);
    return item.data;
  }
  
  if (item) inMemoryCache.delete(key);
  return null;
}

async function setCache(key, data, ttlSeconds = 300) {
  // Try to reconnect if Redis is not connected but was configured
  const redisUrl = getRedisUrl();
  if (redisUrl && (!redisClient || !redisConnected)) {
    await ensureRedisConnection();
  }
  
  if (redisClient && redisConnected) {
    try {
      await Promise.race([
        redisClient.setEx(key, ttlSeconds, JSON.stringify(data)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis set timeout')), 2000))
      ]);
      console.log(`✅ Data cached (Redis): ${key}`);
      return;
    } catch (error) {
      console.warn('Redis set error:', error.message);
      redisConnected = false;
    }
  }
  
  // Fallback to in-memory cache
  inMemoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`✅ Data cached (Memory): ${key}`);
}

async function clearCache(pattern) {
  // Clear all listing-related cache when data changes
  if (redisClient && redisConnected) {
    try {
      const keys = await Promise.race([
        redisClient.keys(pattern),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis keys timeout')), 2000))
      ]);
      if (keys.length > 0) {
        await Promise.race([
          redisClient.del(keys),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redis del timeout')), 2000))
        ]);
        console.log(`✅ Cleared ${keys.length} cache entries (Redis): ${pattern}`);
      }
    } catch (error) {
      console.warn('Redis clear error:', error.message);
      redisConnected = false;
    }
  }
  
  // Clear in-memory cache
  for (const key of inMemoryCache.keys()) {
    if (key.includes(pattern.replace('*', ''))) {
      inMemoryCache.delete(key);
    }
  }
}

// Response time logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${logMessage}`);
    } else if (duration > 100) {
      console.log(`⏱️ ${logMessage}`);
    }
  });
  next();
});

// Database connection
const { Pool } = require('pg');
let pool = null;

// Initialize database connection with retry logic
async function initializeDatabase() {
  const maxRetries = 10; // free tier can be slow to wake
  const retryDelay = 8000; // 8 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}...`);
      
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      // close any previous pool before re-creating
      if (pool) {
        try { await pool.end(); } catch (e) {}
      }

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        statement_timeout: 30000,
      });
      
      // Guard connection attempt with timeout
      const client = await Promise.race([
        pool.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 12000))
      ]);
      console.log('✅ Database connected successfully');
      
      // Create all necessary tables
      await createTables(client);
      client.release();
      
      console.log('✅ Database tables created/verified');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('❌ All database connection attempts failed');
        console.error('❌ This might be because PostgreSQL is sleeping on Railway free tier');
        console.error('❌ Continuing to run server without DB; will require manual intervention');
        return false;
      }
      
      console.log(`⏳ Waiting ${retryDelay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Create all database tables
async function createTables(client) {
  // Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index on email for faster lookups
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);

  // Listings table with all fields
  await client.query(`
    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      make VARCHAR(50),
      model VARCHAR(50),
      year INTEGER,
      mileage INTEGER,
      manufacturer VARCHAR(50),
      engine VARCHAR(100),
      drivetrain VARCHAR(20),
      location VARCHAR(200),
      owner_phone VARCHAR(20),
      generation VARCHAR(100),
      body_type VARCHAR(50),
      color VARCHAR(50),
      fuel_type VARCHAR(30),
      engine_volume DECIMAL(3,1),
      engine_power INTEGER,
      transmission VARCHAR(30),
      steering_wheel VARCHAR(20),
      condition VARCHAR(30),
      customs VARCHAR(20),
      region VARCHAR(100),
      registration VARCHAR(20),
      exchange_possible BOOLEAN DEFAULT FALSE,
      availability BOOLEAN DEFAULT TRUE,
      contact_person VARCHAR(100),
      tags VARCHAR(200),
      equipment TEXT,
      service_history TEXT,
      owners_count INTEGER DEFAULT 1,
      vin VARCHAR(17),
      registration_number VARCHAR(20),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings (user_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_listings_status ON listings (status)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings (created_at)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_listings_make ON listings (make)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_listings_price ON listings (price)
  `);

  // Listing images table
  await client.query(`
    CREATE TABLE IF NOT EXISTS listing_images (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      cloudinary_public_id VARCHAR(200),
      is_primary BOOLEAN DEFAULT FALSE,
      image_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Support messages table
  await client.query(`
    CREATE TABLE IF NOT EXISTS support_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// JWT utilities
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Telegram integration
const axios = require('axios');

async function sendTelegramMessage(message) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.warn('⚠️ Telegram credentials not configured');
      return { success: false, error: 'Telegram not configured' };
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Telegram error:', error.message);
    return { success: false, error: error.message };
  }
}

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    let dbStatus = { status: 'disconnected' };
    if (pool) {
      try {
        const dbStart = Date.now();
        await pool.query('SELECT 1');
        const dbDuration = Date.now() - dbStart;
        dbStatus = { status: 'connected', responseTime: `${dbDuration}ms` };
      } catch (err) {
        dbStatus = { status: 'disconnected', error: 'query_failed' };
      }
    }

    let redisStatus = { status: 'not_configured' };
    const redisUrl = getRedisUrl();
    
    if (redisUrl) {
      if (redisClient) {
        try {
          if (redisConnected) {
            const redisStart = Date.now();
            await Promise.race([
              redisClient.ping(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 2000))
            ]);
            const redisDuration = Date.now() - redisStart;
            redisStatus = { status: 'connected', responseTime: `${redisDuration}ms`, cacheType: 'Redis' };
          } else {
            redisStatus = { status: 'disconnected', cacheType: 'Redis (fallback to memory)' };
          }
        } catch (err) {
          redisStatus = { status: 'disconnected', error: 'ping_failed', cacheType: 'Memory fallback' };
          redisConnected = false;
        }
      } else {
        redisStatus = { status: 'configured_but_not_connected', cacheType: 'Redis (connecting...)', note: 'Redis URL is configured but connection not established yet' };
      }
    } else {
      redisStatus = { status: 'not_configured', cacheType: 'In-memory only' };
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'CarMarket API is running',
      uptime: process.uptime(),
      database: dbStatus,
      redis: redisStatus
    });
  } catch (error) {
    // Even in unexpected cases, keep health 200 for platform readiness
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'CarMarket API is running',
      uptime: process.uptime(),
      database: { status: 'unknown' },
      redis: { status: 'unknown' }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CarMarket API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth endpoints
app.post('/api/register', async (req, res) => {
  console.log('👤 Register endpoint requested');
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    console.log(`✅ User registered: ${username} (${email})`);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('🔐 Login endpoint requested');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    console.log(`✅ User logged in: ${user.username} (${email})`);
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
  console.log('👤 Me endpoint requested');
  try {
    // Fetch full user data including created_at from database
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
});

// Listings endpoints
app.get('/api/listings', async (req, res) => {
  console.log('📋 Listings endpoint requested');
  const { 
    page = 1, 
    limit = 12,
    make, 
    model, 
    minPrice, 
    maxPrice, 
    minYear, 
    maxYear, 
    minMileage, 
    maxMileage,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    status = 'active',
    // Additional filters
    engineSize,
    transmission,
    drivetrain,
    fuelType,
    bodyType,
    condition,
    customsStatus,
    steeringWheel,
    color,
    generation
  } = req.query;

  // Create cache key based on query parameters
  const cacheKey = `listings:${JSON.stringify(req.query)}`;
  
  // Try to get from cache first
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    return res.json({
      ...cachedData,
      cached: true
    });
  }

  try {
    const offset = (page - 1) * limit;
    let whereConditions = ['l.status = $1'];
    let queryParams = [status];
    let paramCount = 1;

    // Build WHERE clause
    if (make) {
      paramCount++;
      whereConditions.push(`l.make ILIKE $${paramCount}`);
      queryParams.push(`%${make}%`);
    }
    if (model) {
      paramCount++;
      whereConditions.push(`l.model ILIKE $${paramCount}`);
      queryParams.push(`%${model}%`);
    }
    if (minPrice) {
      paramCount++;
      whereConditions.push(`l.price >= $${paramCount}`);
      queryParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      paramCount++;
      whereConditions.push(`l.price <= $${paramCount}`);
      queryParams.push(parseFloat(maxPrice));
    }
    if (minYear) {
      paramCount++;
      whereConditions.push(`l.year >= $${paramCount}`);
      queryParams.push(parseInt(minYear));
    }
    if (maxYear) {
      paramCount++;
      whereConditions.push(`l.year <= $${paramCount}`);
      queryParams.push(parseInt(maxYear));
    }
    if (minMileage) {
      paramCount++;
      whereConditions.push(`l.mileage >= $${paramCount}`);
      queryParams.push(parseInt(minMileage));
    }
    if (maxMileage) {
      paramCount++;
      whereConditions.push(`l.mileage <= $${paramCount}`);
      queryParams.push(parseInt(maxMileage));
    }
    if (search) {
      paramCount++;
      whereConditions.push(`(l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }
    if (engineSize) {
      paramCount++;
      whereConditions.push(`l.engine_volume = $${paramCount}`);
      queryParams.push(parseFloat(engineSize));
    }
    if (transmission) {
      paramCount++;
      whereConditions.push(`l.transmission ILIKE $${paramCount}`);
      queryParams.push(`%${transmission}%`);
    }
    if (drivetrain) {
      paramCount++;
      whereConditions.push(`l.drivetrain ILIKE $${paramCount}`);
      queryParams.push(`%${drivetrain}%`);
    }
    if (fuelType) {
      paramCount++;
      whereConditions.push(`l.fuel_type ILIKE $${paramCount}`);
      queryParams.push(`%${fuelType}%`);
    }
    if (bodyType) {
      paramCount++;
      whereConditions.push(`l.body_type ILIKE $${paramCount}`);
      queryParams.push(`%${bodyType}%`);
    }
    if (condition) {
      paramCount++;
      whereConditions.push(`l.condition ILIKE $${paramCount}`);
      queryParams.push(`%${condition}%`);
    }
    if (customsStatus) {
      paramCount++;
      whereConditions.push(`l.customs ILIKE $${paramCount}`);
      queryParams.push(`%${customsStatus}%`);
    }
    if (steeringWheel) {
      paramCount++;
      whereConditions.push(`l.steering_wheel ILIKE $${paramCount}`);
      queryParams.push(`%${steeringWheel}%`);
    }
    if (color) {
      paramCount++;
      whereConditions.push(`l.color ILIKE $${paramCount}`);
      queryParams.push(`%${color}%`);
    }
    if (generation) {
      paramCount++;
      whereConditions.push(`l.generation ILIKE $${paramCount}`);
      queryParams.push(`%${generation}%`);
    }

    // Validate sort parameters
    const validSortFields = ['created_at', 'price', 'year', 'mileage', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Count total listings
    const countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get listings with pagination
    paramCount++;
    queryParams.push(parseInt(limit));
    paramCount++;
    queryParams.push(offset);

    const listingsQuery = `
      SELECT l.*, u.username,
        (SELECT image_url FROM listing_images li 
         WHERE li.listing_id = l.id AND li.is_primary = true 
         LIMIT 1) as primary_image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY l.${sortField} ${sortDirection}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await pool.query(listingsQuery, queryParams);

    const responseData = {
      success: true,
      data: {
        listings: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: result.rows.length === 0 ? 'No listings found' : 'Listings retrieved successfully'
    };

    // Cache the response (cache for 5 minutes, but don't cache search results)
    if (!search) {
      await setCache(cacheKey, responseData, 300);
    }

    res.json(responseData);
  } catch (error) {
    console.error('Listings error:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  console.log(`📋 Single listing endpoint requested for ID: ${req.params.id}`);
  
  // Try cache first
  const cacheKey = `listing:${req.params.id}`;
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    return res.json({
      ...cachedData,
      cached: true
    });
  }
  
  try {
    const result = await pool.query(
      `SELECT l.*, u.username,
        (SELECT array_agg(
          json_build_object(
            'id', li.id,
            'image_url', li.image_url,
            'is_primary', li.is_primary,
            'image_order', li.image_order
          ) ORDER BY li.image_order
        ) FROM listing_images li WHERE li.listing_id = l.id) as images
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const responseData = {
      success: true,
      data: { listing: result.rows[0] }
    };

    // Cache the response for 5 minutes
    await setCache(cacheKey, responseData, 300);

    res.json(responseData);
  } catch (error) {
    console.error('Single listing error:', error);
    res.status(500).json({ message: 'Failed to fetch listing' });
  }
});

app.get('/api/listings/filters/options', async (req, res) => {
  console.log('🔍 Filter options endpoint requested');
  
  // Cache filter options for 10 minutes (they change rarely)
  const cacheKey = 'filter:options';
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    return res.json({
      ...cachedData,
      cached: true
    });
  }
  
  try {
    const [
      makes, modelsByMake, bodyTypes, fuelTypes, transmissions, conditions, colors,
      drivetrains, steeringWheels, customs, generations, engineVolumes
    ] = await Promise.all([
      pool.query('SELECT DISTINCT make FROM listings WHERE make IS NOT NULL AND status = $1 ORDER BY make', ['active']),
      pool.query('SELECT DISTINCT make, model FROM listings WHERE make IS NOT NULL AND model IS NOT NULL AND status = $1 ORDER BY make, model', ['active']),
      pool.query('SELECT DISTINCT body_type FROM listings WHERE body_type IS NOT NULL AND status = $1 ORDER BY body_type', ['active']),
      pool.query('SELECT DISTINCT fuel_type FROM listings WHERE fuel_type IS NOT NULL AND status = $1 ORDER BY fuel_type', ['active']),
      pool.query('SELECT DISTINCT transmission FROM listings WHERE transmission IS NOT NULL AND status = $1 ORDER BY transmission', ['active']),
      pool.query('SELECT DISTINCT condition FROM listings WHERE condition IS NOT NULL AND status = $1 ORDER BY condition', ['active']),
      pool.query('SELECT DISTINCT color FROM listings WHERE color IS NOT NULL AND status = $1 ORDER BY color', ['active']),
      pool.query('SELECT DISTINCT drivetrain FROM listings WHERE drivetrain IS NOT NULL AND status = $1 ORDER BY drivetrain', ['active']),
      pool.query('SELECT DISTINCT steering_wheel FROM listings WHERE steering_wheel IS NOT NULL AND status = $1 ORDER BY steering_wheel', ['active']),
      pool.query('SELECT DISTINCT customs FROM listings WHERE customs IS NOT NULL AND status = $1 ORDER BY customs', ['active']),
      pool.query('SELECT DISTINCT generation FROM listings WHERE generation IS NOT NULL AND status = $1 ORDER BY generation', ['active']),
      pool.query('SELECT DISTINCT engine_volume FROM listings WHERE engine_volume IS NOT NULL AND status = $1 ORDER BY engine_volume', ['active'])
    ]);

    // Group models by make
    const models = {};
    modelsByMake.rows.forEach(row => {
      if (!models[row.make]) {
        models[row.make] = [];
      }
      if (!models[row.make].includes(row.model)) {
        models[row.make].push(row.model);
      }
    });
    
    // Sort models within each make
    Object.keys(models).forEach(make => {
      models[make].sort();
    });

    // Get min/max values for ranges (only active listings)
    const [priceRange, yearRange, mileageRange] = await Promise.all([
      pool.query('SELECT MIN(price) as min_price, MAX(price) as max_price FROM listings WHERE price > 0 AND status = $1', ['active']),
      pool.query('SELECT MIN(year) as min_year, MAX(year) as max_year FROM listings WHERE year > 0 AND status = $1', ['active']),
      pool.query('SELECT MIN(mileage) as min_mileage, MAX(mileage) as max_mileage FROM listings WHERE mileage > 0 AND status = $1', ['active'])
    ]);

    const responseData = {
      success: true,
      data: {
        makes: makes.rows.map(row => row.make),
        models: models, // Now grouped by make
        body_types: bodyTypes.rows.map(row => row.body_type),
        fuel_types: fuelTypes.rows.map(row => row.fuel_type),
        transmission_types: transmissions.rows.map(row => row.transmission),
        conditions: conditions.rows.map(row => row.condition),
        colors: colors.rows.map(row => row.color),
        drivetrain_types: drivetrains.rows.map(row => row.drivetrain),
        steering_wheel_positions: steeringWheels.rows.map(row => row.steering_wheel),
        customs_status: customs.rows.map(row => row.customs),
        generations: generations.rows.map(row => row.generation),
        engine_sizes: engineVolumes.rows.map(row => parseFloat(row.engine_volume)).filter(v => !isNaN(v)).sort((a, b) => a - b),
        min_price: parseFloat(priceRange.rows[0]?.min_price) || 0,
        max_price: parseFloat(priceRange.rows[0]?.max_price) || 100000,
        min_year: parseInt(yearRange.rows[0]?.min_year) || 1990,
        max_year: parseInt(yearRange.rows[0]?.max_year) || new Date().getFullYear(),
        min_mileage: parseInt(mileageRange.rows[0]?.min_mileage) || 0,
        max_mileage: parseInt(mileageRange.rows[0]?.max_mileage) || 200000
      }
    };

    // Cache filter options for 10 minutes
    await setCache(cacheKey, responseData, 600);

    res.json(responseData);
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ message: 'Failed to fetch filter options' });
  }
});

// User listings endpoints
app.get('/api/users/me/listings', authenticateToken, async (req, res) => {
  console.log('📋 User listings endpoint requested');
  
  try {
    const result = await pool.query(
      `SELECT l.*, 
        (SELECT image_url FROM listing_images li 
         WHERE li.listing_id = l.id AND li.is_primary = true 
         LIMIT 1) as primary_image
      FROM listings l 
      WHERE l.user_id = $1 
      ORDER BY l.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    console.error('User listings error:', error);
    res.status(500).json({ message: 'Failed to fetch user listings' });
  }
});

app.post('/api/users/me/listings', authenticateToken, async (req, res) => {
  console.log('➕ Create listing endpoint requested');
  const { 
    title, description, price, make, model, year, mileage,
    manufacturer, engine, drivetrain, location, owner_phone,
    generation, body_type, color, fuel_type, engine_volume,
    engine_power, transmission, steering_wheel, condition,
    customs, region, registration, exchange_possible,
    availability, contact_person, tags, equipment,
    service_history, owners_count, vin, registration_number
  } = req.body;

  if (!title || !price) {
    return res.status(400).json({ message: 'Title and price are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (
        user_id, title, description, price, make, model, year, mileage,
        manufacturer, engine, drivetrain, location, owner_phone,
        generation, body_type, color, fuel_type, engine_volume,
        engine_power, transmission, steering_wheel, condition,
        customs, region, registration, exchange_possible,
        availability, contact_person, tags, equipment,
        service_history, owners_count, vin, registration_number
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
      ) RETURNING *`,
      [
        req.user.id, title, description, price, make, model, year, mileage,
        manufacturer, engine, drivetrain, location, owner_phone,
        generation, body_type, color, fuel_type, engine_volume,
        engine_power, transmission, steering_wheel, condition,
        customs, region, registration, exchange_possible,
        availability, contact_person, tags, equipment,
        service_history, owners_count, vin, registration_number
      ]
    );

    // Clear listings cache when new listing is created
    await clearCache('listings:*');
    
    console.log(`✅ Listing created: ${title} by ${req.user.username}`);
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
});

app.put('/api/users/me/listings/:id', authenticateToken, async (req, res) => {
  console.log(`✏️ Update listing endpoint requested for ID: ${req.params.id}`);
  
  try {
    // Check if listing belongs to user
    const ownershipCheck = await pool.query(
      'SELECT id FROM listings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found or access denied' });
    }

    const { title, description, price, make, model, year, mileage, status } = req.body;
    
    const result = await pool.query(
      `UPDATE listings SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        make = COALESCE($4, make),
        model = COALESCE($5, model),
        year = COALESCE($6, year),
        mileage = COALESCE($7, mileage),
        status = COALESCE($8, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING *`,
      [title, description, price, make, model, year, mileage, status, req.params.id, req.user.id]
    );

    // Clear cache for this listing and listings list
    await clearCache('listings:*');
    await clearCache(`listing:${req.params.id}`);
    
    console.log(`✅ Listing updated: ${req.params.id} by ${req.user.username}`);
    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

app.delete('/api/users/me/listings/:id', authenticateToken, async (req, res) => {
  console.log(`🗑️ Delete listing endpoint requested for ID: ${req.params.id}`);
  
  try {
    const result = await pool.query(
      'DELETE FROM listings WHERE id = $1 AND user_id = $2 RETURNING title',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found or access denied' });
    }

    // Clear cache
    await clearCache('listings:*');
    await clearCache(`listing:${req.params.id}`);
    
    console.log(`✅ Listing deleted: ${result.rows[0].title} by ${req.user.username}`);
    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

// Image upload endpoints
const { uploadMultiple, handleUploadError, cleanupTempFiles } = require('./middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('./config/cloudinary');

// Upload images for a listing
app.post('/api/listings/:id/images', authenticateToken, uploadMultiple, handleUploadError, async (req, res) => {
  console.log(`📸 Upload images endpoint requested for listing ID: ${req.params.id}`);
  
  try {
    // Check if listing belongs to user
    const ownershipCheck = await pool.query(
      'SELECT id FROM listings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found or access denied' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const cloudinaryResult = await uploadToCloudinary(file, `car-marketplace/listings/${req.params.id}`);
        
        if (cloudinaryResult.success) {
          // Save to database
          const isPrimary = i === 0; // First image is primary
          const result = await pool.query(
            'INSERT INTO listing_images (listing_id, image_url, cloudinary_public_id, is_primary, image_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.params.id, cloudinaryResult.url, cloudinaryResult.public_id, isPrimary, i]
          );
          
          uploadedImages.push(result.rows[0]);
        } else {
          errors.push(`Failed to upload ${file.originalname}: ${cloudinaryResult.error}`);
        }
      } catch (error) {
        errors.push(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    }

    // Cleanup temporary files
    cleanupTempFiles(req.files);

    if (uploadedImages.length === 0) {
      return res.status(400).json({ 
        message: 'No images were uploaded successfully',
        errors 
      });
    }

    console.log(`✅ ${uploadedImages.length} images uploaded for listing ${req.params.id}`);
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Image upload error:', error);
    cleanupTempFiles(req.files);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Compatibility route for older frontend path
app.post('/api/users/me/listings/:id/images', authenticateToken, uploadMultiple, handleUploadError, async (req, res) => {
  // Delegate to the same handler logic by calling the primary route
  req.params.id = req.params.id; // no-op for clarity
  console.log(`📸 (compat) Upload images via legacy path for listing ID: ${req.params.id}`);
  // Re-run the same logic by copying the handler body would duplicate code; instead, call the main handler functionally
  // For simplicity, forward handling here by repeating minimal checks
  try {
    const ownershipCheck = await pool.query(
      'SELECT id FROM listings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found or access denied' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }
    const uploadedImages = [];
    const errors = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const cloudinaryResult = await uploadToCloudinary(file, `car-marketplace/listings/${req.params.id}`);
        if (cloudinaryResult.success) {
          const isPrimary = i === 0;
          const result = await pool.query(
            'INSERT INTO listing_images (listing_id, image_url, cloudinary_public_id, is_primary, image_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.params.id, cloudinaryResult.url, cloudinaryResult.public_id, isPrimary, i]
          );
          uploadedImages.push(result.rows[0]);
        } else {
          errors.push(`Failed to upload ${file.originalname}: ${cloudinaryResult.error}`);
        }
      } catch (error) {
        errors.push(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    }
    cleanupTempFiles(req.files);
    if (uploadedImages.length === 0) {
      return res.status(400).json({ message: 'No images were uploaded successfully', errors });
    }
    console.log(`✅ (compat) ${uploadedImages.length} images uploaded for listing ${req.params.id}`);
    res.json({ success: true, message: `${uploadedImages.length} images uploaded successfully`, images: uploadedImages, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Image upload error (compat):', error);
    cleanupTempFiles(req.files);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete an image
app.delete('/api/listings/:listingId/images/:imageId', authenticateToken, async (req, res) => {
  console.log(`🗑️ Delete image endpoint requested for image ID: ${req.params.imageId}`);
  
  try {
    // Check if image belongs to user's listing
    const imageCheck = await pool.query(
      `SELECT li.*, l.user_id 
       FROM listing_images li 
       JOIN listings l ON li.listing_id = l.id 
       WHERE li.id = $1 AND l.user_id = $2`,
      [req.params.imageId, req.user.id]
    );

    if (imageCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    const image = imageCheck.rows[0];

    // Delete from Cloudinary
    if (image.cloudinary_public_id) {
      const cloudinaryResult = await deleteFromCloudinary(image.cloudinary_public_id);
      if (!cloudinaryResult.success) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryResult.error);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM listing_images WHERE id = $1', [req.params.imageId]);

    console.log(`✅ Image deleted: ${req.params.imageId}`);
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// Set primary image
app.put('/api/listings/:listingId/images/:imageId/primary', authenticateToken, async (req, res) => {
  console.log(`⭐ Set primary image endpoint requested for image ID: ${req.params.imageId}`);
  
  try {
    // Check if image belongs to user's listing
    const imageCheck = await pool.query(
      `SELECT li.*, l.user_id 
       FROM listing_images li 
       JOIN listings l ON li.listing_id = l.id 
       WHERE li.id = $1 AND l.user_id = $2`,
      [req.params.imageId, req.user.id]
    );

    if (imageCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    // Remove primary status from all other images of this listing
    await pool.query(
      'UPDATE listing_images SET is_primary = FALSE WHERE listing_id = $1',
      [req.params.listingId]
    );

    // Set this image as primary
    await pool.query(
      'UPDATE listing_images SET is_primary = TRUE WHERE id = $1',
      [req.params.imageId]
    );

    console.log(`✅ Primary image set: ${req.params.imageId}`);
    res.json({
      success: true,
      message: 'Primary image updated successfully'
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ message: 'Failed to set primary image' });
  }
});

// Support endpoint
app.post('/api/support', async (req, res) => {
  console.log('📧 Support endpoint requested');
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  try {
    // Save to database
    const dbResult = await pool.query(
      'INSERT INTO support_messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, subject, message]
    );

    // Format message for Telegram
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const telegramMessage = `
🚨 <b>New Support Request #${dbResult.rows[0].id}</b>

👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Subject:</b> ${subject}
💬 <b>Message:</b> ${message}
⏰ <b>Timestamp:</b> ${timestamp}
    `.trim();

    // Send to Telegram
    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (telegramResult.success) {
      console.log(`✅ Support message saved and sent: ${email}`);
      res.json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.'
      });
    } else {
      console.warn('⚠️ Support message saved but Telegram failed:', telegramResult.error);
      res.status(502).json({
        success: false,
        error: 'Failed to deliver message to Telegram. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Support form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.'
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Starting server...');
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CarMarket server running on port ${PORT}`);
      console.log(`🌐 Health check available at: http://0.0.0.0:${PORT}/health`);
      console.log(`📋 API endpoints available at: http://0.0.0.0:${PORT}/api`);
      console.log('✅ Application HTTP server started. Initializing database in background...');
    });

    // Initialize DB in background (non-blocking for healthcheck)
    initializeDatabase().then((ok) => {
      if (ok) {
        console.log('✅ Database ready');
      } else {
        console.warn('⚠️ Database not ready after retries');
      }
    }).catch((e) => {
      console.error('❌ Unexpected DB init error:', e);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('❌ Full error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  // Stop Redis heartbeat
  if (redisHeartbeatInterval) {
    clearInterval(redisHeartbeatInterval);
    redisHeartbeatInterval = null;
  }
  
  if (pool) {
    await pool.end();
  }
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch (e) {
      console.warn('Error closing Redis connection:', e.message);
    }
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  
  // Stop Redis heartbeat
  if (redisHeartbeatInterval) {
    clearInterval(redisHeartbeatInterval);
    redisHeartbeatInterval = null;
  }
  
  if (pool) {
    await pool.end();
  }
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch (e) {
      console.warn('Error closing Redis connection:', e.message);
    }
  }
  process.exit(0);
});

// Start the server
startServer();