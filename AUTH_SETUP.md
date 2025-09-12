# Authentication System Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
1. Make sure PostgreSQL is running
2. Create database and user:
```sql
-- Connect to PostgreSQL as superuser
psql postgres

-- Create user and database
CREATE USER caruser WITH PASSWORD 'yourpassword';
CREATE DATABASE cardb OWNER caruser;
GRANT ALL PRIVILEGES ON DATABASE cardb TO caruser;
\q
```

3. Run the database setup:
```bash
psql -U caruser -d cardb -f setup-db.sql
```

### 3. Environment Variables
Create a `.env` file in the backend directory:
```env
# Database Configuration
PGUSER=caruser
PGHOST=localhost
PGDATABASE=cardb
PGPASSWORD=yourpassword
PGPORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=4000
NODE_ENV=development
```

### 4. Start Backend Server
```bash
cd backend
npm start
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend
```bash
cd frontend
npm start
```

## Testing the Authentication System

### 1. Registration
- Click "Sign in / Register" in the navbar
- Switch to "Register" tab
- Fill in username, email, and password
- Click "Create Account"
- Should see success message and modal closes
- Navbar should show username with dropdown menu

### 2. Login
- Click "Sign in / Register" in the navbar
- Stay on "Sign In" tab
- Enter email and password
- Click "Sign in"
- Should see success and modal closes
- Navbar should show username with dropdown menu

### 3. Auto-login
- Refresh the page
- User should remain logged in (navbar shows username)
- This works via the `/api/me` endpoint checking the httpOnly cookie

### 4. Logout
- Click on username in navbar
- Click "Sign out" in dropdown
- Should be logged out and navbar shows "Sign in / Register" again

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user (protected)

## Security Features

- Passwords are hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- CORS configured for frontend origin
- Input validation on both frontend and backend
- Protected routes with authentication middleware

## Troubleshooting

1. **Database connection issues**: Check PostgreSQL is running and credentials are correct
2. **CORS errors**: Ensure backend is running on port 4000 and frontend on port 3000
3. **Cookie issues**: Check browser developer tools for cookie settings
4. **JWT errors**: Verify JWT_SECRET is set in environment variables
