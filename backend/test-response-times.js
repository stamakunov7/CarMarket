/**
 * Script to test API response times
 * Tests the actual response times to verify <100ms claim
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || process.env.RAILWAY_URL || 'http://localhost:4000';

console.log('💡 Для локального тестирования убедитесь, что backend запущен: cd backend && npm run dev\n');

async function testResponseTime(endpoint, method = 'GET', data = null) {
  try {
    const start = Date.now();
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      timeout: 30000,
      validateStatus: () => true // Don't throw on any status
    });
    const duration = Date.now() - start;
    
    return {
      endpoint,
      status: response.status,
      duration,
      cached: response.data?.cached || false,
      success: duration < 100
    };
  } catch (error) {
    return {
      endpoint,
      status: 'error',
      duration: -1,
      error: error.message,
      success: false
    };
  }
}

async function runTests() {
  console.log('🚀 Testing API Response Times\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const tests = [
    { endpoint: '/health', name: 'Health Check' },
    { endpoint: '/api/listings', name: 'Listings (1st request - cold)' },
    { endpoint: '/api/listings', name: 'Listings (2nd request - cached)' },
    { endpoint: '/api/listings?page=1&limit=12', name: 'Listings with pagination' },
    { endpoint: '/api/listings/filters/options', name: 'Filter Options (1st request)' },
    { endpoint: '/api/listings/filters/options', name: 'Filter Options (2nd request - cached)' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testResponseTime(test.endpoint);
    results.push({ ...test, ...result });
    
    const statusIcon = result.success ? '✅' : result.duration > 1000 ? '⚠️' : '⏱️';
    const cacheIcon = result.cached ? '📦' : '';
    console.log(`${statusIcon} ${test.name}: ${result.duration}ms ${cacheIcon}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Summary:');
  console.log('─'.repeat(50));
  
  const successful = results.filter(r => r.success && r.status !== 'error');
  const cached = results.filter(r => r.cached);
  const avgTime = results
    .filter(r => r.duration > 0)
    .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration > 0).length;
  
  console.log(`✅ Requests <100ms: ${successful.length}/${results.length}`);
  console.log(`📦 Cached responses: ${cached.length}/${results.length}`);
  console.log(`⏱️ Average response time: ${Math.round(avgTime)}ms`);
  console.log(`🎯 Target: <100ms (excluding cold start)`);
  
  console.log('\n💡 Note: First request after cold start may be slower due to Railway serverless.');
  console.log('   Subsequent requests should be <100ms when cached.\n');
}

// Run tests
runTests().catch(console.error);

