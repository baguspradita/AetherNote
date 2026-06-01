# 🔧 Panduan Setup Supabase PostgreSQL untuk AetherNote

## Langkah 1: Update `.env` dengan Connection String Supabase

Buka file `.env` dan ganti `DATABASE_URL` dengan connection string Anda:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=supersecretkey_zenflow_2026_aethernote

# Ganti [YOUR-PASSWORD] dengan password database Anda
DATABASE_URL=postgresql://postgres.itizdknunfobelddliwm:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**📍 Cara mendapatkan connection string:**
1. Buka [https://app.supabase.com](https://app.supabase.com)
2. Login dengan akun Anda
3. Pilih project AetherNote
4. Pergi ke **Settings → Database** (sidebar kiri)
5. Lihat bagian **Connection string**
6. Pilih **URI** tab
7. Copy seluruh string dan replace `[YOUR-PASSWORD]` dengan password database Anda

---

## Langkah 2: Verifikasi Connection String Format

Connection string harus dalam format:
```
postgresql://user:password@host:port/database
```

**Contoh:**
```
postgresql://postgres.itizdknunfobelddliwm:MyPassword123@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

⚠️ **PENTING:** 
- Jangan share password ke public
- Jangan commit `.env` file ke GitHub
- Gunakan environment variables di production

---

## Langkah 3: Buat Database Tables Otomatis

Jalankan perintah di terminal:

```bash
npm run dev
```

**Output yang diharapkan:**
```
✅ Terhubung ke Supabase PostgreSQL
✅ Table "users" siap
✅ Table "notes" siap
✅ Database initialization berhasil!

✅ PostgreSQL Pool berhasil dibuat
🚀 Server berjalan di http://localhost:3000
```

---

## Langkah 4: Test Aplikasi Lokal

1. Buka browser: **http://localhost:3000**
2. Klik tab **"Daftar"**
3. Isi form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
4. Klik **"Daftar"**
5. Akan redirect ke login
6. Login dengan email & password tadi
7. Buat catatan test
8. Verifikasi CRUD bekerja (Create, Read, Update, Delete)

---

## Langkah 5: Setup Environment Variables di Vercel

### Untuk Production (Vercel):

1. Buka [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Pilih project AetherNote
3. Pergi ke **Settings → Environment Variables**
4. Tambahkan variable baru:

| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `your_secure_secret_key` |
| `DATABASE_URL` | `postgresql://user:password@host:port/database` |

5. Klik **"Save"**
6. Redeploy project

---

## ⚠️ Troubleshooting

### Error: "connect ECONNREFUSED"
**Penyebab:** Connection string salah atau database offline
**Solusi:**
- Verifikasi DATABASE_URL di `.env`
- Pastikan password database benar
- Cek Supabase project status di dashboard

### Error: "password authentication failed"
**Penyebab:** Password database salah
**Solusi:**
- Reset password di Supabase dashboard
- Settings → Database → Password
- Update `.env` dengan password baru

### Error: "table 'users' does not exist"
**Penyebab:** Tables belum dibuat
**Solusi:**
```bash
npm run dev
# Tables akan dibuat otomatis
```

### Error: "ENOTFOUND aws-1-ap-southeast-2..."
**Penyebab:** DNS tidak bisa resolve host Supabase
**Solusi:**
- Check internet connection
- Coba gunakan IP address dari host
- Contact Supabase support

---

## 📊 Database Schema

### Table: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: notes
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'Umum',
  color_accent VARCHAR(50) DEFAULT 'violet',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Deployment ke Vercel

### Prerequisites:
- GitHub repository
- Vercel account
- Supabase project dengan connection string

### Steps:

1. **Push ke GitHub**
```bash
git add .
git commit -m "Update to PostgreSQL Supabase"
git push origin main
```

2. **Connect Vercel**
- Buka [https://vercel.com/new](https://vercel.com/new)
- Select GitHub repository
- Click "Import"

3. **Configure Environment**
- Di Vercel dashboard, go to **Settings → Environment Variables**
- Add all variables dari section di atas

4. **Deploy**
- Click "Deploy" button
- Wait hingga selesai
- Test aplikasi di Vercel URL

---

## ✅ Checklist

- [ ] Database URL ditambahkan ke `.env`
- [ ] Password diganti dengan password Supabase Anda
- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` berhasil & tables tercipta
- [ ] Registrasi/Login berfungsi
- [ ] CRUD catatan berfungsi
- [ ] Environment variables set di Vercel
- [ ] Aplikasi berhasil di-deploy ke Vercel

---

## 📝 Notes

- Connection string hanya untuk backend
- Frontend tidak perlu tahu connection string
- JWT token untuk autentikasi user
- Semua query menggunakan parameterized queries untuk security

---

## 🎯 Summary

**Dari:** MySQL lokal  
**Ke:** Supabase PostgreSQL (cloud database)  
**Benefit:** 
- ✅ Accessible dari mana saja
- ✅ Auto backup & high availability
- ✅ Scale automatically
- ✅ Perfect untuk Vercel deployment

Sekarang aplikasi Anda siap deploy ke Vercel dengan database cloud! 🎉
