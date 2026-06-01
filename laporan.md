# 📋 LAPORAN DOKUMENTASI TEKNIS
## AetherNote — Aplikasi Catatan & Jurnal Premium

**Tanggal Pembuatan:** 1 Juni 2026  
**Versi:** 1.0.0  
**Status:** Development  
**Platform:** Express.js + MySQL + Vanilla JS

---

## 📑 DAFTAR ISI

1. [Executive Summary](#executive-summary)
2. [Spesifikasi Teknis](#spesifikasi-teknis)
3. [Arsitektur Sistem](#arsitektur-sistem)
4. [Panduan Instalasi & Setup](#panduan-instalasi--setup)
5. [Fitur-Fitur Utama](#fitur-fitur-utama)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Panduan Deployment](#panduan-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Executive Summary

**AetherNote** adalah aplikasi web full-stack modern yang dirancang untuk memudahkan pengguna dalam mencatat ide, menulis jurnal harian, dan mengelola daftar tugas dengan antarmuka yang elegan dan responsif.

### Tujuan Aplikasi
- ✅ Menyediakan platform catatan yang aman dan personal
- ✅ Implementasi autentikasi modern menggunakan JWT
- ✅ Manajemen data catatan dengan enkripsi password
- ✅ Hosting scalable di platform cloud (Vercel)

### Target Pengguna
- Individu yang ingin mencatat ide dan jurnal pribadi
- Pelajar/profesional untuk manajemen tugas
- Pengguna yang menghargai privasi dan keamanan data

---

## 🛠️ Spesifikasi Teknis

### Stack Teknologi

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Backend** | Node.js + Express.js | 5.2.1 | REST API Server |
| **Database** | MySQL | 5.7+ | Penyimpanan data persisten |
| **Driver DB** | mysql2/promise | 3.22.4 | Koneksi async MySQL |
| **Autentikasi** | JSON Web Token | 9.0.3 | Session management |
| **Enkripsi** | bcryptjs | 3.0.3 | Password hashing |
| **CORS** | cors | 2.8.6 | Cross-origin requests |
| **Config** | dotenv | 17.4.2 | Environment variables |
| **Frontend** | Vanilla JavaScript | ES6+ | SPA logic tanpa framework |
| **Styling** | CSS3 | Modern | Responsive design |
| **Hosting** | Vercel | Serverless | Platform deployment |

### Requirements

#### Minimum System
- Node.js v14+ (Recommended: v18+)
- MySQL Server 5.7+
- Browser modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet

#### Local Development
- RAM: 2GB minimum
- Storage: 500MB
- OS: Windows, macOS, Linux

#### Production
- Cloud MySQL hosting (Railway, Aiven, PlanetScale)
- Vercel account
- GitHub repository

---

## 🏗️ Arsitektur Sistem

### Struktur Folder Project

```
express-hosting/
├── api/
│   └── index.js              # 🔧 Backend Express server
├── public/
│   ├── index.html            # 🎨 Frontend HTML (SPA)
│   ├── css/
│   │   └── style.css         # 🎭 Styling responsif
│   └── js/
│       └── app.js            # ⚙️ Logika frontend
├── .env                       # 🔐 Environment variables (SECRET)
├── .gitignore                # 📝 Git ignore rules
├── init-db.js                # 🗄️ Database initialization
├── package.json              # 📦 Dependencies & scripts
├── package-lock.json         # 🔒 Dependency lock
├── vercel.json               # ☁️ Vercel config
└── node_modules/             # 📚 Dependencies (ignored)
```

### Flow Arsitektur

```
┌─────────────────────────────────────────────┐
│         FRONTEND (Public/)                   │
│  ┌──────────────────────────────────────┐   │
│  │  index.html - Tampilan UI            │   │
│  │  app.js - Logika & Fetch API         │   │
│  │  style.css - Responsive Design       │   │
│  └──────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │
        HTTP/REST API
     (JSON + JWT Token)
               │
┌──────────────▼──────────────────────────────┐
│        BACKEND (api/index.js)                │
│  ┌──────────────────────────────────────┐   │
│  │  Express Server + Middleware         │   │
│  │  - CORS handling                     │   │
│  │  - JWT verification                 │   │
│  │  - Route handlers                   │   │
│  └──────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │
        Database Connection
          (mysql2/promise)
               │
┌──────────────▼──────────────────────────────┐
│      DATABASE (MySQL)                        │
│  ┌──────────────────────────────────────┐   │
│  │  Table: users                        │   │
│  │  Table: notes                        │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## 📦 Panduan Instalasi & Setup

### Fase 1: Persiapan Awal

#### 1.1 Prasyarat Sistem
```bash
# Verifikasi Node.js terinstall
node --version    # Minimal v14.0.0
npm --version     # Minimal v6.0.0

# Verifikasi MySQL running
mysql --version
```

#### 1.2 Inisialisasi NPM
```bash
npm init -y
```

**Output**: File `package.json` dibuat

---

### Fase 2: Instalasi Dependencies

#### 2.1 Install All Packages
```bash
npm install express cors jsonwebtoken bcryptjs mysql2 dotenv
```

**Dependencies yang diinstall**:
- `express` - Web framework
- `cors` - Enable cross-origin
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `mysql2` - MySQL driver
- `dotenv` - Environment config

#### 2.2 Verifikasi Installation
```bash
npm list
```

---

### Fase 3: Setup Database

#### 3.1 Buat Database Kosong
```sql
-- Buka MySQL CLI atau phpMyAdmin
CREATE DATABASE aethernote;
```

#### 3.2 Konfigurasi Environment Variables
**File**: `.env` (root folder)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=zenflow_super_secret_jwt_key_2026_aethernote
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=aethernote
```

---

### Fase 4: Menjalankan Aplikasi

#### 4.1 Run Development Server
```bash
npm run dev
```

**Expected Output**:
```
✅ Terhubung ke MySQL
✅ Database "aethernote" siap
✅ Table "users" siap
✅ Table "notes" siap
✅ Database initialization berhasil!

✅ Database pool siap
🚀 Server berjalan di http://localhost:3000
```

#### 4.2 Akses Aplikasi
Buka browser: **http://localhost:3000**

#### 4.3 Test Aplikasi
1. Daftar akun baru
2. Login dengan akun
3. Buat catatan
4. Test search & filter
5. Coba edit, delete, pin notes

---

## ✨ Fitur-Fitur Utama

### 1. 🔐 Autentikasi & Keamanan

**Registrasi**
- Input: Username, Email, Password
- Process: Validasi duplikasi, bcrypt hashing
- Output: User tersimpan di database

**Login**
- Input: Email, Password
- Process: Verifikasi password, generate JWT token
- Output: Token (7 hari valid) + User info

**Token Management**
- JWT token disimpan di localStorage
- Auto-attached ke setiap API request
- Ekspirasi otomatis setelah 7 hari

### 2. 📝 CRUD Catatan

**Create Note**
- Judul, isi, kategori, warna aksen
- Otomatis timestamp
- Validate input sebelum submit

**Read Notes**
- Fetch semua notes user
- Sorted by pin status & date
- Display dalam grid layout

**Update Note**
- Edit judul & isi
- Preserve metadata
- Soft update tanpa refresh page

**Delete Note**
- Hapus catatan permanen
- Confirmation dialog
- Cascade delete di database

### 3. 🏷️ Kategori & Organisasi

**5 Kategori Tersedia**
- 📝 Umum
- ✅ Tugas
- 💡 Ide
- 🔐 Pribadi
- 🛒 Belanja

**Filter by Category**
- Sidebar buttons
- Real-time filtering
- Visual feedback (active state)

### 4. 🎨 Sistem Warna Dinamis

**5 Color Accents**
- 🟣 Violet (#a78bfa)
- 🩷 Pink (#f472b6)
- 💚 Emerald (#6ee7b7)
- 💙 Blue (#60a5fa)
- 🟠 Amber (#fbbf24)

**Visual Effects**
- Top border colored
- Card shadow effects
- Hover animations

### 5. 🔍 Pencarian Real-Time

**Search Features**
- Cari berdasarkan judul
- Cari berdasarkan isi
- Case-insensitive matching
- Instant results

### 6. 📌 Pin/Unpin Notes

**Prioritas Notes**
- Pinned notes muncul pertama
- Toggle pin status
- Visual indicator (📌 vs 📍)

### 7. 📱 Responsive Design

**Mobile Support**
- Tested di breakpoint: 768px
- Sidebar hidden di mobile
- Touch-friendly buttons
- Stack layout

---

## 🗄️ Database Schema

### Table: users

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Kolom**:
- `id` - Primary key, auto-increment
- `username` - Unique username (100 char max)
- `email` - Unique email (100 char max)
- `password` - Hashed password (bcryptjs)
- `created_at` - Timestamp otomatis

### Table: notes

```sql
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  category VARCHAR(50) DEFAULT 'Umum',
  color_accent VARCHAR(50) DEFAULT 'violet',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Kolom**:
- `id` - Primary key
- `user_id` - Foreign key ke users
- `title` - Judul catatan
- `content` - Isi catatan (unlimited)
- `category` - Kategori (default: Umum)
- `color_accent` - Warna (default: violet)
- `is_pinned` - Status pin (default: false)
- `created_at` - Waktu dibuat
- `updated_at` - Waktu terakhir update

---

## 🔌 API Endpoints

### Authentication Endpoints

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}

Response (201):
{
  "message": "Registrasi berhasil"
}
```

#### 2. Login User
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "secure_password"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Notes Endpoints

#### 3. Create Note
```
POST /api/notes
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "Judul Catatan",
  "content": "Isi catatan lengkap...",
  "category": "Umum",
  "color_accent": "violet"
}

Response (201):
{
  "message": "Catatan berhasil dibuat"
}
```

#### 4. Get All Notes
```
GET /api/notes
Authorization: Bearer {token}

Response (200):
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Judul Catatan",
    "content": "Isi catatan...",
    "category": "Umum",
    "color_accent": "violet",
    "is_pinned": false,
    "created_at": "2026-06-01T10:00:00.000Z",
    "updated_at": "2026-06-01T10:00:00.000Z"
  }
]
```

#### 5. Update Note
```
PUT /api/notes/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "Judul Baru",
  "content": "Isi yang sudah diubah...",
  "category": "Tugas",
  "color_accent": "blue"
}

Response (200):
{
  "message": "Catatan berhasil diperbarui"
}
```

#### 6. Delete Note
```
DELETE /api/notes/:id
Authorization: Bearer {token}

Response (200):
{
  "message": "Catatan berhasil dihapus"
}
```

#### 7. Toggle Pin Note
```
PATCH /api/notes/:id/pin
Authorization: Bearer {token}

Response (200):
{
  "message": "Status catatan berhasil diubah"
}
```

---

## ☁️ Panduan Deployment

### Step 1: Persiapan GitHub

#### 1.1 Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: AetherNote Express"
git branch -M main
```

#### 1.2 Create GitHub Repository
1. Login ke [github.com](https://github.com)
2. Click "New repository"
3. Nama: `express-hosting`
4. Create repository

#### 1.3 Push ke GitHub
```bash
git remote add origin https://github.com/username/express-hosting.git
git push -u origin main
```

### Step 2: Setup Cloud MySQL

**Option A: Railway.app**
1. Buka [railway.app](https://railway.app)
2. Create new project → MySQL
3. Copy DATABASE_URL

**Option B: Aiven.io**
1. Create account di [aiven.io](https://aiven.io)
2. New service → MySQL
3. Copy connection string

### Step 3: Deploy ke Vercel

#### 3.1 Connect GitHub
1. Buka [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select repository
4. Click "Import"

#### 3.2 Configure Environment Variables
```
JWT_SECRET=your_secret_key_here
DB_HOST=your_cloud_mysql_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=aethernote
DATABASE_URL=mysql://user:password@host:port/database
```

#### 3.3 Deploy
1. Review settings
2. Click "Deploy"
3. Wait untuk completion

---

## 🔧 Troubleshooting

### Error: Cannot find module 'express'

**Solusi**:
```bash
npm install
```
**Penjelasan**: Dependencies belum diinstall.

---

### Error: ECONNREFUSED - Database Connection Failed

**Solusi**:
1. Pastikan MySQL server running
2. Cek kredensial di `.env` file
3. Verifikasi database `aethernote` sudah dibuat

---

### Error: JWT Token Invalid/Expired

**Solusi**:
1. Clear localStorage di browser
2. Login ulang untuk mendapat token baru
3. Verifikasi JWT_SECRET di `.env`

---

### Error: 401 Unauthorized

**Solusi**:
1. Pastikan token sudah disimpan di localStorage
2. Cek header Authorization: `Bearer {token}`
3. Format header harus tepat

---

## ✅ Checklist Deployment

- [ ] GitHub repository created
- [ ] All files committed & pushed
- [ ] Cloud MySQL database setup
- [ ] Environment variables configured
- [ ] Vercel project linked
- [ ] Initial deployment successful
- [ ] Test register/login
- [ ] Test create/read notes
- [ ] Test update/delete notes
- [ ] Monitor production logs

---

**Dokumen ini dibuat pada: 1 Juni 2026**  
**Versi Dokumen: 1.0.0**  
**Status: Final**

---

*Laporan teknis ini dirancang untuk memberikan panduan lengkap setup, deployment, dan maintenance aplikasi AetherNote Express Hosting.*
