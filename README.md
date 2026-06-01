# 🚀 AetherNote — Workspace Catatan & Jurnal Premium (MySQL Edition)

AetherNote adalah aplikasi Full-Stack modern (Express.js & Single Page Application Frontend) yang dirancang untuk menangkap ide, mencatat tugas harian, dan menulis jurnal personal dengan antarmuka yang sangat elegan dan interaktif. 

Aplikasi ini dilengkapi dengan sistem **Autentikasi (JWT)**, manajemen **CRUD Catatan Lengkap**, **Filter Kategori**, **Pencarian Real-Time**, **Penyematan Catatan (Pin)**, serta sistem **Aksen Warna Kustom** yang secara dinamis memperbarui nuansa visual di workspace Anda.

Projek ini dikonfigurasi menggunakan **MySQL** sebagai database persisten, dan dioptimalkan untuk siap dideploy di **Vercel** menggunakan infrastruktur *Serverless Functions*.

---

## ✨ Fitur Unggulan

- 🔐 **Autentikasi Aman**: Pendaftaran & masuk akun menggunakan JWT (JSON Web Token) dengan enkripsi password searah menggunakan `bcryptjs`.
- 📝 **CRUD Operasi Lengkap**: Buat, baca, perbarui, sematkan (pin), dan hapus catatan Anda secara dinamis.
- 🎨 **Sistem Aksen Warna Dinamis**: Setiap catatan memiliki aksen warna (Violet, Pink, Emerald, dll) yang secara otomatis memancarkan efek cahaya (*glow shadow*) di workspace.
- 🏷️ **Pengelompokan & Pencarian**: Cari catatan secara instan dan filter berdasarkan kategori (Umum, Tugas, Ide, Pribadi, Belanja).
- 🛢️ **Integrasi MySQL Secara Otomatis**: Backend Express akan secara otomatis membuat database table (`users` dan `notes`) saat aplikasi pertama kali dijalankan. Tidak perlu mengimpor file `.sql` secara manual!
- ☁️ **Dual-Mode Connection**: Mendukung konfigurasi database parameter standar (`DB_HOST`, `DB_USER`, dll) maupun *Connection String URI* (`DATABASE_URL`) yang sangat ideal untuk platform cloud hosting modern.

---

## 🛠️ Arsitektur Berkas Projek

```
express-hosting/
├── api/
│   └── index.js        # Main Express Backend terintegrasi mysql2 (serverless-ready)
├── public/             # Folder aset statis Frontend
│   ├── css/
│   │   └── style.css   # Lembar gaya Vanilla CSS premium & responsif
│   ├── js/
│   │   └── app.js      # Logika aplikasi frontend, fetch API & JWT
│   └── index.html      # Tampilan antarmuka utama (SPA)
├── .env                # Variabel lingkungan database lokal
├── .gitignore          # Pengabaian berkas sensitif untuk Git
├── package.json        # Dependensi Node.js & skrip startup
└── vercel.json         # Konfigurasi routing backend/frontend untuk Vercel
```

---

## 🚀 Cara Menjalankan Projek di Komputer Lokal

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js** dan server **MySQL** (XAMPP / Laragon / MySQL Workbench) aktif di komputer Anda.

### 2. Buat Database Kosong di MySQL
Buka MySQL Client Anda (seperti phpMyAdmin atau DBeaver) lalu jalankan perintah SQL berikut untuk membuat database baru:
```sql
CREATE DATABASE aethernote;
```

### 3. Instalasi Dependensi
Jalankan perintah berikut di terminal workspace Anda untuk menginstal semua modul:
```bash
npm install
```

### 4. Konfigurasi Environment (`.env`)
Buka berkas `.env` di root folder dan sesuaikan kredensial database MySQL lokal Anda:
```env
PORT=3000
JWT_SECRET=supersecretkey_zenflow_2026_aethernote

# Konfigurasi Database MySQL Lokal
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=aethernote
```
*(Sesuaikan password jika XAMPP/Laragon Anda menggunakan password).*

