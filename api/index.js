require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== CONFIGURATION =====
const JWT_SECRET = process.env.JWT_SECRET || 'zenflow_super_secret_jwt_key_2026';

// ===== POSTGRESQL POOL =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// ===== AUTH MIDDLEWARE =====
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  try {
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email atau username sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'Registrasi berhasil', user: insertResult.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== NOTES ROUTES =====
app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, content, category, color_accent } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Judul dan isi catatan harus diisi' });
  }

  const categoryValue = category || 'Umum';
  const colorValue = color_accent || 'violet';

  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, category, color_accent, is_pinned) VALUES ($1, $2, $3, $4, $5, false) RETURNING *',
      [req.user.id, title, content, categoryValue, colorValue]
    );

    res.status(201).json({ message: 'Catatan berhasil dibuat', note: result.rows[0] });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY is_pinned DESC, updated_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Read notes error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, content, category, color_accent } = req.body;
  const noteId = req.params.id;

  try {
    const existing = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    const current = existing.rows[0];
    const updateTitle = title !== undefined ? title : current.title;
    const updateContent = content !== undefined ? content : current.content;
    const updateCategory = category !== undefined ? category : current.category;
    const updateColor = color_accent !== undefined ? color_accent : current.color_accent;

    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, category = $3, color_accent = $4, updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *',
      [updateTitle, updateContent, updateCategory, updateColor, noteId, req.user.id]
    );

    res.json({ message: 'Catatan berhasil diperbarui', note: result.rows[0] });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [noteId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    res.json({ message: 'Catatan berhasil dihapus' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/notes/:id/pin', authenticateToken, async (req, res) => {
  const noteId = req.params.id;

  try {
    const existing = await pool.query(
      'SELECT is_pinned FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    const currentStatus = existing.rows[0].is_pinned;
    const result = await pool.query(
      'UPDATE notes SET is_pinned = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [!currentStatus, noteId, req.user.id]
    );

    res.json({ message: 'Status catatan berhasil diubah', note: result.rows[0] });
  } catch (error) {
    console.error('Pin note error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
