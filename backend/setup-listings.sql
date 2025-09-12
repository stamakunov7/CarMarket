-- Create listings table
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  mileage INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_listings_user_id ON listings (user_id);
CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_created_at ON listings (created_at);

-- Insert some sample listings for testing
INSERT INTO listings (user_id, title, description, price, make, model, year, mileage, status) VALUES
(1, '2019 Toyota Camry', 'Excellent condition, one owner, all service records available', 25000.00, 'Toyota', 'Camry', 2019, 45000, 'active'),
(1, '2020 Honda Civic', 'Low mileage, perfect for city driving', 22000.00, 'Honda', 'Civic', 2020, 32000, 'active'),
(1, '2018 Ford F-150', 'Great truck for work or recreation', 35000.00, 'Ford', 'F-150', 2018, 65000, 'sold');
