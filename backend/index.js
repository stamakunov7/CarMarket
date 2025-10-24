// backend/index.js

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import winston from 'winston';
import compression from 'compression';
import { createClient } from 'redis';
import { uploadMultiple, handleUploadError, cleanupTempFiles } from './middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from './config/cloudinary.js';
import { initializeRailwayRedis, getCached, setCache, clearCache, getCacheStats, closeRedis } from './redis-config.js';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'car-marketplace-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Redis configuration
let redisClient = null;
const fallbackCache = new Map();
const CACHE_TTL = 5 * 60; // 5 minutes in seconds

// Initialize Redis connection (Railway optimized)
async function initializeRedis() {
  return await initializeRailwayRedis();
}

// Cache functions are now imported from redis-config.js

const app = express();
const port = process.env.PORT || 4000;

// Security: Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required!');
  process.exit(1);
}

// Check for database connection (Railway provides DATABASE_URL)
if (!process.env.DATABASE_URL && !process.env.PGPASSWORD) {
  console.error('❌ DATABASE_URL or PGPASSWORD environment variable is required!');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Настройка базы данных PostgreSQL (Railway optimized)
const pool = new pg.Pool({
  // Railway предоставляет DATABASE_URL автоматически
  connectionString: process.env.DATABASE_URL,
  // Fallback для локальной разработки (только если DATABASE_URL не установлен)
  ...(process.env.DATABASE_URL ? {} : {
    user: process.env.PGUSER || 'caruser',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'cardb',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
  }),
  // Railway оптимизации
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Увеличено для Railway
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Автоматическая инициализация базы данных
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Создание таблицы users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Создание таблицы listings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        make VARCHAR(50),
        model VARCHAR(50),
        year INTEGER,
        mileage INTEGER,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Добавление дополнительных колонок к таблице listings
    await pool.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(50),
      ADD COLUMN IF NOT EXISTS engine VARCHAR(100),
      ADD COLUMN IF NOT EXISTS drivetrain VARCHAR(20),
      ADD COLUMN IF NOT EXISTS location VARCHAR(200),
      ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS generation VARCHAR(100),
      ADD COLUMN IF NOT EXISTS body_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS color VARCHAR(50),
      ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(30),
      ADD COLUMN IF NOT EXISTS engine_volume DECIMAL(3,1),
      ADD COLUMN IF NOT EXISTS engine_power INTEGER,
      ADD COLUMN IF NOT EXISTS transmission VARCHAR(30),
      ADD COLUMN IF NOT EXISTS steering_wheel VARCHAR(20),
      ADD COLUMN IF NOT EXISTS condition VARCHAR(30),
      ADD COLUMN IF NOT EXISTS customs VARCHAR(20),
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS registration VARCHAR(20),
      ADD COLUMN IF NOT EXISTS exchange_possible BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tags VARCHAR(200),
      ADD COLUMN IF NOT EXISTS equipment TEXT,
      ADD COLUMN IF NOT EXISTS service_history TEXT,
      ADD COLUMN IF NOT EXISTS owners_count INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS vin VARCHAR(17),
      ADD COLUMN IF NOT EXISTS registration_number VARCHAR(20)
    `);
    
    // Создание таблицы listing_images
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listing_images (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        cloudinary_public_id VARCHAR(200),
        is_primary BOOLEAN DEFAULT FALSE,
        image_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Создание индексов
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id)');
    
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
});

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production
    : 'http://localhost:3000',
  credentials: true // Allow cookies
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(handleUploadError);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  next();
});

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [decoded.userId]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    req.user = user.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Регистрация
app.post('/api/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // Basic validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: newUser.rows[0].id, 
        username: newUser.rows[0].username, 
        email: newUser.rows[0].email,
        created_at: newUser.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Вход
app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ 
      message: 'Login successful',
      user: { 
        id: user.rows[0].id, 
        username: user.rows[0].username,
        email: user.rows[0].email,
        created_at: user.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Get user's listings
app.get('/api/users/me/listings', authenticateToken, async (req, res) => {
  try {
    const listings = await pool.query(
      'SELECT id, title, description, price, make, model, year, mileage, status, created_at, updated_at FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.status(200).json({ listings: listings.rows });
  } catch (err) {
    console.error('Error fetching user listings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new listing
app.post('/api/users/me/listings', authenticateToken, async (req, res) => {
  const { 
    title, 
    description, 
    price, 
    make, 
    model, 
    year, 
    mileage,
    manufacturer,
    engine,
    drivetrain,
    location,
    owner_phone,
    generation,
    body_type,
    color,
    fuel_type,
    engine_volume,
    engine_power,
    transmission,
    steering_wheel,
    condition,
    customs,
    region,
    registration,
    exchange_possible,
    availability,
    contact_person,
    tags,
    equipment,
    service_history,
    owners_count,
    vin,
    registration_number
  } = req.body;

  if (!title || !price) {
    return res.status(400).json({ message: 'Title and price are required' });
  }

  try {
    const newListing = await pool.query(
      `INSERT INTO listings (
        user_id, title, description, price, make, model, year, mileage, 
        manufacturer, engine, drivetrain, location, owner_phone,
        generation, body_type, color, fuel_type, engine_volume, engine_power,
        transmission, steering_wheel, condition, customs, region, registration,
        exchange_possible, availability, contact_person, tags, equipment,
        service_history, owners_count, vin, registration_number,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
      ) RETURNING *`,
      [
        req.user.id, title, description, price, make, model, year, mileage,
        manufacturer || make, engine, drivetrain, location, owner_phone,
        generation, body_type, color, fuel_type, engine_volume, engine_power,
        transmission, steering_wheel, condition, customs, region, registration,
        exchange_possible || false, availability !== false, contact_person, tags, equipment,
        service_history, owners_count || 1, vin, registration_number, 'active', new Date(), new Date()
      ]
    );

    res.status(201).json({ 
      message: 'Listing created successfully',
      listing: newListing.rows[0]
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing
app.put('/api/users/me/listings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    price, 
    make, 
    model, 
    year, 
    mileage, 
    status,
    manufacturer,
    engine,
    drivetrain,
    location,
    owner_phone,
    generation,
    body_type,
    color,
    fuel_type,
    engine_volume,
    engine_power,
    transmission,
    steering_wheel,
    condition,
    customs,
    region,
    registration,
    exchange_possible,
    availability,
    contact_person,
    tags,
    equipment,
    service_history,
    owners_count,
    vin,
    registration_number
  } = req.body;

  try {
    // Check if listing belongs to user
    const listing = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const updatedListing = await pool.query(
      `UPDATE listings SET 
        title = $1, description = $2, price = $3, make = $4, model = $5, year = $6, mileage = $7, 
        manufacturer = $8, engine = $9, drivetrain = $10, location = $11, owner_phone = $12, 
        generation = $13, body_type = $14, color = $15, fuel_type = $16, engine_volume = $17, 
        engine_power = $18, transmission = $19, steering_wheel = $20, condition = $21, 
        customs = $22, region = $23, registration = $24, exchange_possible = $25, 
        availability = $26, contact_person = $27, tags = $28, equipment = $29, 
        service_history = $30, owners_count = $31, vin = $32, registration_number = $33, 
        status = $34, updated_at = NOW() 
      WHERE id = $35 AND user_id = $36 
      RETURNING *`,
      [
        title, description, price, make, model, year, mileage, 
        manufacturer || make, engine, drivetrain, location, owner_phone,
        generation, body_type, color, fuel_type, engine_volume, engine_power,
        transmission, steering_wheel, condition, customs, region, registration,
        exchange_possible, availability, contact_person, tags, equipment,
        service_history, owners_count, vin, registration_number, status, id, req.user.id
      ]
    );

    res.status(200).json({ 
      message: 'Listing updated successfully',
      listing: updatedListing.rows[0]
    });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing
app.delete('/api/users/me/listings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if listing belongs to user
    const listing = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload images for a listing
app.post('/api/users/me/listings/:id/images', authenticateToken, uploadMultiple, async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No images provided' });
  }

  try {
    // Check if listing belongs to user
    const listing = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listing.rows.length === 0) {
      cleanupTempFiles(files);
      return res.status(404).json({ message: 'Listing not found' });
    }

    const uploadedImages = [];
    let hasError = false;

    // Upload each file to Cloudinary
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadResult = await uploadToCloudinary(file, `car-marketplace/listing-${id}`);

      if (uploadResult.success) {
        // Check if this is the first image (should be primary)
        const isFirstImage = i === 0;
        
        // Save to database
        const imageResult = await pool.query(
          'INSERT INTO listing_images (listing_id, image_url, cloudinary_public_id, is_primary, image_order) VALUES ($1, $2, $3, $4, $5) RETURNING id, image_url, is_primary, image_order',
          [id, uploadResult.url, uploadResult.public_id, isFirstImage, i]
        );
        
        uploadedImages.push(imageResult.rows[0]);
      } else {
        hasError = true;
        console.error('Failed to upload image:', uploadResult.error);
      }
    }

    // Clean up temporary files
    cleanupTempFiles(files);

    if (hasError && uploadedImages.length === 0) {
      return res.status(500).json({ message: 'Failed to upload images' });
    }

    res.status(201).json({ 
      message: 'Images uploaded successfully',
      images: uploadedImages,
      uploaded: uploadedImages.length,
      failed: files.length - uploadedImages.length
    });
  } catch (err) {
    cleanupTempFiles(files);
    console.error('Error uploading images:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get images for a listing
app.get('/api/listings/:id/images', async (req, res) => {
  const { id } = req.params;

  try {
    const images = await pool.query(
      'SELECT id, image_url, is_primary, image_order FROM listing_images WHERE listing_id = $1 ORDER BY image_order ASC',
      [id]
    );

    res.status(200).json({ images: images.rows });
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set primary image for a listing
app.put('/api/users/me/listings/:id/images/:imageId/primary', authenticateToken, async (req, res) => {
  const { id, imageId } = req.params;

  try {
    // Check if listing belongs to user
    const listing = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if image belongs to listing
    const image = await pool.query('SELECT * FROM listing_images WHERE id = $1 AND listing_id = $2', [imageId, id]);
    if (image.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Remove primary flag from all images of this listing
    await pool.query('UPDATE listing_images SET is_primary = FALSE WHERE listing_id = $1', [id]);

    // Set new primary image
    await pool.query('UPDATE listing_images SET is_primary = TRUE WHERE id = $1', [imageId]);

    await pool.query('COMMIT');

    res.status(200).json({ message: 'Primary image updated successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating primary image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an image
app.delete('/api/users/me/listings/:id/images/:imageId', authenticateToken, async (req, res) => {
  const { id, imageId } = req.params;

  try {
    // Check if listing belongs to user
    const listing = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Get image details
    const image = await pool.query('SELECT * FROM listing_images WHERE id = $1 AND listing_id = $2', [imageId, id]);
    if (image.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imageData = image.rows[0];

    // Delete from Cloudinary
    if (imageData.cloudinary_public_id) {
      const deleteResult = await deleteFromCloudinary(imageData.cloudinary_public_id);
      if (!deleteResult.success) {
        console.error('Failed to delete from Cloudinary:', deleteResult.error);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM listing_images WHERE id = $1', [imageId]);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced listings API with advanced filtering, sorting, and search
app.get('/api/listings', async (req, res) => {
  const { 
    // Pagination
    page = 1, 
    limit = 12,
    
    // Basic filters
    make, 
    model, 
    minPrice, 
    maxPrice, 
    minYear, 
    maxYear, 
    minMileage, 
    maxMileage,
    
    // Advanced filters
    search, // Full-text search
    sortBy = 'created_at', // created_at, price, year, mileage, title
    sortOrder = 'desc', // asc, desc
    
    // Additional filters
    status = 'active', // active, sold, draft, all
    userId, // Filter by specific user
    
    // New advanced filters
    engineSize,
    transmission,
    drivetrain,
    fuelType,
    bodyType,
    condition,
    customsStatus,
    steeringWheel,
    color,
    generation,
    
    // Location filters (for future use)
    location,
    radius
  } = req.query;

  // Create cache key based on query parameters
  const cacheKey = `listings:${JSON.stringify(req.query)}`;
  
  // Try to get cached data first
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    logger.info(`Listings served from cache for key: ${cacheKey}`);
    return res.status(200).json({
      ...cachedData,
      cached: true
    });
  }

  const offset = (page - 1) * limit;
  const validSortFields = ['created_at', 'price', 'year', 'mileage', 'title'];
  const validSortOrders = ['asc', 'desc'];

  // Validate sort parameters
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    // Build the main query
    let query = `
      SELECT 
        l.id, 
        l.title, 
        l.description, 
        l.price, 
        l.make, 
        l.model, 
        l.year, 
        l.mileage, 
        l.status, 
        l.created_at,
        l.updated_at,
        l.manufacturer,
        l.engine,
        l.drivetrain,
        l.location,
        l.owner_phone,
        l.generation,
        l.body_type,
        l.color,
        l.fuel_type,
        l.engine_volume,
        l.engine_power,
        l.transmission,
        l.steering_wheel,
        l.condition,
        l.customs,
        l.region,
        l.registration,
        l.exchange_possible,
        l.availability,
        l.contact_person,
        l.tags,
        l.equipment,
        l.service_history,
        l.owners_count,
        l.vin,
        l.registration_number,
        li.image_url as primary_image,
        li.id as primary_image_id,
        u.username as seller_username,
        u.id as seller_id,
        (SELECT COUNT(*) FROM listing_images li2 WHERE li2.listing_id = l.id) as image_count
      FROM listings l
      LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = TRUE
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Status filter
    if (status && status !== 'all') {
      queryParams.push(status);
      query += ` AND l.status = $${++paramCount}`;
    }

    // Search filter (full-text search)
    if (search && search.trim()) {
      queryParams.push(`%${search.trim()}%`);
      query += ` AND (
        l.title ILIKE $${++paramCount} OR 
        l.description ILIKE $${paramCount} OR 
        l.make ILIKE $${paramCount} OR 
        l.model ILIKE $${paramCount}
      )`;
    }

    // User filter
    if (userId) {
      queryParams.push(userId);
      query += ` AND l.user_id = $${++paramCount}`;
    }

    // Make filter
    if (make && make.trim()) {
      queryParams.push(make.trim());
      query += ` AND l.make ILIKE $${++paramCount}`;
    }

    // Model filter
    if (model && model.trim()) {
      queryParams.push(model.trim());
      query += ` AND l.model ILIKE $${++paramCount}`;
    }

    // Price range filters
    if (minPrice && !isNaN(minPrice)) {
      queryParams.push(parseFloat(minPrice));
      query += ` AND l.price >= $${++paramCount}`;
    }
    if (maxPrice && !isNaN(maxPrice)) {
      queryParams.push(parseFloat(maxPrice));
      query += ` AND l.price <= $${++paramCount}`;
    }

    // Year range filters
    if (minYear && !isNaN(minYear)) {
      queryParams.push(parseInt(minYear));
      query += ` AND l.year >= $${++paramCount}`;
    }
    if (maxYear && !isNaN(maxYear)) {
      queryParams.push(parseInt(maxYear));
      query += ` AND l.year <= $${++paramCount}`;
    }

    // Mileage range filters
    if (minMileage && !isNaN(minMileage)) {
      queryParams.push(parseInt(minMileage));
      query += ` AND l.mileage >= $${++paramCount}`;
    }
    if (maxMileage && !isNaN(maxMileage)) {
      queryParams.push(parseInt(maxMileage));
      query += ` AND l.mileage <= $${++paramCount}`;
    }

    // Advanced filters
    if (engineSize) {
      const engineSizes = Array.isArray(engineSize) ? engineSize : [engineSize];
      const placeholders = engineSizes.map(() => `$${++paramCount}`).join(',');
      query += ` AND l.engine_volume::text IN (${placeholders})`;
      queryParams.push(...engineSizes);
    }
    
    if (transmission) {
      const transmissions = Array.isArray(transmission) ? transmission : [transmission];
      const placeholders = transmissions.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.transmission) IN (${placeholders})`;
      queryParams.push(...transmissions.map(t => t.toLowerCase()));
    }
    
    if (drivetrain) {
      const drivetrains = Array.isArray(drivetrain) ? drivetrain : [drivetrain];
      const placeholders = drivetrains.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.drivetrain) IN (${placeholders})`;
      queryParams.push(...drivetrains.map(d => d.toLowerCase()));
    }
    
    if (fuelType) {
      const fuelTypes = Array.isArray(fuelType) ? fuelType : [fuelType];
      const placeholders = fuelTypes.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.fuel_type) IN (${placeholders})`;
      queryParams.push(...fuelTypes.map(f => f.toLowerCase()));
    }
    
    if (bodyType) {
      const bodyTypes = Array.isArray(bodyType) ? bodyType : [bodyType];
      const placeholders = bodyTypes.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.body_type) IN (${placeholders})`;
      queryParams.push(...bodyTypes.map(b => b.toLowerCase()));
    }
    
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      const placeholders = conditions.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.condition) IN (${placeholders})`;
      queryParams.push(...conditions.map(c => c.toLowerCase()));
    }
    
    if (customsStatus) {
      const customsStatuses = Array.isArray(customsStatus) ? customsStatus : [customsStatus];
      const placeholders = customsStatuses.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.customs) IN (${placeholders})`;
      queryParams.push(...customsStatuses.map(c => c.toLowerCase()));
    }
    
    if (steeringWheel) {
      const steeringWheels = Array.isArray(steeringWheel) ? steeringWheel : [steeringWheel];
      const placeholders = steeringWheels.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.steering_wheel) IN (${placeholders})`;
      queryParams.push(...steeringWheels.map(s => s.toLowerCase()));
    }
    
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      const placeholders = colors.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.color) IN (${placeholders})`;
      queryParams.push(...colors.map(c => c.toLowerCase()));
    }
    
    if (generation) {
      const generations = Array.isArray(generation) ? generation : [generation];
      const placeholders = generations.map(() => `$${++paramCount}`).join(',');
      query += ` AND LOWER(l.generation) IN (${placeholders})`;
      queryParams.push(...generations.map(g => g.toLowerCase()));
    }

    // Add sorting
    query += ` ORDER BY l.${sortField} ${sortDirection}`;
    
    // Add pagination
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(parseInt(limit), offset);

    const listings = await pool.query(query, queryParams);

    // Build count query for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM listings l 
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    // Apply same filters to count query
    if (status && status !== 'all') {
      countParams.push(status);
      countQuery += ` AND l.status = $${++countParamCount}`;
    }

    if (search && search.trim()) {
      countParams.push(`%${search.trim()}%`);
      countQuery += ` AND (
        l.title ILIKE $${++countParamCount} OR 
        l.description ILIKE $${countParamCount} OR 
        l.make ILIKE $${countParamCount} OR 
        l.model ILIKE $${countParamCount}
      )`;
    }

    if (userId) {
      countParams.push(userId);
      countQuery += ` AND l.user_id = $${++countParamCount}`;
    }

    if (make && make.trim()) {
      countParams.push(make.trim());
      countQuery += ` AND l.make ILIKE $${++countParamCount}`;
    }

    if (model && model.trim()) {
      countParams.push(model.trim());
      countQuery += ` AND l.model ILIKE $${++countParamCount}`;
    }

    if (minPrice && !isNaN(minPrice)) {
      countParams.push(parseFloat(minPrice));
      countQuery += ` AND l.price >= $${++countParamCount}`;
    }
    if (maxPrice && !isNaN(maxPrice)) {
      countParams.push(parseFloat(maxPrice));
      countQuery += ` AND l.price <= $${++countParamCount}`;
    }

    if (minYear && !isNaN(minYear)) {
      countParams.push(parseInt(minYear));
      countQuery += ` AND l.year >= $${++countParamCount}`;
    }
    if (maxYear && !isNaN(maxYear)) {
      countParams.push(parseInt(maxYear));
      countQuery += ` AND l.year <= $${++countParamCount}`;
    }

    if (minMileage && !isNaN(minMileage)) {
      countParams.push(parseInt(minMileage));
      countQuery += ` AND l.mileage >= $${++countParamCount}`;
    }
    if (maxMileage && !isNaN(maxMileage)) {
      countParams.push(parseInt(maxMileage));
      countQuery += ` AND l.mileage <= $${++countParamCount}`;
    }

    // Advanced filters for count query
    if (engineSize) {
      const engineSizes = Array.isArray(engineSize) ? engineSize : [engineSize];
      const placeholders = engineSizes.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND l.engine_volume::text IN (${placeholders})`;
      countParams.push(...engineSizes);
    }
    
    if (transmission) {
      const transmissions = Array.isArray(transmission) ? transmission : [transmission];
      const placeholders = transmissions.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.transmission) IN (${placeholders})`;
      countParams.push(...transmissions.map(t => t.toLowerCase()));
    }
    
    if (drivetrain) {
      const drivetrains = Array.isArray(drivetrain) ? drivetrain : [drivetrain];
      const placeholders = drivetrains.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.drivetrain) IN (${placeholders})`;
      countParams.push(...drivetrains.map(d => d.toLowerCase()));
    }
    
    if (fuelType) {
      const fuelTypes = Array.isArray(fuelType) ? fuelType : [fuelType];
      const placeholders = fuelTypes.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.fuel_type) IN (${placeholders})`;
      countParams.push(...fuelTypes.map(f => f.toLowerCase()));
    }
    
    if (bodyType) {
      const bodyTypes = Array.isArray(bodyType) ? bodyType : [bodyType];
      const placeholders = bodyTypes.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.body_type) IN (${placeholders})`;
      countParams.push(...bodyTypes.map(b => b.toLowerCase()));
    }
    
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      const placeholders = conditions.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.condition) IN (${placeholders})`;
      countParams.push(...conditions.map(c => c.toLowerCase()));
    }
    
    if (customsStatus) {
      const customsStatuses = Array.isArray(customsStatus) ? customsStatus : [customsStatus];
      const placeholders = customsStatuses.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.customs) IN (${placeholders})`;
      countParams.push(...customsStatuses.map(c => c.toLowerCase()));
    }
    
    if (steeringWheel) {
      const steeringWheels = Array.isArray(steeringWheel) ? steeringWheel : [steeringWheel];
      const placeholders = steeringWheels.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.steering_wheel) IN (${placeholders})`;
      countParams.push(...steeringWheels.map(s => s.toLowerCase()));
    }
    
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      const placeholders = colors.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.color) IN (${placeholders})`;
      countParams.push(...colors.map(c => c.toLowerCase()));
    }
    
    if (generation) {
      const generations = Array.isArray(generation) ? generation : [generation];
      const placeholders = generations.map(() => `$${++countParamCount}`).join(',');
      countQuery += ` AND LOWER(l.generation) IN (${placeholders})`;
      countParams.push(...generations.map(g => g.toLowerCase()));
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get available filter options
    const filterOptions = await pool.query(`
      SELECT 
        array_agg(DISTINCT make ORDER BY make) as makes,
        array_agg(DISTINCT model ORDER BY model) as models,
        MIN(year) as min_year,
        MAX(year) as max_year,
        MIN(price) as min_price,
        MAX(price) as max_price,
        MIN(mileage) as min_mileage,
        MAX(mileage) as max_mileage
      FROM listings 
      WHERE status = 'active'
    `);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const responseData = {
      success: true,
      data: {
        listings: listings.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? parseInt(page) + 1 : null,
          prevPage: hasPrevPage ? parseInt(page) - 1 : null
        },
        filters: {
          applied: {
            make: make || null,
            model: model || null,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            minYear: minYear ? parseInt(minYear) : null,
            maxYear: maxYear ? parseInt(maxYear) : null,
            minMileage: minMileage ? parseInt(minMileage) : null,
            maxMileage: maxMileage ? parseInt(maxMileage) : null,
            search: search || null,
            sortBy,
            sortOrder
          },
          available: filterOptions.rows[0] || {}
        }
      }
    };

    // Cache the response for 2 minutes (shorter cache for dynamic content)
    await setCache(cacheKey, responseData);

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single listing with all details
app.get('/api/listings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get listing details
    const listingResult = await pool.query(`
      SELECT 
        l.*,
        u.username as seller_username,
        u.id as seller_id,
        u.created_at as seller_joined_date
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }

    // Get all images for this listing
    const imagesResult = await pool.query(`
      SELECT id, image_url, is_primary, image_order, created_at
      FROM listing_images 
      WHERE listing_id = $1 
      ORDER BY image_order ASC
    `, [id]);

    const listing = listingResult.rows[0];
    listing.images = imagesResult.rows;

    res.status(200).json({
      success: true,
      data: { listing }
    });
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single car by ID (alias for listings endpoint)
app.get('/api/cars/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get car details with all fields
    const carResult = await pool.query(`
      SELECT 
        l.*,
        u.username as seller_username,
        u.id as seller_id,
        u.created_at as seller_joined_date
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (carResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Car not found' 
      });
    }

    // Get all images for this car
    const imagesResult = await pool.query(`
      SELECT id, image_url, is_primary, image_order, created_at
      FROM listing_images
      WHERE listing_id = $1
      ORDER BY is_primary DESC, image_order ASC, created_at ASC
    `, [id]);

    const car = carResult.rows[0];
    car.images = imagesResult.rows;

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (err) {
    console.error('Error fetching car:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get filter options for the frontend
app.get('/api/listings/filters/options', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'filter_options';
    const cachedData = await getCached(cacheKey);
    
    if (cachedData) {
      logger.info(`Filter options served from cache: ${cachedData ? 'found' : 'not found'}`);
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Get price and mileage ranges from actual listings
    const priceRangeResult = await pool.query(`
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        MIN(mileage) as min_mileage,
        MAX(mileage) as max_mileage,
        COUNT(*) as total_listings
      FROM listings 
      WHERE status = 'active'
    `);

    const priceRange = priceRangeResult.rows[0] || {};

    // Static filter options from our comprehensive car database
    const filterData = {
      // Car makes and models from our comprehensive database
      makes: [
        "Toyota", "Honda", "BMW", "Mercedes-Benz", "Audi", "Ford", 
        "Chevrolet", "Nissan", "Hyundai", "Kia", "Porsche", "Lexus"
      ],
      models: {
        "Toyota": ["Camry", "Corolla", "Prius", "RAV4", "Highlander"],
        "Honda": ["Civic", "Accord", "CR-V", "Pilot"],
        "BMW": ["3 Series", "5 Series", "X3", "X5"],
        "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
        "Audi": ["A4", "A6", "Q5", "Q7"],
        "Ford": ["F-150", "Mustang", "Explorer", "Escape"],
        "Chevrolet": ["Silverado", "Camaro", "Equinox", "Malibu"],
        "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder"],
        "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe"],
        "Kia": ["Optima", "Forte", "Sportage", "Sorento"],
        "Porsche": ["911", "Cayman", "Boxster", "Macan"],
        "Lexus": ["ES", "IS", "RX", "GX"]
      },
      // Year range
      min_year: 2000,
      max_year: new Date().getFullYear(),
      // Price and mileage from actual listings
      min_price: priceRange.min_price || 1000,
      max_price: priceRange.max_price || 100000,
      min_mileage: priceRange.min_mileage || 0,
      max_mileage: priceRange.max_mileage || 300000,
      total_listings: priceRange.total_listings || 0,
      // Engine sizes
      engine_sizes: [
        "1.0L", "1.2L", "1.4L", "1.5L", "1.6L", "1.8L", "2.0L", "2.2L", "2.3L", "2.4L", 
        "2.5L", "2.7L", "3.0L", "3.2L", "3.5L", "3.6L", "4.0L", "4.2L", "4.6L", "5.0L", 
        "5.2L", "5.7L", "6.0L", "6.2L", "6.4L", "8.0L"
      ],
      // Transmission types
      transmission_types: [
        "Manual", "Automatic", "CVT", "Semi-automatic", "Dual-clutch"
      ],
      // Drivetrain types
      drivetrain_types: [
        "FWD", "RWD", "AWD", "4WD"
      ],
      // Fuel types
      fuel_types: [
        "Gasoline", "Diesel", "Hybrid", "Electric", "Plug-in Hybrid", "Flex Fuel"
      ],
      // Body types
      body_types: [
        "Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Wagon", 
        "Pickup Truck", "Van", "Crossover"
      ],
      // Car conditions
      conditions: [
        "Excellent", "Very Good", "Good", "Fair", "Poor"
      ],
      // Customs status
      customs_status: [
        "Cleared", "Not Cleared", "In Process"
      ],
      // Steering wheel positions
      steering_wheel_positions: [
        "Left", "Right"
      ]
    };
    
    // Cache the result
    await setCache(cacheKey, filterData);
    logger.info(`Filter options cached with key: ${cacheKey}`);

    res.status(200).json({
      success: true,
      data: filterData,
      cached: false
    });
  } catch (err) {
    logger.error('Error fetching filter options:', { error: err.message, stack: err.stack });
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get popular searches/suggestions
app.get('/api/listings/search/suggestions', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(200).json({
      success: true,
      data: { suggestions: [] }
    });
  }

  try {
    const result = await pool.query(`
      SELECT DISTINCT 
        make,
        model,
        COUNT(*) as count
      FROM listings 
      WHERE status = 'active' 
        AND (make ILIKE $1 OR model ILIKE $1)
      GROUP BY make, model
      ORDER BY count DESC, make, model
      LIMIT 10
    `, [`%${q}%`]);

    const suggestions = result.rows.map(row => ({
      text: `${row.make} ${row.model}`,
      make: row.make,
      model: row.model,
      count: row.count
    }));

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (err) {
    console.error('Error fetching search suggestions:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get similar listings
app.get('/api/listings/:id/similar', async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  try {
    // First get the current listing
    const currentListing = await pool.query(`
      SELECT make, model, year, price
      FROM listings 
      WHERE id = $1
    `, [id]);

    if (currentListing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }

    const { make, model, year, price } = currentListing.rows[0];

    // Find similar listings
    const similarListings = await pool.query(`
      SELECT 
        l.id, l.title, l.price, l.make, l.model, l.year, l.mileage,
        li.image_url as primary_image
      FROM listings l
      LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = TRUE
      WHERE l.id != $1 
        AND l.status = 'active'
        AND (
          (l.make = $2 AND l.model = $3) OR
          (l.make = $2 AND ABS(l.year - $4) <= 2) OR
          (l.make = $2 AND ABS(l.price - $5) <= $5 * 0.2)
        )
      ORDER BY 
        CASE 
          WHEN l.make = $2 AND l.model = $3 THEN 1
          WHEN l.make = $2 AND ABS(l.year - $4) <= 2 THEN 2
          ELSE 3
        END,
        ABS(l.price - $5)
      LIMIT $6
    `, [id, make, model, year, price, parseInt(limit)]);

    res.status(200).json({
      success: true,
      data: { 
        similar: similarListings.rows,
        based_on: { make, model, year, price }
      }
    });
  } catch (err) {
    console.error('Error fetching similar listings:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Cache test endpoint
app.get('/api/cache/test', async (req, res) => {
  try {
    const testKey = 'test_cache';
    const testData = { 
      message: 'Hello from cache!', 
      timestamp: new Date().toISOString(),
      random: Math.random()
    };
    
    // Try to get from cache first
    const cachedData = await getCached(testKey);
    if (cachedData) {
      return res.json({
        success: true,
        message: 'Data served from cache',
        data: cachedData,
        cacheType: redisClient ? 'Redis' : 'In-Memory',
        redisConnected: !!redisClient,
        redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured'
      });
    }
    
    // If not in cache, set it
    await setCache(testKey, testData);
    
    res.json({
      success: true,
      message: 'Data cached successfully',
      data: testData,
      cacheType: redisClient ? 'Redis' : 'In-Memory',
      redisConnected: !!redisClient,
      redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured'
    });
  } catch (error) {
    logger.error('Cache test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cache test failed',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbDuration = Date.now() - dbStart;
    
    // Redis status
    let redisStatus = 'disabled';
    let redisResponseTime = 'N/A';
    
    if (redisClient) {
      try {
        const redisStart = Date.now();
        await redisClient.ping();
        redisResponseTime = `${Date.now() - redisStart}ms`;
        redisStatus = 'connected';
      } catch (error) {
        redisStatus = 'error';
        redisResponseTime = 'N/A';
      }
    }
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: 'connected',
        responseTime: `${dbDuration}ms`
      },
      redis: {
        status: redisStatus,
        responseTime: redisResponseTime
      },
      cache: {
        type: redisClient ? 'redis' : 'in-memory',
        fallbackSize: fallbackCache.size,
        fallbackEntries: Array.from(fallbackCache.keys()),
        redisConnected: !!redisClient,
        redisKeys: redisClient ? await redisClient.keys('*') : []
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    logger.info('Health check', health);
    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('❌ Server Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  res.status(500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'activeuser7';

// Function to send message to Telegram
async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('Telegram Bot Token not configured');
    return { success: false, error: 'Telegram Bot Token not configured' };
  }

  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    logger.info('Message sent to Telegram successfully');
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Failed to send message to Telegram:', error.message);
    return { success: false, error: error.message };
  }
}

// Support form endpoint
app.post('/api/support', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

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
🚨 <b>New Support Request</b>

👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Subject:</b> ${subject}
💬 <b>Message:</b> ${message}
⏰ <b>Timestamp:</b> ${timestamp}
    `.trim();

    // Send to Telegram
    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (telegramResult.success) {
      logger.info(`Support message sent successfully for ${email}`);
      res.json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.'
      });
    } else {
      logger.error('Failed to send support message to Telegram:', telegramResult.error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Support form error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

// Запуск сервера
app.listen(port, async () => {
  // Инициализация базы данных
  await initializeDatabase();
  
  // Инициализация Redis
  const redisConnected = await initializeRedis();
  
  logger.info('🚀 Server started on Railway', {
    port,
    environment: process.env.NODE_ENV || 'development',
    features: ['Helmet', 'Rate Limiting', 'Winston Logging', 'Compression', 'Health Check', 'Railway Redis Cache']
  });
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security features enabled: Helmet, Rate Limiting`);
  console.log(`📝 Logging enabled: Winston`);
  console.log(`⚡ Performance features: Compression, Health Check, Railway Redis Cache`);
  console.log(`💾 Cache: ${redisConnected ? 'Railway Redis + In-Memory Fallback' : 'In-Memory Only (Redis not configured)'}`);
  if (TELEGRAM_BOT_TOKEN) {
    console.log(`📱 Telegram Bot: Configured`);
  } else {
    console.log(`⚠️  Telegram Bot: Not configured (TELEGRAM_BOT_TOKEN missing)`);
  }
});
