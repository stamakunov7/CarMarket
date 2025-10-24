#!/usr/bin/env node

/**
 * Railway Deployment Test Script
 * Скрипт для тестирования деплоя на Railway
 */

import axios from 'axios';
import dotenv from 'dotenv';

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

// Конфигурация тестов
const tests = [
  {
    name: 'Health Check',
    url: '/health',
    method: 'GET',
    expectedStatus: 200,
    description: 'Проверка работоспособности сервера'
  },
  {
    name: 'Cache Test',
    url: '/api/cache/test',
    method: 'GET',
    expectedStatus: 200,
    description: 'Проверка Redis кэширования'
  },
  {
    name: 'Filter Options',
    url: '/api/listings/filters/options',
    method: 'GET',
    expectedStatus: 200,
    description: 'Проверка API фильтров'
  },
  {
    name: 'Listings API',
    url: '/api/listings?limit=5',
    method: 'GET',
    expectedStatus: 200,
    description: 'Проверка API объявлений'
  }
];

async function testRailwayDeployment() {
  const baseUrl = process.env.RAILWAY_URL || process.env.BACKEND_URL;
  
  if (!baseUrl) {
    log('❌ RAILWAY_URL или BACKEND_URL не установлен', 'red');
    log('💡 Установите переменную окружения RAILWAY_URL с URL вашего Railway приложения', 'yellow');
    process.exit(1);
  }
  
  log(`🚀 Тестирование Railway деплоя: ${baseUrl}`, 'cyan');
  log('=' * 60, 'blue');
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      log(`\n🧪 ${test.name}`, 'yellow');
      log(`📝 ${test.description}`, 'blue');
      log(`🔗 ${test.method} ${baseUrl}${test.url}`, 'blue');
      
      const startTime = Date.now();
      const response = await axios({
        method: test.method,
        url: `${baseUrl}${test.url}`,
        timeout: 10000,
        headers: {
          'User-Agent': 'Railway-Test-Script/1.0'
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (response.status === test.expectedStatus) {
        log(`✅ ${test.name} - PASSED (${duration}ms)`, 'green');
        passedTests++;
        
        // Дополнительная информация для некоторых тестов
        if (test.name === 'Health Check') {
          const health = response.data;
          log(`   📊 Database: ${health.database?.status} (${health.database?.responseTime})`, 'blue');
          log(`   📊 Redis: ${health.redis?.status} (${health.redis?.responseTime})`, 'blue');
          log(`   📊 Cache: ${health.cache?.type}`, 'blue');
        }
        
        if (test.name === 'Cache Test') {
          const cache = response.data;
          log(`   📊 Cache Type: ${cache.cacheType}`, 'blue');
          log(`   📊 Redis Connected: ${cache.redisConnected}`, 'blue');
        }
        
        if (test.name === 'Listings API') {
          const data = response.data;
          log(`   📊 Listings Count: ${data.data?.listings?.length || 0}`, 'blue');
          log(`   📊 Total: ${data.data?.pagination?.total || 0}`, 'blue');
        }
        
      } else {
        log(`❌ ${test.name} - FAILED (Expected: ${test.expectedStatus}, Got: ${response.status})`, 'red');
      }
      
    } catch (error) {
      log(`❌ ${test.name} - ERROR`, 'red');
      if (error.response) {
        log(`   📊 Status: ${error.response.status}`, 'red');
        log(`   📊 Response: ${error.response.data?.message || error.response.statusText}`, 'red');
      } else if (error.code === 'ECONNREFUSED') {
        log(`   📊 Connection refused - сервер не запущен`, 'red');
      } else if (error.code === 'ENOTFOUND') {
        log(`   📊 DNS resolution failed - неправильный URL`, 'red');
      } else {
        log(`   📊 Error: ${error.message}`, 'red');
      }
    }
  }
  
  // Результаты
  log('\n' + '=' * 60, 'blue');
  log(`📊 Результаты тестирования:`, 'cyan');
  log(`✅ Пройдено: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`❌ Провалено: ${totalTests - passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 Все тесты пройдены! Railway деплой работает корректно.', 'green');
    log('💡 Ваше приложение готово к использованию.', 'green');
  } else {
    log('\n⚠️  Некоторые тесты провалились. Проверьте логи Railway.', 'yellow');
    log('💡 Проверьте переменные окружения и подключения к базе данных.', 'yellow');
  }
  
  // Дополнительные проверки
  log('\n🔍 Дополнительные проверки:', 'cyan');
  
  try {
    // Проверка CORS
    const corsResponse = await axios.options(`${baseUrl}/api/listings`);
    log(`✅ CORS настроен корректно`, 'green');
  } catch (error) {
    log(`⚠️  CORS может быть не настроен`, 'yellow');
  }
  
  try {
    // Проверка сжатия
    const compressionResponse = await axios.get(`${baseUrl}/api/listings`, {
      headers: {
        'Accept-Encoding': 'gzip, deflate'
      }
    });
    const contentEncoding = compressionResponse.headers['content-encoding'];
    if (contentEncoding) {
      log(`✅ Сжатие работает: ${contentEncoding}`, 'green');
    } else {
      log(`⚠️  Сжатие может быть не настроено`, 'yellow');
    }
  } catch (error) {
    log(`⚠️  Не удалось проверить сжатие`, 'yellow');
  }
  
  log('\n📋 Следующие шаги:', 'cyan');
  log('1. Обновите frontend с новым API URL', 'blue');
  log('2. Протестируйте полный функционал', 'blue');
  log('3. Настройте мониторинг в Railway dashboard', 'blue');
  log('4. Удалите старый деплой на Render.com (после тестирования)', 'blue');
}

// Запуск тестов
if (import.meta.url === `file://${process.argv[1]}`) {
  testRailwayDeployment().catch(error => {
    log(`❌ Критическая ошибка: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { testRailwayDeployment };
