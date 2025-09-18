# Cloudinary Setup Instructions

## 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your Credentials

1. After logging in, go to your Dashboard
2. Copy the following values:
   - Cloud Name
   - API Key
   - API Secret

## 3. Configure Environment Variables

1. Copy the `env.example` file to `.env` in the backend directory:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## 4. Database Setup

Run the database setup scripts to create the images table:

```bash
# Connect to your PostgreSQL database and run:
psql -U caruser -d cardb -f setup-db.sql
psql -U caruser -d cardb -f setup-listings.sql
```

## 5. Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Create a test listing with images to verify everything works

## Features Implemented

✅ **Image Upload**: Users can upload multiple images when creating listings
✅ **Cloud Storage**: Images are stored securely in Cloudinary
✅ **Image Management**: Set primary image, delete images
✅ **API Integration**: Full CRUD operations for images
✅ **Real-time Display**: CarList now shows real listings with images
✅ **Error Handling**: Proper error handling for upload failures
✅ **Loading States**: UI feedback during upload process

## API Endpoints

- `POST /api/users/me/listings/:id/images` - Upload images for a listing
- `GET /api/listings/:id/images` - Get all images for a listing
- `PUT /api/users/me/listings/:id/images/:imageId/primary` - Set primary image
- `DELETE /api/users/me/listings/:id/images/:imageId` - Delete an image
- `GET /api/listings` - Get all listings with primary images

## Next Steps

The image upload system is now fully functional! You can:

1. Create listings with images
2. View listings with their images
3. Manage image galleries
4. Set primary images

This completes the first major feature for your car marketplace!
