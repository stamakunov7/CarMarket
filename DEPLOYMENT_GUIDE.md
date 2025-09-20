# How I Deployed the Project

## What I Used

- **Frontend**: Vercel (free)
- **Backend**: Render.com (free) 
- **Database**: PostgreSQL on Render.com
- **Images**: Cloudinary

## How I Deployed

### 1. Frontend on Vercel
```bash
cd frontend
npm run build
# Uploaded build folder to Vercel
```

### 2. Backend on Render.com
- Connected GitHub repository
- Set up environment variables
- Automatic deployment

### 3. Database
- Created PostgreSQL on Render.com
- Updated connection string in backend

## Environment Variables

Added to Render.com:
```bash
JWT_SECRET=my_secret_key
PGPASSWORD=my_database_password
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=my_cloudinary
CLOUDINARY_API_KEY=my_api_key
CLOUDINARY_API_SECRET=my_secret
```

## Result

Got:
- Frontend: https://car-market-sage.vercel.app/
- Backend: https://carmarket-wo6e.onrender.com/
- Everything works, users can register and add cars

Deployment time: about 30 minutes
