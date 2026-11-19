# Sistem Pendukung Keputusan Pemilihan Guru Berprestasi Sekolah Dasar (SD)
## Metode Weighted Product (WP) Terpadu — Arsitektur Monolitik

Aplikasi web Sistem Pendukung Keputusan (SPK) untuk mengevaluasi, menyeleksi, dan menetapkan tenaga pendidik (guru) berprestasi pada jenjang Sekolah Dasar (SD) menggunakan metode komputasi **Weighted Product (WP)**.

---

## 1. Arsitektur Teknologi & Lingkungan
- **Pola Arsitektur**: Monolitik Terintegrasi (Backend Node.js & Frontend React Vite dalam satu repositori root).
- **Backend**: Node.js & Express.js.
- **Database**: MySQL (dikelola melalui phpMyAdmin / XAMPP / MariaDB).
- **Frontend**: React.js 18 dengan Vite Bundler.
- **UI/UX Design System**:
  - **Palet Warna Hangat (Warm Color Palette)**: Terakota (`#B85D3B`), Cokelat Muda Formal (`#6E4A35`), Krem Hangat (`#FBF8F3` / `#F5EFEB`), dan Amber Lembut (`#D97706`).
  - **Bebas Gradasi (Strictly No Gradients)**: Seluruh elemen antarmuka menggunakan warna solid hangat tanpa efek gradasi warna.
  - **Bebas Ikon Pada Tombol**: Semua tombol aksi (`Tambah`, `Detail`, `Edit`, `Hapus`, `Simpan`, `Batal`, `Cetak`) disajikan dalam bentuk **teks murni** dengan latar warna hangat dan border/radius yang bersih dan elegan khas instansi pendidikan.
  - **Modal Pop-Up Terpadu**: Setiap proses penambahan data, pengeditan data, dan peninjauan rincian profil/kalkulasi disajikan melalui komponen Modal Pop-Up interaktif.

---

## 2. Struktur Direktori Proyek Monolitik

```text
d:\BelajarNext\Guru\
├── database.sql                  # Skema SQL lengkap & data awal untuk diimpor ke phpMyAdmin
├── package.json                  # Konfigurasi root monolitik & script bersama
├── .env                          # Konfigurasi environment (Port, MySQL DB, JWT Secret)
├── .env.example                  # Template variabel lingkungan
├── server/                       # Modul Backend (Node.js & Express.js)
│   ├── config/
│   │   └── db.js                 # Koneksi pool MySQL2 Promise
│   ├── controllers/
│   │   ├── authController.js     # Autentikasi Admin & Kepala Sekolah
│   │   ├── kriteriaController.js # Manajemen CRUD Kriteria
│   │   ├── alternatifController.js# Manajemen CRUD Guru (Alternatif)
│   │   ├── penilaianController.js# Pengisian & Matriks Penilaian
│   │   └── wpController.js       # Kalkulasi Weighted Product & Dashboard
│   ├── middleware/
│   │   └── authMiddleware.js     # Validasi Token JWT & Hak Akses Role
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── kriteriaRoutes.js
│   │   ├── alternatifRoutes.js
│   │   ├── penilaianRoutes.js
│   │   └── wpRoutes.js
│   ├── utils/
│   │   └── wpCalculator.js       # Modul komputasi matematis metode WP
│   └── index.js                  # Entry point Express API & static file serving
└── client/                       # Modul Frontend (React.js + Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/
        │   └── api.js            # Axios client dengan interceptor token JWT
        ├── context/
        │   └── AuthContext.jsx   # Pengelola sesi autentikasi pengguna
        ├── components/
        │   ├── Navbar.jsx        # Navigasi utama instansi
        │   ├── Modal.jsx         # Komponen Modal Pop-Up form input/edit
        │   ├── DetailModal.jsx   # Komponen Modal Pop-Up peninjauan detail
        │   └── ConfirmModal.jsx  # Komponen Modal konfirmasi hapus data
        ├── pages/
        │   ├── LoginPage.jsx     # Halaman masuk sistem
        │   ├── DashboardPage.jsx # Ringkasan statistik & kandidat teratas
        │   ├── KriteriaPage.jsx  # Manajemen kriteria, bobot, & sifat (Benefit/Cost)
        │   ├── AlternatifPage.jsx# Manajemen data profil guru SD
        │   ├── PenilaianPage.jsx # Matriks evaluasi nilai guru
        │   ├── PerhitunganWPPage.jsx # Tahapan matematis WP & ranking
        │   └── LaporanPage.jsx   # Dokumen Surat Keputusan & cetak formal
        ├── styles/
        │   └── App.css           # Desain CSS warna hangat, tombol teks, & cetak
        ├── App.jsx               # Rute aplikasi & proteksi halaman
        └── main.jsx
```

