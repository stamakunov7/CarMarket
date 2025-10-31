#!/usr/bin/env node

/**
 * Railway Migration Script
 * Скрипт для миграции данных с Render.com на Railway
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Подключение к старой базе (Render.com)
const oldPool = new Pool({
  connectionString: process.env.OLD_DATABASE_URL || process.env.DATABASE_URL
});

// Подключение к новой базе (Railway)
const newPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL || process.env.DATABASE_URL
});

async function migrateDatabase() {
  log('🚀 Начинаем миграцию базы данных с Render.com на Railway...', 'cyan');
  
  try {
    // Проверяем подключение к старой базе
    log('📡 Проверяем подключение к старой базе данных...', 'yellow');
    await oldPool.query('SELECT 1');
    log('✅ Подключение к старой базе успешно', 'green');
    
    // Проверяем подключение к новой базе
    log('📡 Проверяем подключение к новой базе данных...', 'yellow');
    await newPool.query('SELECT 1');
    log('✅ Подключение к новой базе успешно', 'green');
    
    // Создаем таблицы в новой базе
    log('🏗️  Создаем схему в новой базе данных...', 'yellow');
    await createSchema(newPool);
    log('✅ Схема создана успешно', 'green');
    
    // Мигрируем данные
    log('📦 Начинаем миграцию данных...', 'yellow');
    await migrateData();
    log('✅ Миграция данных завершена', 'green');
    
    // Проверяем целостность данных
    log('🔍 Проверяем целостность данных...', 'yellow');
    await verifyData();
    log('✅ Проверка целостности пройдена', 'green');
    
    log('🎉 Миграция завершена успешно!', 'green');
    
  } catch (error) {
    log(`❌ Ошибка миграции: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await oldPool.end();
    await newPool.end();
  }
}

async function createSchema(pool) {
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
      updated_at TIMESTAMP DEFAULT NOW(),
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
      registration_number VARCHAR(20)
    )
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
}

async function migrateData() {
  // Миграция пользователей
  log('👥 Мигрируем пользователей...', 'blue');
  const users = await oldPool.query('SELECT * FROM users ORDER BY id');
  for (const user of users.rows) {
    await newPool.query(
      'INSERT INTO users (id, username, email, password, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [user.id, user.username, user.email, user.password, user.created_at]
    );
  }
  log(`✅ Мигрировано ${users.rows.length} пользователей`, 'green');
  
  // Миграция объявлений
  log('🚗 Мигрируем объявления...', 'blue');
  const listings = await oldPool.query('SELECT * FROM listings ORDER BY id');
  for (const listing of listings.rows) {
    await newPool.query(
      `INSERT INTO listings (
        id, user_id, title, description, price, make, model, year, mileage, status,
        created_at, updated_at, manufacturer, engine, drivetrain, location, owner_phone,
        generation, body_type, color, fuel_type, engine_volume, engine_power,
        transmission, steering_wheel, condition, customs, region, registration,
        exchange_possible, availability, contact_person, tags, equipment,
        service_history, owners_count, vin, registration_number
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38
      ) ON CONFLICT (id) DO NOTHING`,
      [
        listing.id, listing.user_id, listing.title, listing.description, listing.price,
        listing.make, listing.model, listing.year, listing.mileage, listing.status,
        listing.created_at, listing.updated_at, listing.manufacturer, listing.engine,
        listing.drivetrain, listing.location, listing.owner_phone, listing.generation,
        listing.body_type, listing.color, listing.fuel_type, listing.engine_volume,
        listing.engine_power, listing.transmission, listing.steering_wheel,
        listing.condition, listing.customs, listing.region, listing.registration,
        listing.exchange_possible, listing.availability, listing.contact_person,
        listing.tags, listing.equipment, listing.service_history, listing.owners_count,
        listing.vin, listing.registration_number
      ]
    );
  }
  log(`✅ Мигрировано ${listings.rows.length} объявлений`, 'green');
  
  // Миграция изображений
  log('🖼️  Мигрируем изображения...', 'blue');
  const images = await oldPool.query('SELECT * FROM listing_images ORDER BY id');
  for (const image of images.rows) {
    await newPool.query(
      'INSERT INTO listing_images (id, listing_id, image_url, cloudinary_public_id, is_primary, image_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
      [image.id, image.listing_id, image.image_url, image.cloudinary_public_id, image.is_primary, image.image_order, image.created_at]
    );
  }
  log(`✅ Мигрировано ${images.rows.length} изображений`, 'green');
}

async function verifyData() {
  // Проверяем количество записей
  const oldUsersCount = await oldPool.query('SELECT COUNT(*) FROM users');
  const newUsersCount = await newPool.query('SELECT COUNT(*) FROM users');
  
  const oldListingsCount = await oldPool.query('SELECT COUNT(*) FROM listings');
  const newListingsCount = await newPool.query('SELECT COUNT(*) FROM listings');
  
  const oldImagesCount = await oldPool.query('SELECT COUNT(*) FROM listing_images');
  const newImagesCount = await newPool.query('SELECT COUNT(*) FROM listing_images');
  
  log(`📊 Старая база: ${oldUsersCount.rows[0].count} пользователей, ${oldListingsCount.rows[0].count} объявлений, ${oldImagesCount.rows[0].count} изображений`, 'blue');
  log(`📊 Новая база: ${newUsersCount.rows[0].count} пользователей, ${newListingsCount.rows[0].count} объявлений, ${newImagesCount.rows[0].count} изображений`, 'blue');
  
  if (oldUsersCount.rows[0].count !== newUsersCount.rows[0].count) {
    throw new Error('Количество пользователей не совпадает!');
  }
  
  if (oldListingsCount.rows[0].count !== newListingsCount.rows[0].count) {
    throw new Error('Количество объявлений не совпадает!');
  }
  
  if (oldImagesCount.rows[0].count !== newImagesCount.rows[0].count) {
    throw new Error('Количество изображений не совпадает!');
  }
}

// Запуск миграции
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase();
}

export { migrateDatabase };