### 5. Jalankan Aplikasi
Jalankan perintah berikut untuk mengaktifkan server:
```bash
npm run dev
```
Express akan secara otomatis mendeteksi database `aethernote` dan membangun tabel `users` serta `notes` untuk Anda secara instan!

Buka peramban (browser) Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Panduan Lengkap Hosting ke Vercel dengan Database MySQL Online

Karena Vercel adalah platform *Serverless*, Anda memerlukan database MySQL yang dihosting secara online (Cloud MySQL) agar website Anda dapat diakses di internet secara global dan datanya tersimpan secara permanen.

### Langkah 1: Dapatkan Database MySQL Online (Gratis)
Anda bisa mendapatkan database MySQL gratis di penyedia layanan cloud seperti **Aiven**, **Railway**, atau **Supabase (wrapper/pg)**. 
Sebagai contoh menggunakan **Railway.app** atau **Aiven.io**:
1. Buat akun gratis dan pilih **Create a MySQL Database**.
2. Anda akan mendapatkan **Connection String URI** (Contoh: `mysql://root:password@host:port/database_name`). salin alamat tersebut.

---

### Langkah 2: Deploy Projek ke Vercel via Git (Sangat Direkomendasikan)

1. **Inisialisasi Git di Komputer Lokal**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit AetherNote MySQL"
   ```
2. **Buat Repository di GitHub / GitLab**:
   - Buat repository baru kosong di akun GitHub Anda (misal: `aethernote-mysql`).
3. **Hubungkan dan Push Projek Lokal ke GitHub**:
   ```bash
   git remote add origin https://github.com/USERNAME-ANDA/aethernote-mysql.git
   git branch -M main
   git push -u origin main
   ```
4. **Deploy di Vercel Dashboard**:
   - Masuk ke **[Vercel Dashboard](https://vercel.com/dashboard)** menggunakan akun GitHub Anda.
   - Klik tombol **"Add New"** -> **"Project"** lalu impor repositori `aethernote-mysql` Anda.
   - Klik bagian **"Environment Variables"** (SANGAT PENTING untuk menghubungkan Database & JWT):
     - Tambahkan variabel **`JWT_SECRET`**: *[Tuliskan kunci rahasia acak Anda]*
     - Tambahkan variabel **`DATABASE_URL`**: *[Tempelkan Connection String URI MySQL Cloud yang Anda dapatkan di Langkah 1]*
   - Klik tombol **"Deploy"**.
   - Tunggu proses build selama kurang dari 1 menit. 🎉 **Selamat! Projek Anda kini online di internet dengan database MySQL permanen!**

---

### Langkah 3: Deploy via Vercel CLI (Metode Alternatif Instan)

1. Pastikan Vercel CLI terinstal: `npm install -g vercel`
2. Jalankan perintah deploy awal: `vercel` (Ikuti konfigurasi default di terminal).
3. Tambahkan environment variable database Anda ke server Vercel:
   ```bash
   vercel env add DATABASE_URL
   ```
   *Masukkan string koneksi MySQL Cloud Anda saat diminta.*
4. Tambahkan JWT secret Anda:
   ```bash
   vercel env add JWT_SECRET
   ```
5. Deploy hasil akhir ke produksi:
   ```bash
   vercel --prod
   ```
   Tautan link website aktif Anda (misalnya: `https://express-hosting.vercel.app`) akan langsung dibagikan di terminal!

---

## 🏆 Lisensi & Kontribusi

Dibuat dengan dedikasi penuh menggunakan Express modern, driver MySQL2, dan antarmuka premium Vanilla CSS. Bebas digunakan untuk keperluan belajar, tugas kuliah, maupun dikembangkan lebih lanjut menjadi produk skala besar!

**Selamat Berkreasi dan Sukses dengan Projek Backend MySQL Anda!** 🚀🌌
