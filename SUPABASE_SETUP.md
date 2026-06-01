# 🔧 PANDUAN SETUP SUPABASE

## 📚 Kenapa Ganti ke Supabase?

Masalah login di Vercel terjadi karena:
- ❌ MySQL lokal **tidak bisa diakses** dari Vercel (serverless environment)
- ✅ Supabase adalah **cloud database** yang accessible dari mana saja
- ✅ Gratis untuk development & production
- ✅ Langsung terintegrasi dengan PostgreSQL

---

## 🚀 Langkah Setup Supabase

### Step 1: Buat Account Supabase

1. Buka **https://supabase.com**
2. Klik **"Sign Up"** atau login dengan GitHub
3. Verifikasi email Anda

---

### Step 2: Buat Project Baru

1. Di dashboard, klik **"New Project"**
2. Isi form:
   - **Name**: `aethernote`
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih terdekat dengan lokasi Anda (misal: Singapore, Frankfurt)
3. Klik **"Create new project"**
4. Tunggu proses creation selesai (±2 menit)

---

### Step 3: Salin API Keys

1. Di sidebar, buka **Settings → API**
2. Salin nilai berikut:
   ```
   SUPABASE_URL = Project URL (contoh: https://xxxxx.supabase.co)
   SUPABASE_ANON_KEY = anon (public) key
   SUPABASE_SERVICE_KEY = service_role key ⚠️ JANGAN SHARE!
   ```

---

### Step 4: Update File .env

Edit file `.env` di project root:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=zenflow_super_secret_jwt_key_2026_aethernote

# ===== SUPABASE CONFIGURATION =====
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

**Contoh:**
```env
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 5: Buat Tabel di Supabase

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik **"New Query"**
3. Copy-paste dan jalankan **Query 1** di bawah ini:

#### Query 1: Buat Users Table

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Buat query baru lagi, copy-paste **Query 2**:

#### Query 2: Buat Notes Table

```sql
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'Umum',
  color_accent VARCHAR(50) DEFAULT 'violet',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

5. **Klik "Run"** di setiap query

✅ Sekarang tabel sudah terbuat di Supabase!

---

### Step 6: Jalankan Aplikasi Lokal

```bash
npm run dev
```

**Output yang diharapkan:**
```
🔌 Menghubungkan ke Supabase...
✅ Supabase Client berhasil dibuat
🚀 Server berjalan di http://localhost:3000
✅ Siap menerima request...
```

---

## ✅ Test Aplikasi

1. Buka **http://localhost:3000**
2. Klik **"Daftar"**
3. Isi form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
4. Klik **"Daftar"**
5. Jika berhasil, otomatis login ✅

---

## ☁️ Deploy ke Vercel dengan Supabase

### Step 1: Update Environment Variables di Vercel

1. Buka **Vercel Dashboard** → Project → Settings
2. Buka tab **Environment Variables**
3. Tambahkan:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key (optional untuk Vercel)
JWT_SECRET=zenflow_super_secret_jwt_key_2026_aethernote
```

4. Click **"Save"**

### Step 2: Deploy Ulang

Di Vercel dashboard, klik **"Redeploy"** di project Anda

### Step 3: Test Production

Buka URL Vercel project Anda dan test:
- Register akun baru
- Login
- Buat catatan
- Search & filter

---

## 🔐 Security Tips

### ⚠️ JANGAN share:
- `SUPABASE_SERVICE_KEY` (jangan expose ke frontend)
- `JWT_SECRET` (jangan share)

### ✅ Yang boleh share:
- `SUPABASE_URL` (public)
- `SUPABASE_ANON_KEY` (public, tapi limited access)

### Best Practice:
1. Selalu gunakan `.env` untuk credentials
2. Jangan commit `.env` ke Git (sudah di `.gitignore`)
3. Gunakan service key hanya untuk server-side operations
4. Gunakan anon key untuk client-side operations

---

## 🐛 Troubleshooting

### Error: "SUPABASE_URL atau SUPABASE_ANON_KEY tidak ditemukan"

**Solusi:**
- Pastikan `.env` file ada di root folder
- Pastikan nilai SUPABASE_URL & SUPABASE_ANON_KEY sudah diisi
- Jalankan ulang: `npm run dev`

---

### Error: "relation 'users' does not exist"

**Solusi:**
- Pastikan SQL queries sudah dijalankan di Supabase SQL Editor
- Cek di Supabase Dashboard → Table Editor, pastikan tabel `users` & `notes` sudah ada
- Jalankan ulang queries jika diperlukan

---

### Error: "Login tidak bisa" di Vercel

**Solusi:**
1. Cek environment variables di Vercel sudah benar
2. Pastikan tabel di Supabase sudah terbuat
3. Cek SUPABASE_URL tidak ada trailing slash
4. Verifikasi SUPABASE_ANON_KEY benar (copy ulang dari Supabase)

---

## 📊 Struktur Database Supabase

### users table
```
├── id (BIGSERIAL) - Primary Key
├── username (VARCHAR 100) - Unique username
├── email (VARCHAR 100) - Unique email
├── password (VARCHAR 255) - Hashed password
└── created_at (TIMESTAMP) - Auto timestamp
```

### notes table
```
├── id (BIGSERIAL) - Primary Key
├── user_id (BIGINT) - Foreign Key → users.id
├── title (VARCHAR 255) - Judul catatan
├── content (TEXT) - Isi catatan
├── category (VARCHAR 50) - Kategori (default: Umum)
├── color_accent (VARCHAR 50) - Warna (default: violet)
├── is_pinned (BOOLEAN) - Status pin (default: false)
├── created_at (TIMESTAMP) - Waktu dibuat
└── updated_at (TIMESTAMP) - Terakhir diupdate
```

---

## 📝 Catatan Penting

✅ **Database sudah migrated ke Supabase**
- Backend sudah menggunakan Supabase client
- Semua endpoints compatible
- Frontend tidak perlu perubahan

✅ **Keuntungan Supabase:**
- ✨ Cloud database (accessible dari mana saja)
- ⚡ Auto-scaling untuk production
- 🔒 Built-in authentication & security
- 📊 Real-time capabilities
- 💰 Free tier untuk development

---

## 🎉 Selesai!

Aplikasi AetherNote sekarang sudah siap:
- ✅ Lokal development dengan Supabase
- ✅ Production di Vercel dengan cloud database
- ✅ Login akan berfungsi di Vercel

**Next Steps:**
1. Test aplikasi di localhost
2. Deploy ke Vercel
3. Share URL ke teman untuk test

---

**Dokumentasi ini dibuat: 1 Juni 2026**  
**Version: 1.0.0 - Supabase Edition**

Jika ada pertanyaan, baca error message atau cek troubleshooting section di atas! 🚀
