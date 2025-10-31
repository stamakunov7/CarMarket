#!/usr/bin/env node

/**
 * Test Railway Connection Script
 * Скрипт для тестирования подключения к Railway
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from 'redis';

dotenv.config();

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

async function testRailwayConnection() {
  log('🚀 Тестирование подключения к Railway...', 'cyan');
  log('=' * 60, 'blue');
  
  // Проверка переменных окружения
  log('\n📋 Проверка переменных окружения:', 'yellow');
  
  const requiredVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  let missingVars = [];
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✅ ${varName}: установлен`, 'green');
    } else {
      log(`❌ ${varName}: НЕ установлен`, 'red');
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    log(`\n⚠️  Отсутствуют переменные: ${missingVars.join(', ')}`, 'yellow');
    log('💡 Добавьте эти переменные в Railway dashboard', 'blue');
    return;
  }
  
  // Тест подключения к базе данных
  log('\n🗄️  Тестирование подключения к PostgreSQL:', 'yellow');
  
  try {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    const duration = Date.now() - startTime;
    
    log(`✅ PostgreSQL подключен успешно (${duration}ms)`, 'green');
    log(`   📊 Время: ${result.rows[0].current_time}`, 'blue');
    log(`   📊 Версия: ${result.rows[0].version.split(' ')[0]}`, 'blue');
    
    await pool.end();
  } catch (error) {
    log(`❌ Ошибка подключения к PostgreSQL: ${error.message}`, 'red');
  }
  
  // Тест подключения к Redis
  log('\n🔴 Тестирование подключения к Redis:', 'yellow');
  
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true
      }
    });
    
    redisClient.on('error', (err) => {
      log(`❌ Redis ошибка: ${err.message}`, 'red');
    });
    
    redisClient.on('connect', () => {
      log('✅ Redis подключен', 'green');
    });
    
    await redisClient.connect();
    
    const startTime = Date.now();
    await redisClient.ping();
    const duration = Date.now() - startTime;
    
    log(`✅ Redis ping успешен (${duration}ms)`, 'green');
    
    // Тест записи/чтения
    await redisClient.set('test_key', 'test_value', { EX: 10 });
    const value = await redisClient.get('test_key');
    
    if (value === 'test_value') {
      log('✅ Redis запись/чтение работает', 'green');
    } else {
      log('❌ Redis запись/чтение не работает', 'red');
    }
    
    await redisClient.quit();
  } catch (error) {
    log(`❌ Ошибка подключения к Redis: ${error.message}`, 'red');
  }
  
  // Тест Cloudinary
  log('\n☁️  Тестирование Cloudinary:', 'yellow');
  
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    log('✅ Cloudinary переменные установлены', 'green');
    log(`   📊 Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`, 'blue');
  } else {
    log('❌ Cloudinary переменные не установлены', 'red');
  }
  
  // Тест JWT
  log('\n🔐 Тестирование JWT:', 'yellow');
  
  if (process.env.JWT_SECRET) {
    log('✅ JWT_SECRET установлен', 'green');
    log(`   📊 Длина ключа: ${process.env.JWT_SECRET.length} символов`, 'blue');
  } else {
    log('❌ JWT_SECRET не установлен', 'red');
  }
  
  log('\n' + '=' * 60, 'blue');
  log('🎯 Тестирование завершено!', 'cyan');
  log('💡 Если все тесты прошли, Railway должен работать корректно', 'green');
}

// Запуск тестов
if (import.meta.url === `file://${process.argv[1]}`) {
  testRailwayConnection().catch(error => {
    log(`❌ Критическая ошибка: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { testRailwayConnection };
