-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

-- Add new columns to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(50),
ADD COLUMN IF NOT EXISTS engine VARCHAR(100),
ADD COLUMN IF NOT EXISTS drivetrain VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS generation VARCHAR(100),
ADD COLUMN IF NOT EXISTS body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS engine_volume DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS engine_power INTEGER,
ADD COLUMN IF NOT EXISTS transmission VARCHAR(30),
ADD COLUMN IF NOT EXISTS steering_wheel VARCHAR(20),
ADD COLUMN IF NOT EXISTS condition VARCHAR(30),
ADD COLUMN IF NOT EXISTS customs VARCHAR(20),
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration VARCHAR(20),
ADD COLUMN IF NOT EXISTS exchange_possible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags VARCHAR(200),
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS service_history TEXT,
ADD COLUMN IF NOT EXISTS owners_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS vin VARCHAR(17),
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(20);

-- Update existing data to populate new fields
UPDATE listings SET 
  manufacturer = make,
  engine = CASE 
    WHEN make = 'Toyota' AND model = 'Camry' THEN '2.5L 4-cylinder'
    WHEN make = 'Honda' AND model = 'Civic' THEN '2.0L 4-cylinder'
    WHEN make = 'Ford' AND model = 'F-150' THEN '3.3L V6'
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN '2.5L Turbo Flat-6'
    ELSE '2.0L 4-cylinder'
  END,
  drivetrain = CASE 
    WHEN make = 'Ford' AND model = 'F-150' THEN '4WD'
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN 'RWD'
    ELSE 'FWD'
  END,
  location = CASE 
    WHEN make = 'Toyota' THEN 'Orlando, FL'
    WHEN make = 'Honda' THEN 'Miami, FL'
    WHEN make = 'Ford' THEN 'Tampa, FL'
    WHEN make = 'Porsche' THEN 'Boca Raton, FL'
    ELSE 'Orlando, FL'
  END,
  owner_phone = '+1 (555) 123-4567',
  generation = CASE 
    WHEN make = 'Toyota' AND model = 'Camry' THEN 'XV70 (2018-2023)'
    WHEN make = 'Honda' AND model = 'Civic' THEN '11th Gen (2022-present)'
    WHEN make = 'Ford' AND model = 'F-150' THEN '14th Gen (2021-present)'
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN '718 (2016-present)'
    ELSE 'Current Generation'
  END,
  body_type = CASE 
    WHEN make = 'Ford' AND model = 'F-150' THEN 'Pickup Truck'
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN 'Coupe'
    ELSE 'Sedan'
  END,
  color = CASE 
    WHEN make = 'Toyota' THEN 'White'
    WHEN make = 'Honda' THEN 'Silver'
    WHEN make = 'Ford' THEN 'Black'
    WHEN make = 'Porsche' THEN 'Red'
    ELSE 'White'
  END,
  fuel_type = CASE 
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN 'Gasoline'
    ELSE 'Gasoline'
  END,
  engine_volume = CASE 
    WHEN make = 'Toyota' AND model = 'Camry' THEN 2.5
    WHEN make = 'Honda' AND model = 'Civic' THEN 2.0
    WHEN make = 'Ford' AND model = 'F-150' THEN 3.3
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN 2.5
    ELSE 2.0
  END,
  engine_power = CASE 
    WHEN make = 'Toyota' AND model = 'Camry' THEN 203
    WHEN make = 'Honda' AND model = 'Civic' THEN 158
    WHEN make = 'Ford' AND model = 'F-150' THEN 290
    WHEN make = 'Porsche' AND model = 'Cayman S 718' THEN 350
    ELSE 150
  END,
  transmission = 'Automatic',
  steering_wheel = 'Left',
  condition = 'Excellent',
  customs = 'Cleared',
  region = CASE 
    WHEN make = 'Toyota' THEN 'Florida'
    WHEN make = 'Honda' THEN 'Florida'
    WHEN make = 'Ford' THEN 'Florida'
    WHEN make = 'Porsche' THEN 'Florida'
    ELSE 'Florida'
  END,
  registration = 'Registered',
  exchange_possible = FALSE,
  availability = TRUE,
  contact_person = 'John Doe',
  tags = 'Well maintained',
  equipment = 'Air conditioning, Power steering, ABS, Airbags',
  service_history = 'Regular maintenance, Oil changes every 5000 miles',
  owners_count = 1,
  vin = CASE 
    WHEN make = 'Toyota' THEN '1HGBH41JXMN109186'
    WHEN make = 'Honda' THEN '2HGBH41JXMN109187'
    WHEN make = 'Ford' THEN '3HGBH41JXMN109188'
    WHEN make = 'Porsche' THEN '4HGBH41JXMN109189'
    ELSE '5HGBH41JXMN109190'
  END,
  registration_number = CASE 
    WHEN make = 'Toyota' THEN 'ABC-1234'
    WHEN make = 'Honda' THEN 'DEF-5678'
    WHEN make = 'Ford' THEN 'GHI-9012'
    WHEN make = 'Porsche' THEN 'JKL-3456'
    ELSE 'MNO-7890'
  END;

-- Update price to be integer (remove decimal places)
UPDATE listings SET price = ROUND(price);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_primary ON listing_images (listing_id, is_primary);

-- Add constraint to ensure only one primary image per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_images_unique_primary 
ON listing_images (listing_id) 
WHERE is_primary = TRUE;
