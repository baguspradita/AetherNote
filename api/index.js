require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Files from 'public' directory (Crucial for local development)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'zenflow_super_secret_jwt_key_2026';

// Database Pool Connection Setup
let pool;
try {
  if (process.env.DATABASE_URL) {
    // If connection URI is provided (common on PlanetScale, Aiven, Railway, etc.)
    console.log('Connecting to MySQL using DATABASE_URL...');
    pool = mysql.createPool(process.env.DATABASE_URL);
  } else {
    // Standard connection configuration
    console.log('Connecting to MySQL using standard parameters...');
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'aethernote',
      port: parseInt(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
} catch (error) {
  console.error('❌ Gagal membuat Database Pool:', error.message);
}

// Helper: Ensure Database and Tables exist on startup
async function initDb() {
  if (!pool) return;
  try {
    // 1. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create Notes Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'Umum',
        color VARCHAR(10) DEFAULT '#8B5CF6',
        tags TEXT, -- Store tags as a JSON string e.g. '["tag1", "tag2"]'
        isPinned TINYINT(1) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('====================================================');
    console.log('✅ Database MySQL Terkoneksi & Tabel Siap Digunakan!');
    console.log('====================================================');
  } catch (error) {
    console.log('====================================================');
    console.error('⚠️ Database MySQL tidak dapat diinisialisasi:', error.message);
    console.log('👉 Pastikan server MySQL aktif dan kredensial di file .env sesuai.');
    console.log('====================================================');
  }
}

// Execute database initialization
initDb();

// Auth Middleware: Verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Akses ditolak: Token tidak valid atau kedaluwarsa.' });
    }
    req.user = user;
    next();
  });
}

// Check DB Connection Middleware
function checkDbConnection(req, res, next) {
  if (!pool) {
    return res.status(500).json({ success: false, message: 'Layanan Database tidak aktif atau salah konfigurasi.' });
  }
  next();
}

// ==========================================
// AUTHENTICATION ENDPOINTS (MYSQL)
// ==========================================

// Register User
app.post('/api/auth/register', checkDbConnection, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi semua field (Nama, Email, Password).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password harus memiliki minimal 6 karakter.' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Gunakan email lain.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    // Insert user
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [userId, name, email.toLowerCase(), hashedPassword]
    );

    // Create JWT Token
    const token = jwt.sign({ id: userId, name, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: userId,
        name,
        email: email.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat registrasi.' });
  }
});

// Login User
app.post('/api/auth/login', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Harap isi Email dan Password.' });
    }

    // Find user in MySQL
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Email atau password salah.' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Email atau password salah.' });
    }

    // Create JWT Token
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat login.' });
  }
});

// Get Current Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==========================================
// NOTES CRUD ENDPOINTS (MYSQL)
// ==========================================

// Get All Notes for Current User
app.get('/api/notes', checkDbConnection, authenticateToken, async (req, res) => {
  try {
    // Sort: Pinned first, then by date descending
    const [rows] = await pool.query(
      'SELECT * FROM notes WHERE userId = ? ORDER BY isPinned DESC, createdAt DESC',
      [req.user.id]
    );

    // Map MySQL fields to match JS schema
    const notes = rows.map(note => ({
      id: note.id,
      userId: note.userId,
      title: note.title,
      content: note.content,
      category: note.category,
      color: note.color,
      tags: note.tags ? JSON.parse(note.tags) : [],
      isPinned: !!note.isPinned,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));

    res.json({ success: true, notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data catatan dari database.' });
  }
});

// Create New Note
app.post('/api/notes', checkDbConnection, authenticateToken, async (req, res) => {
  try {
    const { title, content, category, color, tags, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Judul dan isi catatan wajib diisi.' });
    }

    const noteId = 'note_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const tagsString = JSON.stringify(tags || []);
    const pinnedValue = isPinned ? 1 : 0;

    await pool.query(
      'INSERT INTO notes (id, userId, title, content, category, color, tags, isPinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [noteId, req.user.id, title, content, category || 'Umum', color || '#8B5CF6', tagsString, pinnedValue]
    );

    const newNote = {
      id: noteId,
      userId: req.user.id,
      title,
      content,
      category: category || 'Umum',
      color: color || '#8B5CF6',
      tags: tags || [],
      isPinned: !!isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({ success: true, message: 'Catatan berhasil ditambahkan!', note: newNote });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan catatan baru ke database.' });
  }
});

// Update Note
app.put('/api/notes/:id', checkDbConnection, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, color, tags, isPinned } = req.body;

    // Fetch existing note first to verify ownership and fill unprovided properties
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND userId = ? LIMIT 1', [id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan atau Anda tidak memiliki akses.' });
    }

    const existing = rows[0];

    const uTitle = title !== undefined ? title : existing.title;
    const uContent = content !== undefined ? content : existing.content;
    const uCategory = category !== undefined ? category : existing.category;
    const uColor = color !== undefined ? color : existing.color;
    const uTagsString = tags !== undefined ? JSON.stringify(tags || []) : existing.tags;
    const uIsPinnedVal = isPinned !== undefined ? (isPinned ? 1 : 0) : existing.isPinned;

    // Update note in MySQL
    await pool.query(
      'UPDATE notes SET title = ?, content = ?, category = ?, color = ?, tags = ?, isPinned = ? WHERE id = ? AND userId = ?',
      [uTitle, uContent, uCategory, uColor, uTagsString, uIsPinnedVal, id, req.user.id]
    );

    const updatedNote = {
      id,
      userId: req.user.id,
      title: uTitle,
      content: uContent,
      category: uCategory,
      color: uColor,
      tags: tags !== undefined ? tags : (existing.tags ? JSON.parse(existing.tags) : []),
      isPinned: !!uIsPinnedVal,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, message: 'Catatan berhasil diperbarui!', note: updatedNote });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui catatan di database.' });
  }
});

// Delete Note
app.delete('/api/notes/:id', checkDbConnection, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM notes WHERE id = ? AND userId = ?', [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan atau Anda tidak memiliki akses.' });
    }

    res.json({ success: true, message: 'Catatan berhasil dihapus!' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus catatan dari database.' });
  }
});

// Root check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: pool ? 'connected' : 'offline', timestamp: new Date().toISOString() });
});

// Export Express App for Vercel Serverless Function
module.exports = app;

// Listen only when run locally and not serverless
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AetherNote Backend berjalan di port http://localhost:${PORT}`);
    console.log(`🛢️  Status Database: Terhubung ke MySQL.`);
    console.log(`====================================================`);
  });
}
