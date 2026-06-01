require('dotenv').config();
const { Client } = require('pg');

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL tidak ditemukan di .env\n');
    console.log('📋 Setup Supabase PostgreSQL:\n');
    console.log('1️⃣  Buka https://app.supabase.com');
    console.log('2️⃣  Buka project Anda\n');
    console.log('3️⃣  Pergi ke Settings → Database\n');
    console.log('4️⃣  Salin connection string URI\n');
    console.log('5️⃣  Paste ke .env file:\n');
    console.log('   DATABASE_URL=postgresql://user:password@host:port/database\n');
    console.log('6️⃣  Jalankan: npm run dev\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Terhubung ke Supabase PostgreSQL');

    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "users" siap');

    // 2. Create notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category VARCHAR(50) DEFAULT 'Umum',
        color_accent VARCHAR(50) DEFAULT 'violet',
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "notes" siap');

    await client.end();
    console.log('✅ Database initialization berhasil!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDb();
