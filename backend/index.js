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

// Database connection
const { Pool } = require('pg');
let pool = null;

// Initialize database connection with retry logic
async function initializeDatabase() {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}...`);
      
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout
      });
      
      // Test connection
      const client = await pool.connect();
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

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'CarMarket API is running',
      uptime: process.uptime(),
      database: dbStatus
    });
  } catch (error) {
    // Even in unexpected cases, keep health 200 for platform readiness
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'CarMarket API is running',
      uptime: process.uptime(),
      database: { status: 'unknown' }
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

app.get('/api/me', authenticateToken, (req, res) => {
  console.log('👤 Me endpoint requested');
  res.json({
    success: true,
    user: { id: req.user.id, username: req.user.username, email: req.user.email }
  });
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

    res.json({
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
    });
  } catch (error) {
    console.error('Listings error:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  console.log(`📋 Single listing endpoint requested for ID: ${req.params.id}`);
  
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

    res.json({
      success: true,
      data: { listing: result.rows[0] }
    });
  } catch (error) {
    console.error('Single listing error:', error);
    res.status(500).json({ message: 'Failed to fetch listing' });
  }
});

app.get('/api/listings/filters/options', async (req, res) => {
  console.log('🔍 Filter options endpoint requested');
  
  try {
    const [
      makes, models, bodyTypes, fuelTypes, transmissions, conditions, colors,
      drivetrains, steeringWheels, customs, generations, engineVolumes
    ] = await Promise.all([
      pool.query('SELECT DISTINCT make FROM listings WHERE make IS NOT NULL ORDER BY make'),
      pool.query('SELECT DISTINCT model FROM listings WHERE model IS NOT NULL ORDER BY model'),
      pool.query('SELECT DISTINCT body_type FROM listings WHERE body_type IS NOT NULL ORDER BY body_type'),
      pool.query('SELECT DISTINCT fuel_type FROM listings WHERE fuel_type IS NOT NULL ORDER BY fuel_type'),
      pool.query('SELECT DISTINCT transmission FROM listings WHERE transmission IS NOT NULL ORDER BY transmission'),
      pool.query('SELECT DISTINCT condition FROM listings WHERE condition IS NOT NULL ORDER BY condition'),
      pool.query('SELECT DISTINCT color FROM listings WHERE color IS NOT NULL ORDER BY color'),
      pool.query('SELECT DISTINCT drivetrain FROM listings WHERE drivetrain IS NOT NULL ORDER BY drivetrain'),
      pool.query('SELECT DISTINCT steering_wheel FROM listings WHERE steering_wheel IS NOT NULL ORDER BY steering_wheel'),
      pool.query('SELECT DISTINCT customs FROM listings WHERE customs IS NOT NULL ORDER BY customs'),
      pool.query('SELECT DISTINCT generation FROM listings WHERE generation IS NOT NULL ORDER BY generation'),
      pool.query('SELECT DISTINCT engine_volume FROM listings WHERE engine_volume IS NOT NULL ORDER BY engine_volume')
    ]);

    // Get min/max values for ranges
    const [priceRange, yearRange, mileageRange] = await Promise.all([
      pool.query('SELECT MIN(price) as min_price, MAX(price) as max_price FROM listings WHERE price > 0'),
      pool.query('SELECT MIN(year) as min_year, MAX(year) as max_year FROM listings WHERE year > 0'),
      pool.query('SELECT MIN(mileage) as min_mileage, MAX(mileage) as max_mileage FROM listings WHERE mileage > 0')
    ]);

    res.json({
      success: true,
      data: {
        makes: makes.rows.map(row => row.make),
        models: models.rows.map(row => row.model),
        bodyTypes: bodyTypes.rows.map(row => row.body_type),
        fuelTypes: fuelTypes.rows.map(row => row.fuel_type),
        transmissions: transmissions.rows.map(row => row.transmission),
        conditions: conditions.rows.map(row => row.condition),
        colors: colors.rows.map(row => row.color),
        drivetrains: drivetrains.rows.map(row => row.drivetrain),
        steeringWheels: steeringWheels.rows.map(row => row.steering_wheel),
        customs: customs.rows.map(row => row.customs),
        generations: generations.rows.map(row => row.generation),
        engineSizes: engineVolumes.rows.map(row => row.engine_volume),
        min_price: priceRange.rows[0]?.min_price || 0,
        max_price: priceRange.rows[0]?.max_price || 100000,
        min_year: yearRange.rows[0]?.min_year || 1990,
        max_year: yearRange.rows[0]?.max_year || new Date().getFullYear(),
        min_mileage: mileageRange.rows[0]?.min_mileage || 0,
        max_mileage: mileageRange.rows[0]?.max_mileage || 200000
      }
    });
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
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
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

    app.listen(PORT, () => {
      console.log(`🚀 CarMarket server running on port ${PORT}`);
      console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
      console.log(`📋 API endpoints available at: http://localhost:${PORT}/api`);
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
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (pool) {
    pool.end();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  if (pool) {
    pool.end();
  }
  process.exit(0);
});

// Start the server
startServer();