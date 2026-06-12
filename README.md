# AetherNote 

**AetherNote** adalah aplikasi catatan dan jurnal digital modern berbasis web yang memungkinkan pengguna mencatat ide, tugas, rencana, dan jurnal harian dengan antarmuka premium. Dibangun dengan arsitektur REST API menggunakan Express.js dan database PostgreSQL, siap di-deploy ke Vercel.

## Fitur

- **Autentikasi JWT** — Register, login, dan session management dengan JSON Web Token + bcryptjs
- **CRUD Catatan** — Buat, baca, edit, dan hapus catatan dengan mudah
- **Filter & Pencarian** — Filter berdasarkan kategori (Umum, Tugas, Ide, Pribadi, Belanja) dan cari berdasarkan judul, isi, atau tag
- **Pin Catatan** — Sematkan catatan penting agar tampil di urutan teratas
- **Aksen Warna** — Pilih warna kustom untuk setiap catatan (Violet, Pink, Blue, Emerald, Amber)
- **Tag System** — Beri tag pada catatan untuk organisasi yang lebih baik
- **Responsive Design** — Antarmuka modern dengan font Inter & Outfit, ikon Lucide
- **Siap Vercel** — Konfigurasi serverless function untuk deployment instan

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Database** | PostgreSQL (Supabase) |
| **Autentikasi** | JWT, bcryptjs |
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Ikon** | Lucide Icons CDN |
| **Font** | Google Fonts (Inter, Outfit) |
| **Hosting** | Vercel (Serverless Functions) |
| **Environment** | dotenv |

## Struktur Project

```
express-hosting/
├── api/
│   └── index.js          # Express server (routes + auth middleware)
├── public/
│   ├── css/
│   │   └── style.css     # Stylesheet
│   ├── js/
│   │   └── app.js        # Frontend application logic
│   └── index.html        # Halaman utama (SPA)
├── .env                  # Environment variables
├── init-db.js            # Database initialization script
├── package.json
├── vercel.json           # Vercel deployment config
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | Tidak | Registrasi akun baru |
| POST | `/api/auth/login` | Tidak | Login pengguna |
| GET | `/api/auth/me` | Wajib token | Verifikasi token & data user |
| GET | `/api/notes` | Wajib token | Ambil semua catatan user |
| POST | `/api/notes` | Wajib token | Buat catatan baru |
| PUT | `/api/notes/:id` | Wajib token | Update catatan |
| DELETE | `/api/notes/:id` | Wajib token | Hapus catatan |
| GET | `/health` | Tidak | Health check server |

## Instalasi & Menjalankan Lokal

### Prasyarat

- Node.js v18+
- Akun [Supabase](https://supabase.com) (PostgreSQL)
- Git

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/username/express-hosting.git
cd express-hosting

# 2. Install dependencies
npm install

# 3. Buat file .env
cp .env.example .env

# 4. Isi DATABASE_URL dengan connection string PostgreSQL dari Supabase
#    Format: postgresql://user:password@host:port/database

# 5. Jalankan aplikasi
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### Konfigurasi Environment (.env)

```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database

Tabel akan dibuat otomatis saat pertama kali aplikasi dijalankan melalui `init-db.js`:

### `users`
| Column | Type | Keterangan |
|--------|------|------------|
| id | SERIAL PK | Primary key |
| username | VARCHAR(100) UNIQUE | Nama pengguna |
| email | VARCHAR(100) UNIQUE | Email |
| password | VARCHAR(255) | Hash bcrypt |
| created_at | TIMESTAMP | Waktu registrasi |

### `notes`
| Column | Type | Keterangan |
|--------|------|------------|
| id | SERIAL PK | Primary key |
| user_id | INTEGER FK → users.id | Pemilik catatan |
| title | VARCHAR(255) | Judul catatan |
| content | TEXT | Isi catatan |
| category | VARCHAR(50) | Kategori (default: Umum) |
| color_accent | VARCHAR(50) | Warna aksen (default: violet) |
| is_pinned | BOOLEAN | Status pin |
| tags | TEXT | Tag dipisah koma |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

## Deployment ke Vercel

Project sudah dikonfigurasi untuk Vercel via `vercel.json`:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard:
# - JWT_SECRET
# - DATABASE_URL
```

## Lisensi

ISC
