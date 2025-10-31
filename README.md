# 🚗 CarMarket - Modern Car Marketplace Platform

A full-stack car marketplace application built with React, TypeScript, Node.js, and PostgreSQL. Features advanced search, image management, user authentication, and real-time filtering capabilities. Link: [CarMarket Live](https://car-market-sage.vercel.app/)

## ✅ Backend is Live on Railway

Backend and PostgreSQL are deployed on Railway. On serverless plans, services can sleep when idle.  
After a cold start, the first response may take 30–60 seconds. If listings don’t appear immediately, please wait and click the “Fetch listings again” button in the UI.


![CarMarket Marketplace](./screenshots/homepage.png)

## 🌟 Features

### 🔐 **User Authentication & Management**
- Secure JWT-based authentication with HTTP-only cookies
- User registration and login with bcrypt password hashing
- Protected routes with middleware authentication
- User profiles with listing management
- Session persistence across browser refreshes

### 🚙 **Advanced Car Listings**
- Create, read, update, delete car listings
- Multiple image upload (up to 10 images per listing)
- Primary image selection and gallery management
- Detailed car specifications (make, model, year, mileage, price)
- Listing status management (active, sold, draft)
- Rich text descriptions with formatting

### 🔍 **Powerful Search & Filtering**
- Full-text search across titles and descriptions
- Advanced filtering by make, model, year, mileage, price range
- Real-time search suggestions
- Multiple sorting options (price, year, mileage, date)
- Pagination with optimized database queries
- Similar listings recommendations

### 🖼️ **Image Management System**
- Cloudinary integration for secure image storage
- Automatic image optimization and compression
- Multiple image formats support (JPEG, PNG, GIF, WebP)
- Image gallery with primary image selection
- Bulk image upload with progress indicators
- Automatic cleanup of unused images

### ⚡ **Performance & Caching**
- **Redis caching** with automatic reconnection and heartbeat mechanism
- In-memory fallback cache with 5-minute TTL
- Connection pooling for PostgreSQL
- Gzip compression for API responses
- Optimized database queries with proper indexing
- Health monitoring endpoints
- Automatic cache cleanup to prevent memory leaks

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Context API** - State management
- **Custom Hooks** - Reusable business logic

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token authentication
- **Multer** - File upload middleware
- **Winston** - Structured logging
- **Helmet.js** - Security middleware
- **Rate Limiting** - API protection

### **Infrastructure & DevOps**
- **Cloudinary** - Image storage and optimization
- **Redis** - Distributed caching on Railway
- **Railway** - Backend, PostgreSQL & Redis hosting
- **Vercel** - Frontend hosting
- **Winston** - Structured application logging

### **Security Features**
- **Helmet.js** - Security headers
- **Rate Limiting** - DDoS protection
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Data sanitization
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Content Security Policy

## 🚀 Deployment

### **Current Deployment Status**
- **Frontend**: Vercel (Production)
- **Backend**: Railway (Serverless – wakes on first request)
- **Database**: PostgreSQL on Railway
- **Cache**: Redis on Railway with automatic reconnection & heartbeat
- **Images**: Cloudinary CDN
- **Caching**: Redis + In-memory fallback cache

### **Deployment Notes**
> ⚠️ **Cold Start (Railway)**: the first request after inactivity can take 30–60 seconds, then everything is fast. If you see an empty list, click "Fetch listings again".
> 
> ✅ **Redis Caching**: Active with automatic heartbeat to prevent service sleeping. Cached requests respond in < 200ms.

### **Production Readiness**
✅ **Security**: Enterprise-level security with Helmet.js, rate limiting, and input validation  
✅ **Performance**: Redis caching with heartbeat, optimized queries, and connection pooling  
✅ **Monitoring**: Health checks, structured logging, and error tracking  
✅ **Scalability**: Stateless architecture ready for horizontal scaling  
✅ **Documentation**: Comprehensive API documentation and setup guides  
✅ **Reliability**: Automatic Redis reconnection with retry logic and fallback cache

### **Environment Variables**
```bash
# Database
PGUSER=your_db_user
PGHOST=your_db_host
PGDATABASE=your_db_name
PGPASSWORD=your_db_password
PGPORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Server
NODE_ENV=production
PORT=4000
```

## 📱 Screenshots

### Homepage with Car Listings
![Homepage](./screenshots/homepage.png)

### Advanced Search & Filtering
![Search](./screenshots/search.png)

### Car Details Page
![Car Details](./screenshots/car-details.png)

### User Dashboard
![Dashboard](./screenshots/dashboard.png)

### Mobile Responsive Design
![Mobile](./screenshots/mobile.png)

### Authentication Modal
![Auth](./screenshots/auth.png)

### Image Upload Interface
![Upload](./screenshots/upload.png)

### Support Page (Telegram Bot Integration)
![Telegram Bot](./screenshots/telegram-bot.png)

## 🏗️ Project Structure

```
sulik/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── data/           # Static data and types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── config/             # Configuration files (Cloudinary, etc.)
│   ├── middleware/         # Custom middleware (upload, etc.)
│   ├── database/           # Database migrations and setup scripts
│   ├── scripts/            # Utility scripts (tests, migrations, etc.)
│   ├── logs/               # Application logs (gitignored)
│   ├── uploads/             # Uploaded files (gitignored)
│   ├── index.js            # Main server file
│   └── package.json
├── docs/                   # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── AUTH_SETUP.md
│   ├── CLOUDINARY_SETUP.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── RAILWAY_MIGRATION_GUIDE.md
│   ├── RAILWAY_REDIS_SETUP.md
│   ├── TELEGRAM_SETUP.md
│   └── SECURITY_SETUP.md
├── screenshots/             # Application screenshots
├── railway.json            # Railway deployment config
├── railway.toml            # Railway configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis (optional, has fallback)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/stamakunov7/CarMarket.git
cd CarMarket
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Setup environment variables**
```bash
# Copy example environment file
cp backend/env.example backend/.env

# Edit the .env file with your credentials
```

4. **Setup database**
```bash
# Create database and run migrations
psql -U postgres -c "CREATE DATABASE sulik_db;"
psql -U postgres -d sulik_db -f backend/database/setup-db.sql
```

5. **Start the application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

## 📊 Performance Metrics

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms (cached with Redis), < 550ms (uncached)
- **Database Query Time**: < 50ms (optimized with indexes)
- **Image Upload**: < 3 seconds for 10 images
- **Cache Hit Rate**: 80%+ for frequently accessed data (Redis + in-memory fallback)

### 🚀 Redis Performance Improvements

After implementing Redis caching, performance improved significantly:

**Before Redis Implementation:**
- ❌ Health Check: **1539ms** (timeouts)
- ❌ Listings API: **Timeout (30s+)** - requests were failing
- ❌ Filter Options: **Timeout** - data wasn't loading
- ❌ Caching: **Not working**

**After Redis Implementation:**
- ✅ Health Check: **534ms** (65% improvement)
- ✅ Listings API: **191ms** (first request, cached) 📦, **193ms** (subsequent) 📦
- ✅ Filter Options: **191ms** (first request, cached) 📦, **193ms** (subsequent) 📦
- ✅ Caching: **Working** (5/6 requests cached)
- ✅ Average response time: **250ms** (instead of timeouts)

![Performance Before Redis](./screenshots/redis-before.png)
*Test results before Redis implementation - all requests were timing out*

![Performance After Redis](./screenshots/redis-after.png)
*Test results after Redis implementation - caching works, requests succeed*

![Railway Architecture](./screenshots/railway-architecture.png)
*Architecture on Railway: Postgres, Redis, and CarMarket services are connected*

## 🎯 Key Achievements

- **Full-Stack Development**: Complete end-to-end application with React, TypeScript, Node.js, and PostgreSQL
- **Type Safety**: Frontend built with 100% TypeScript for type-safe development
- **Performance Optimization**: 65% improvement in response times with Redis caching (250ms average vs 1539ms+ timeouts)
- **Scalable Architecture**: Production-ready with Redis caching, connection pooling, and stateless design
- **Security**: Enterprise-level implementation with JWT authentication, Helmet.js, rate limiting, and input validation
- **Modern UX**: Responsive design with real-time search, advanced filtering, and intuitive interface
- **Cloud Integration**: Successfully deployed on Railway (backend) and Vercel (frontend) with Redis and PostgreSQL

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user (requires authentication)

### Listings Endpoints
- `GET /api/listings` - Get all listings with pagination
- `GET /api/listings/:id` - Get single listing
- `POST /api/users/me/listings` - Create listing
- `PUT /api/users/me/listings/:id` - Update listing
- `DELETE /api/users/me/listings/:id` - Delete listing

### Image Endpoints
- `POST /api/listings/:id/images` - Upload images for a listing (requires authentication)
- `DELETE /api/listings/:listingId/images/:imageId` - Delete an image (requires authentication)
- `PUT /api/listings/:listingId/images/:imageId/primary` - Set primary image (requires authentication)

### Support Endpoint
- `POST /api/support` - Send support message (integrated with Telegram bot)

## 🧪 Testing

```bash
# Run frontend tests (React Testing Library)
cd frontend
npm test

# Test API response times
cd backend
BACKEND_URL=https://carmarket-production.up.railway.app node scripts/test-response-times.js

# Test Railway deployment
cd backend
RAILWAY_URL=https://your-app.railway.app node scripts/test-railway-deployment.js
```

## 📈 Monitoring & Logs

- **Health Check**: `GET /health` - System status with database and Redis connection info
- **Logs**: Structured logging with Winston for production monitoring
- **Metrics**: Response times tracked per endpoint, cache hit rates, error rates
- **Telegram Integration**: Automatic notifications for support messages and critical errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Live Demo

- **Frontend**: [Live Demo](https://car-market-sage.vercel.app/)
- **Backend API**: https://carmarket-production.up.railway.app
- **Health Check**: https://carmarket-production.up.railway.app/health

## 👨‍💻 Author

**Temir Stam**
- GitHub: [@stamakunov7](https://github.com/stamakunov7)
- LinkedIn: [@stamakunov7](https://linkedin.com/in/stamakunov7)
- Email: tstamakunov@stetson.edu

## 💼 Portfolio Project

This project demonstrates expertise in:
- **Modern Full-Stack Development** with React 18, TypeScript, Node.js, Express, and PostgreSQL
- **Performance Optimization** with Redis caching (65% improvement), connection pooling, and query optimization
- **Cloud Deployment** on Railway (backend, database, cache) and Vercel (frontend)
- **Security Implementation** with JWT authentication, Helmet.js, rate limiting, and input validation
- **Scalable Architecture** with stateless design, caching layers, and health monitoring
- **Code Quality** with TypeScript, clean architecture, separation of concerns, and comprehensive documentation

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Cloudinary for image management
- Railway for hosting infrastructure
- PostgreSQL community for the robust database

---

⭐ **Star this repository if you found it helpful!**
