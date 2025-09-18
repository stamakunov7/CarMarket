# 📊 Monitoring & Performance Guide

## ✅ Implemented Features

### 🔍 **Monitoring & Logging**
- ✅ **Winston Logger** - Structured logging with file and console output
- ✅ **Request Logging** - All HTTP requests logged with duration and status
- ✅ **Error Tracking** - Detailed error logging with stack traces
- ✅ **Health Check** - `/health` endpoint for monitoring system status
- ✅ **Performance Metrics** - Response times, memory usage, database connection time

### ⚡ **Performance Optimizations**
- ✅ **Gzip Compression** - Reduces response size by ~70%
- ✅ **Database Connection Pooling** - Optimized connection management
- ✅ **In-Memory Caching** - 5-minute TTL cache for filter options
- ✅ **Request Timeout Protection** - Prevents hanging requests

## 📈 **Monitoring Endpoints**

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1024768
  },
  "database": {
    "status": "connected",
    "responseTime": "2ms"
  },
  "cache": {
    "size": 1,
    "entries": ["filter_options"]
  },
  "environment": "production"
}
```

## 📝 **Log Files**

### Log Locations
- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All logs (info, warn, error)
- Console output - Development logging

### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/listings",
  "status": 200,
  "duration": "45ms",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "service": "car-marketplace-api"
}
```

## 🚀 **Performance Features**

### Caching
- **Filter Options Cache** - 5-minute TTL
- **Automatic Cleanup** - Expired entries removed every 10 minutes
- **Cache Statistics** - Available in health check

### Database Optimization
- **Connection Pool** - Max 20 connections
- **Idle Timeout** - 30 seconds
- **Connection Timeout** - 2 seconds
- **Query Performance** - All queries logged with duration

### Compression
- **Gzip Compression** - Enabled for all responses
- **Size Reduction** - ~70% smaller responses
- **Automatic Detection** - Browser compatibility

## 🔧 **Environment Variables**

Add to your `.env` file:
```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Performance
NODE_ENV=production
```

## 📊 **Monitoring Tools Integration**

### For Production Deployment:

1. **Uptime Monitoring**
   - Use `/health` endpoint
   - Check every 1-5 minutes
   - Alert on 503 status

2. **Log Aggregation**
   - Ship logs to services like:
     - **Datadog** - Full APM solution
     - **New Relic** - Application monitoring
     - **Sentry** - Error tracking
     - **LogRocket** - Session replay

3. **Performance Monitoring**
   - Monitor response times
   - Track memory usage
   - Database query performance
   - Cache hit rates

## 🚨 **Alerting Setup**

### Critical Alerts
- Health check failures (503 status)
- High error rates (>5% of requests)
- High response times (>2 seconds)
- Memory usage >80%
- Database connection failures

### Warning Alerts
- Cache miss rate >50%
- High request volume (>1000/min)
- Disk space <20%

## 📈 **Performance Benchmarks**

### Expected Performance
- **API Response Time** - <100ms average
- **Database Queries** - <50ms average
- **Cache Hit Rate** - >80% for filter options
- **Memory Usage** - <100MB typical
- **Compression Ratio** - ~70% size reduction

### Load Testing
```bash
# Test with Apache Bench
ab -n 1000 -c 10 http://localhost:4000/health

# Test API endpoints
ab -n 500 -c 5 http://localhost:4000/api/listings
```

## 🔍 **Troubleshooting**

### Common Issues
1. **High Memory Usage**
   - Check for memory leaks
   - Monitor cache size
   - Restart if needed

2. **Slow Database Queries**
   - Check query logs
   - Add database indexes
   - Optimize complex queries

3. **Cache Issues**
   - Clear cache: restart server
   - Check TTL settings
   - Monitor cache hit rates

### Debug Commands
```bash
# Check logs
tail -f logs/combined.log

# Monitor health
curl http://localhost:4000/health

# Check cache status
curl http://localhost:4000/health | jq '.cache'
```

## 🎯 **Next Steps for Production**

1. **Set up log aggregation** (Datadog/New Relic)
2. **Configure uptime monitoring** (Pingdom/UptimeRobot)
3. **Add database monitoring** (pgAdmin/DataDog)
4. **Set up alerting** (Slack/Email notifications)
5. **Implement Redis cache** for better performance
6. **Add APM tracing** for request flow analysis

---

**Your marketplace now has enterprise-level monitoring and performance optimization! 🚀**
