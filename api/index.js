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
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
};

// ===== HELPER: Map DB note row to camelCase frontend shape =====
function mapNote(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    category: row.category,
    color: row.color_accent,
    isPinned: row.is_pinned,
    tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ===== AUTH ROUTES =====

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  // Frontend sends { name, email, password }
  const { name, email, password } = req.body;
  const username = name; // map frontend 'name' field to db 'username'

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
  }

  try {
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email atau username sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const newUser = insertResult.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser.id,
        name: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me — Verify token and return current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== NOTES ROUTES =====

// POST /api/notes — Create a new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, content, category, color, tags, isPinned } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Judul dan isi catatan harus diisi' });
  }

  const categoryValue = category || 'Umum';
  const colorValue = color || '#a78bfa';
  const tagsValue = Array.isArray(tags) ? tags.join(',') : (tags || '');
  const pinnedValue = isPinned === true;

  try {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, category, color_accent, is_pinned, tags) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, title, content, categoryValue, colorValue, pinnedValue, tagsValue]
    );

    res.status(201).json({
      success: true,
      message: 'Catatan berhasil dibuat',
      note: mapNote(result.rows[0])
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notes — Get all notes for authenticated user
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY is_pinned DESC, updated_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      notes: result.rows.map(mapNote)
    });
  } catch (error) {
    console.error('Read notes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notes/:id — Update a note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, content, category, color, tags, isPinned } = req.body;
  const noteId = req.params.id;

  try {
    const existing = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan' });
    }

    const current = existing.rows[0];
    const updateTitle = title !== undefined ? title : current.title;
    const updateContent = content !== undefined ? content : current.content;
    const updateCategory = category !== undefined ? category : current.category;
    const updateColor = color !== undefined ? color : current.color_accent;
    const updatePinned = isPinned !== undefined ? isPinned : current.is_pinned;
    const updateTags = tags !== undefined
      ? (Array.isArray(tags) ? tags.join(',') : tags)
      : current.tags;

    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, category = $3, color_accent = $4, is_pinned = $5, tags = $6, updated_at = NOW() WHERE id = $7 AND user_id = $8 RETURNING *',
      [updateTitle, updateContent, updateCategory, updateColor, updatePinned, updateTags, noteId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Catatan berhasil diperbarui',
      note: mapNote(result.rows[0])
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notes/:id — Delete a note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [noteId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan' });
    }

    res.json({ success: true, message: 'Catatan berhasil dihapus' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/notes/:id/pin — Toggle pin status
app.patch('/api/notes/:id/pin', authenticateToken, async (req, res) => {
  const noteId = req.params.id;

  try {
    const existing = await pool.query(
      'SELECT is_pinned FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan' });
    }

    const currentStatus = existing.rows[0].is_pinned;
    const result = await pool.query(
      'UPDATE notes SET is_pinned = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [!currentStatus, noteId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Status catatan berhasil diubah',
      note: mapNote(result.rows[0])
    });
  } catch (error) {
    console.error('Pin note error:', error);
    res.status(500).json({ success: false, message: error.message });
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
