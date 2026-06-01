require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  console.log('====================================================');
  console.log('🔄 Memulai Inisialisasi Database Otomatis...');
  console.log('====================================================');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306
  };

  const dbName = process.env.DB_NAME || 'aethernote';

  let connection;
  try {
    // 1. Connect to MySQL server without specifying a database
    connection = await mysql.createConnection(config);
    
    // 2. Create the database if it does not exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database "${dbName}" berhasil dibuat atau sudah tersedia.`);
    
  } catch (error) {
    console.error('❌ Gagal terhubung ke MySQL Server.');
    console.error(`Detail error: ${error.message}`);
    console.log('\n👉 PANDUAN PEMECAHAN MASALAH:');
    console.log('1. Pastikan database MySQL (XAMPP / Laragon) sudah aktif.');
    console.log('2. Periksa kembali konfigurasi host, user, dan password di file .env.');
    console.log('====================================================');
    process.exit(1); // Stop execution if DB connection fails
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
