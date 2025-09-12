// backend/index.js

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Настройка базы данных PostgreSQL
const pool = new pg.Pool({
  user: process.env.PGUSER || 'caruser',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cardb',
  password: process.env.PGPASSWORD || 'Timik101',
  port: process.env.PGPORT || 5432
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true // Allow cookies
}));
app.use(bodyParser.json());
app.use(cookieParser());

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
app.post('/api/register', async (req, res) => {
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
      sameSite: 'lax',
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
app.post('/api/login', async (req, res) => {
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
      sameSite: 'lax',
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
  const { title, description, price, make, model, year, mileage } = req.body;

  if (!title || !price) {
    return res.status(400).json({ message: 'Title and price are required' });
  }

  try {
    const newListing = await pool.query(
      'INSERT INTO listings (user_id, title, description, price, make, model, year, mileage, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id, title, description, price, make, model, year, mileage, status, created_at, updated_at',
      [req.user.id, title, description, price, make, model, year, mileage, 'active']
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
  const { title, description, price, make, model, year, mileage, status } = req.body;

  try {
    // Check if listing belongs to user
    const listing = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const updatedListing = await pool.query(
      'UPDATE listings SET title = $1, description = $2, price = $3, make = $4, model = $5, year = $6, mileage = $7, status = $8, updated_at = NOW() WHERE id = $9 AND user_id = $10 RETURNING id, title, description, price, make, model, year, mileage, status, created_at, updated_at',
      [title, description, price, make, model, year, mileage, status, id, req.user.id]
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

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
