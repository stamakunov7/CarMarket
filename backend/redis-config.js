/**
 * Redis Configuration for Railway
 * Оптимизированная конфигурация Redis для Railway
 */

import { createClient } from 'redis';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'redis-config' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Railway Redis Configuration
const railwayRedisConfig = {
  // Railway предоставляет REDIS_URL автоматически
  url: process.env.REDIS_URL,
  
  // Оптимизация для Railway
  socket: {
    connectTimeout: 10000,      // 10 секунд
    lazyConnect: true,          // Ленивое подключение
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        logger.error('Redis: Max reconnection attempts reached');
        return new Error('Max reconnection attempts reached');
      }
      // Экспоненциальная задержка: 100ms, 200ms, 400ms, 800ms, etc.
      return Math.min(retries * 100, 3000);
    }
  },
  
  // Настройки для production
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  
  // Railway специфичные настройки
  keepAlive: 30000,  // 30 секунд
  family: 4,         // IPv4
};

// Fallback cache для случаев когда Redis недоступен
const fallbackCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут в миллисекундах

let redisClient = null;
let isConnected = false;

/**
 * Инициализация Redis подключения для Railway
 */
export async function initializeRailwayRedis() {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('⚠️  REDIS_URL not configured, using in-memory cache only');
      logger.info('💡 Railway will provide REDIS_URL automatically when Redis service is added');
      return false;
    }

    logger.info('🔄 Initializing Railway Redis connection...');
    
    redisClient = createClient(railwayRedisConfig);
    
    // Обработчики событий
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err.message);
      isConnected = false;
    });
    
    redisClient.on('connect', () => {
      logger.info('✅ Redis connected to Railway');
      isConnected = true;
    });
    
    redisClient.on('ready', () => {
      logger.info('✅ Redis ready for operations on Railway');
      isConnected = true;
    });
    
    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
      isConnected = false;
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });
    
    // Подключение
    await redisClient.connect();
    
    // Тест подключения
    await redisClient.ping();
    logger.info('✅ Railway Redis connection test successful');
    
    return true;
    
  } catch (error) {
    logger.error('❌ Failed to connect to Railway Redis:', error.message);
    logger.info('💡 Continuing with in-memory cache only');
    redisClient = null;
    isConnected = false;
    return false;
  }
}

/**
 * Получение данных из кэша с fallback
 */
export async function getCached(key) {
  logger.debug(`Getting cached data for key: ${key}`);
  
  // Попытка получить из Redis
  if (redisClient && isConnected) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        logger.info(`✅ Cache hit from Railway Redis: ${key}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn('Redis get error:', error.message);
      // Переключение на fallback при ошибке
      isConnected = false;
    }
  }
  
  // Fallback к in-memory кэшу
  const item = fallbackCache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    logger.info(`✅ Cache hit from in-memory fallback: ${key}`);
    return item.data;
  }
  
  // Удаление устаревших записей
  if (item) {
    fallbackCache.delete(key);
    logger.debug(`Expired in-memory cache entry deleted: ${key}`);
  }
  
  logger.debug(`❌ No cached data found for key: ${key}`);
  return null;
}

/**
 * Сохранение данных в кэш с fallback
 */
export async function setCache(key, data) {
  logger.debug(`Setting cache for key: ${key}`);
  
  // Попытка сохранить в Redis
  if (redisClient && isConnected) {
    try {
      await redisClient.setEx(key, 300, JSON.stringify(data)); // 5 минут TTL
      logger.info(`✅ Data cached in Railway Redis: ${key}`);
      return;
    } catch (error) {
      logger.warn('Redis set error:', error.message);
      // Переключение на fallback при ошибке
      isConnected = false;
    }
  }
  
  // Fallback к in-memory кэшу
  fallbackCache.set(key, {
    data,
    timestamp: Date.now()
  });
  logger.info(`✅ Data cached in in-memory fallback: ${key}`);
}

/**
 * Очистка кэша
 */
export async function clearCache(pattern = '*') {
  if (redisClient && isConnected) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`✅ Cleared ${keys.length} cache entries from Railway Redis`);
      }
    } catch (error) {
      logger.warn('Redis clear error:', error.message);
    }
  }
  
  // Очистка fallback кэша
  if (pattern === '*') {
    fallbackCache.clear();
    logger.info('✅ Cleared in-memory fallback cache');
  } else {
    // Простая очистка по паттерну для fallback
    for (const key of fallbackCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        fallbackCache.delete(key);
      }
    }
  }
}

/**
 * Получение статистики кэша
 */
export async function getCacheStats() {
  const stats = {
    redis: {
      connected: isConnected,
      client: !!redisClient
    },
    fallback: {
      size: fallbackCache.size,
      keys: Array.from(fallbackCache.keys())
    }
  };
  
  if (redisClient && isConnected) {
    try {
      const info = await redisClient.info('memory');
      stats.redis.info = info;
    } catch (error) {
      logger.warn('Failed to get Redis info:', error.message);
    }
  }
  
  return stats;
}

/**
 * Graceful shutdown
 */
export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('✅ Railway Redis connection closed gracefully');
    } catch (error) {
      logger.warn('Error closing Redis connection:', error.message);
    }
  }
}

// Экспорт для использования в основном приложении
export { redisClient, isConnected };