---

## 3. Tahapan Instalasi & Menjalankan Aplikasi

### Langkah 1: Persiapan Database MySQL melalui phpMyAdmin
1. Buka aplikasi **XAMPP Control Panel** dan klik **Start** pada modul **Apache** dan **MySQL**.
2. Buka browser dan akses alamat: `http://localhost/phpmyadmin`.
3. Klik menu **Import** pada phpMyAdmin.
4. Pilih file `database.sql` yang berada di folder root proyek (`d:\BelajarNext\Guru\database.sql`).
5. Klik tombol **Import** (atau **Kirim**) di bagian bawah.
6. Database `spk_guru_wp` beserta tabel `users`, `kriteria`, `alternatif`, `penilaian`, dan seluruh data sampel guru SD akan otomatis terbuat.

### Langkah 2: Instalasi Dependensi (Sekali Saja)
Jalankan perintah berikut di terminal root proyek:
```bash
# Instalasi dependensi backend dan frontend secara serentak
npm run install:all
```
*Atau lakukan secara manual:*
```bash
npm install
cd client && npm install && cd ..
```

### Langkah 3: Menjalankan Aplikasi dalam Mode Pengembangan (Development)
Jalankan server backend Node.js dan frontend Vite:
- **Terminal 1 (Backend Express)**:
  ```bash
  npm run server
  ```
  *Server backend aktif di: `http://localhost:5000`*

- **Terminal 2 (Frontend React Vite)**:
  ```bash
  npm run client
  ```
  *Frontend React aktif di: `http://localhost:5173`*

### Langkah 4: Menjalankan dalam Mode Produksi (Single Server)
Dalam mode produksi, backend Express menyajikan langsung antarmuka frontend dari hasil build `client/dist`:
```bash
# 1. Bangun bundle frontend React
npm run build

# 2. Jalankan server monolitik terpadu
npm start
```
Buka browser pada: `http://localhost:5000`. Seluruh aplikasi web langsung dapat diakses dari satu port tersebut.

---

## 4. Akun Pengguna Bawaan (Default Login)

| Role Pengguna | Username | Password | Deskripsi Tugas |
| :--- | :--- | :--- | :--- |
| **Administrator Tata Usaha SD** | `admin` | `password123` | Memiliki hak akses penuh (CRUD Kriteria, Alternatif Guru, dan Input Nilai). |
| **Kepala Sekolah (Headmaster)** | `kepalasekolah` | `password123` | Melihat hasil evaluasi, detail perhitungan, dan menandatangani laporan akhir. |

---

## 5. Metodologi Weighted Product (WP)

Metode Weighted Product (WP) mengevaluasi alternatif melalui perkalian rating atribut yang masing-masing dipangkatkan dengan bobot ternormalisasi:

### 1. Normalisasi Bobot Kriteria ($w_j$)
$$w_j = \frac{W_j}{\sum_{k=1}^n W_k}$$
Dengan ketentuan pangkat:
- **Kriteria Benefit**: $w_j^* = +w_j$ (bernilai positif).
- **Kriteria Cost**: $w_j^* = -w_j$ (bernilai negatif).

### 2. Perhitungan Vektor Skor ($S_i$)
$$S_i = \prod_{j=1}^n \left(X_{ij}\right)^{w_j^*}$$
Di mana:
- $X_{ij}$ adalah nilai rating alternatif guru $i$ pada kriteria $j$.
- Untuk kriteria cost: $X_{ij}^{-w_j} = \frac{1}{X_{ij}^{w_j}}$.

### 3. Perhitungan Vektor Preferensi Relatif ($V_i$)
$$V_i = \frac{S_i}{\sum_{k=1}^m S_k}$$
Total seluruh nilai $V_i$ bernilai 1 ($\sum V_i = 1$). Alternatif guru dengan nilai $V_i$ terbesar menempati peringkat ke-1 sebagai Guru Berprestasi Sekolah Dasar.

---

## 6. Kriteria Bawaan Pemilihan Guru Berprestasi SD

1. **C1 - Kompetensi Pedagogik & Penguasaan Kelas** (Bobot: 5.00, Sifat: Benefit)
2. **C2 - Kompetensi Kepribadian & Sosial** (Bobot: 4.00, Sifat: Benefit)
3. **C3 - Prestasi Akademik & Inovasi Pembelajaran** (Bobot: 4.00, Sifat: Benefit)
4. **C4 - Kedisiplinan & Presensi Kehadiran** (Bobot: 3.00, Sifat: Benefit)
5. **C5 - Catatan Pelanggaran & Keluhan Wali Murid** (Bobot: 2.00, Sifat: Cost)
