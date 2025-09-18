-- Create listing_images table for storing image URLs
CREATE TABLE IF NOT EXISTS listing_images (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  cloudinary_public_id VARCHAR(200),
  is_primary BOOLEAN DEFAULT FALSE,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_primary ON listing_images (listing_id, is_primary);

-- Add constraint to ensure only one primary image per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_images_unique_primary 
ON listing_images (listing_id) 
WHERE is_primary = TRUE;
