# Car Marketplace API Documentation

## Overview

This document describes the REST API endpoints for the Car Marketplace application. The API provides comprehensive functionality for managing car listings, images, and user interactions.

## Base URL

**Development:**
```
http://localhost:4000/api
```

**Production:**
```
https://carmarket-wo6e.onrender.com/api
```

## Authentication

Most endpoints require authentication via HTTP-only cookies. Include credentials in requests:

```javascript
fetch('/api/endpoint', {
  credentials: 'include'
});
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## Listings API

### Get All Listings

**GET** `/listings`

Retrieve paginated listings with advanced filtering and sorting.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page |
| `make` | string | - | Filter by car make |
| `model` | string | - | Filter by car model |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `minYear` | number | - | Minimum year filter |
| `maxYear` | number | - | Maximum year filter |
| `minMileage` | number | - | Minimum mileage filter |
| `maxMileage` | number | - | Maximum mileage filter |
| `search` | string | - | Full-text search |
| `sortBy` | string | created_at | Sort field (created_at, price, year, mileage, title) |
| `sortOrder` | string | desc | Sort order (asc, desc) |
| `status` | string | active | Filter by status (active, sold, draft, all) |
| `userId` | number | - | Filter by specific user |

#### Example Request

```bash
curl "http://localhost:4000/api/listings?page=1&limit=5&sortBy=price&sortOrder=asc&make=Toyota"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": 1,
        "title": "2019 Toyota Camry",
        "description": "Excellent condition...",
        "price": "25000.00",
        "make": "Toyota",
        "model": "Camry",
        "year": 2019,
        "mileage": 45000,
        "status": "active",
        "created_at": "2025-09-13T22:06:44.585Z",
        "updated_at": "2025-09-13T22:06:44.585Z",
        "primary_image": "https://res.cloudinary.com/...",
        "primary_image_id": 1,
        "seller_username": "john_doe",
        "seller_id": 1,
        "image_count": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "pages": 5,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "applied": {
        "make": "Toyota",
        "model": null,
        "minPrice": null,
        "maxPrice": null,
        "minYear": null,
        "maxYear": null,
        "minMileage": null,
        "maxMileage": null,
        "search": null,
        "sortBy": "price",
        "sortOrder": "asc"
      },
      "available": {
        "makes": ["Toyota", "Honda", "Ford"],
        "models": ["Camry", "Civic", "F-150"],
        "min_year": 2004,
        "max_year": 2025,
        "min_price": "4999.00",
        "max_price": "114570.00",
        "min_mileage": 115,
        "max_mileage": 65000
      }
    }
  }
}
```

### Get Single Listing

**GET** `/listings/:id`

Retrieve detailed information about a specific listing including all images.

#### Example Request

```bash
curl "http://localhost:4000/api/listings/1"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "listing": {
      "id": 1,
      "title": "2019 Toyota Camry",
      "description": "Excellent condition...",
      "price": "25000.00",
      "make": "Toyota",
      "model": "Camry",
      "year": 2019,
      "mileage": 45000,
      "status": "active",
      "created_at": "2025-09-13T22:06:44.585Z",
      "updated_at": "2025-09-13T22:06:44.585Z",
      "seller_username": "john_doe",
      "seller_id": 1,
      "seller_joined_date": "2025-09-01T10:00:00.000Z",
      "images": [
        {
          "id": 1,
          "image_url": "https://res.cloudinary.com/...",
          "is_primary": true,
          "image_order": 0,
          "created_at": "2025-09-13T22:06:45.000Z"
        }
      ]
    }
  }
}
```

### Get Filter Options

**GET** `/listings/filters/options`

Get available filter options for the frontend.

#### Example Response

```json
{
  "success": true,
  "data": {
    "makes": ["Toyota", "Honda", "Ford", "Porsche"],
    "models": ["Camry", "Civic", "F-150", "Cayman S 718"],
    "min_year": 2004,
    "max_year": 2025,
    "min_price": "4999.00",
    "max_price": "114570.00",
    "min_mileage": 115,
    "max_mileage": 65000,
    "total_listings": 5
  }
}
```

### Search Suggestions

**GET** `/listings/search/suggestions`

Get search suggestions based on query.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (minimum 2 characters) |

#### Example Request

```bash
curl "http://localhost:4000/api/listings/search/suggestions?q=toyota"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "Toyota Camry",
        "make": "Toyota",
        "model": "Camry",
        "count": "2"
      },
      {
        "text": "Toyota Prius",
        "make": "Toyota",
        "model": "Prius",
        "count": "1"
      }
    ]
  }
}
```

### Get Similar Listings

**GET** `/listings/:id/similar`

Get similar listings based on make, model, year, and price.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 4 | Number of similar listings to return |

#### Example Request

```bash
curl "http://localhost:4000/api/listings/1/similar?limit=3"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "similar": [
      {
        "id": 2,
        "title": "2020 Toyota Camry",
        "price": "28000.00",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "mileage": 35000,
        "primary_image": "https://res.cloudinary.com/..."
      }
    ],
    "based_on": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2019,
      "price": "25000.00"
    }
  }
}
```

---

## User Listings API

### Get User's Listings

**GET** `/users/me/listings`

Get all listings for the authenticated user.

**Authentication:** Required

#### Example Response

```json
{
  "listings": [
    {
      "id": 1,
      "title": "2019 Toyota Camry",
      "description": "Excellent condition...",
      "price": "25000.00",
      "make": "Toyota",
      "model": "Camry",
      "year": 2019,
      "mileage": 45000,
      "status": "active",
      "created_at": "2025-09-13T22:06:44.585Z",
      "updated_at": "2025-09-13T22:06:44.585Z"
    }
  ]
}
```

### Create Listing

**POST** `/users/me/listings`

Create a new listing.

**Authentication:** Required

#### Request Body

```json
{
  "title": "2019 Toyota Camry",
  "description": "Excellent condition, one owner",
  "price": 25000,
  "make": "Toyota",
  "model": "Camry",
  "year": 2019,
  "mileage": 45000
}
```

#### Example Response

```json
{
  "message": "Listing created successfully",
  "listing": {
    "id": 1,
    "title": "2019 Toyota Camry",
    "description": "Excellent condition, one owner",
    "price": "25000.00",
    "make": "Toyota",
    "model": "Camry",
    "year": 2019,
    "mileage": 45000,
    "status": "active",
    "created_at": "2025-09-13T22:06:44.585Z",
    "updated_at": "2025-09-13T22:06:44.585Z"
  }
}
```

### Update Listing

**PUT** `/users/me/listings/:id`

Update an existing listing.

**Authentication:** Required

### Delete Listing

**DELETE** `/users/me/listings/:id`

Delete a listing.

**Authentication:** Required

---

## Images API

### Upload Images

**POST** `/users/me/listings/:id/images`

Upload images for a listing.

**Authentication:** Required

#### Request

Multipart form data with `images` field containing image files.

#### Example Response

```json
{
  "message": "Images uploaded successfully",
  "images": [
    {
      "id": 1,
      "image_url": "https://res.cloudinary.com/...",
      "is_primary": true,
      "image_order": 0
    }
  ],
  "uploaded": 2,
  "failed": 0
}
```

### Get Listing Images

**GET** `/listings/:id/images`

Get all images for a listing.

#### Example Response

```json
{
  "images": [
    {
      "id": 1,
      "image_url": "https://res.cloudinary.com/...",
      "is_primary": true,
      "image_order": 0
    }
  ]
}
```

### Set Primary Image

**PUT** `/users/me/listings/:id/images/:imageId/primary`

Set an image as the primary image for a listing.

**Authentication:** Required

### Delete Image

**DELETE** `/users/me/listings/:id/images/:imageId`

Delete an image from a listing.

**Authentication:** Required

---

## Authentication API

### Register

**POST** `/register`

Register a new user.

#### Request Body

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

**POST** `/login`

Login a user.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout

**POST** `/logout`

Logout the current user.

### Get Current User

**GET** `/me`

Get information about the current authenticated user.

**Authentication:** Required

---

## Support API

### Submit Support Request

**POST** `/support`

Submit a support request that will be sent to the admin via Telegram Bot.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Car listing issue",
  "message": "I can't upload images for my car listing"
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

#### Error Response

```json
{
  "success": false,
  "error": "All fields are required"
}
```

**Note:** This endpoint integrates with Telegram Bot to send notifications to the admin when support requests are submitted.

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Rate Limiting

Rate limiting is implemented with the following limits:
- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 attempts per 15 minutes per IP
- **File upload**: 10 requests per 15 minutes per IP

## CORS

The API supports CORS for:
- **Development**: `http://localhost:3000`
- **Production**: `https://car-market-sage.vercel.app`

## File Upload Limits

- Maximum file size: 10MB per image
- Maximum files per request: 10 images
- Supported formats: JPEG, PNG, GIF, WebP
