#!/bin/bash

# Railway startup script
echo "🚀 Starting Car Marketplace Backend on Railway..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
sleep 5

# Run database migrations if needed
echo "🔄 Checking database schema..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkTables() {
  try {
    const result = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('📊 Found tables:', result.rows.map(r => r.table_name));
    
    if (result.rows.length === 0) {
      console.log('⚠️  No tables found, database might need initialization');
    } else {
      console.log('✅ Database tables found');
    }
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
"

# Start the application
echo "🎯 Starting Node.js application..."
exec npm start
