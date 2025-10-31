# How I Set Up Authentication

## What I Did

### 1. Installed Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Database
Created user and database:
```sql
CREATE USER caruser WITH PASSWORD 'my_password';
CREATE DATABASE cardb OWNER caruser;
```

Ran migrations:
```bash
psql -U caruser -d cardb -f backend/database/setup-db.sql
```

### 3. Environment Variables
Created .env file:
```env
PGUSER=caruser
PGHOST=localhost
PGDATABASE=cardb
PGPASSWORD=my_password
PGPORT=5432

JWT_SECRET=my_secret_key
JWT_EXPIRES_IN=7d

PORT=4000
NODE_ENV=development
```

### 4. Started Server
```bash
cd backend
npm start
```

## Frontend

### 1. Installed Dependencies
```bash
cd frontend
npm install
```

### 2. Started Frontend
```bash
cd frontend
npm start
```

## How to Test

### 1. Registration
- Clicked "Sign in / Register" in navbar
- Switched to "Register"
- Filled username, email, password
- Clicked "Create Account"
- Got success message

### 2. Login
- Clicked "Sign in / Register"
- Stayed on "Sign In"
- Entered email and password
- Clicked "Sign in"
- Got success and modal closed

### 3. Auto-login
- Refreshed page
- User stayed logged in
- Works through httpOnly cookie

### 4. Logout
- Clicked on username in navbar
- Clicked "Sign out"
- Logged out, navbar shows "Sign in / Register"

## What I Got
- Passwords hashed with bcrypt
- JWT tokens in httpOnly cookies
- CORS configured for frontend
- Validation on frontend and backend
- Protected routes
