-- ====================================================================
-- SISTEM PENDUKUNG KEPUTUSAN PEMILIHAN GURU BERPRESTASI SEKOLAH DASAR
-- METODE WEIGHTED PRODUCT (WP)
-- ====================================================================
-- Database: spk_guru_wp
-- Cocok diimpor langsung via phpMyAdmin atau CLI MySQL
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `spk_guru_wp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `spk_guru_wp`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `penilaian`;
DROP TABLE IF EXISTS `alternatif`;
DROP TABLE IF EXISTS `kriteria`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. TABEL PENGGUNA (USERS)
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'kepala_sekolah') NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. TABEL KRITERIA
-- --------------------------------------------------------------------
CREATE TABLE `kriteria` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_kriteria` VARCHAR(10) NOT NULL UNIQUE,
  `nama_kriteria` VARCHAR(150) NOT NULL,
  `bobot` DECIMAL(5,2) NOT NULL,
  `jenis` ENUM('benefit', 'cost') NOT NULL DEFAULT 'benefit',
  `keterangan` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. TABEL ALTERNATIF (GURU SEKOLAH DASAR)
-- --------------------------------------------------------------------
CREATE TABLE `alternatif` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nip` VARCHAR(30) NOT NULL UNIQUE,
  `nama_guru` VARCHAR(150) NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `pendidikan_terakhir` VARCHAR(50) NOT NULL,
  `jabatan` VARCHAR(100) NOT NULL,
  `masa_kerja` INT NOT NULL DEFAULT 0,
  `bidang_studi` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NULL,
  `telepon` VARCHAR(20) NULL,
  `alamat` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. TABEL PENILAIAN (MATRIKS EVALUASI X_ij)
-- --------------------------------------------------------------------
CREATE TABLE `penilaian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `alternatif_id` INT NOT NULL,
  `kriteria_id` INT NOT NULL,
  `nilai` DECIMAL(8,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `unique_alt_krit` UNIQUE (`alternatif_id`, `kriteria_id`),
  CONSTRAINT `fk_penilaian_alternatif` FOREIGN KEY (`alternatif_id`) REFERENCES `alternatif` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_penilaian_kriteria` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA DEFAULT UNTUK PENGUJIAN SISTEM
-- ====================================================================

-- Akun Pengguna:
-- 1. Username: admin, Password: password123
-- 2. Username: kepalasekolah, Password: password123
-- Hash Bcrypt untuk 'password123': $2a$10$wN1G1e1C/kL01/vVn0n6ceE9v24r3E5zZk8q9u7t5XWvS8KqK3x6a
INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`) VALUES
(1, 'admin', '$2a$10$0Gj6JzW9x1vC0n8z/q9KqeQWvZ9Hn5p2Gk2yQ0eZp3O5yGvO7aQ2e', 'Administrator Tata Usaha SD', 'admin'),
(2, 'kepalasekolah', '$2a$10$0Gj6JzW9x1vC0n8z/q9KqeQWvZ9Hn5p2Gk2yQ0eZp3O5yGvO7aQ2e', 'Dra. Hj. Sri Wahyuni, M.Pd.', 'kepala_sekolah');

-- Data 5 Kriteria Penilaian Guru SD
INSERT INTO `kriteria` (`id`, `kode_kriteria`, `nama_kriteria`, `bobot`, `jenis`, `keterangan`) VALUES
(1, 'C1', 'Kompetensi Pedagogik & Penguasaan Kelas', 5.00, 'benefit', 'Perencanaan modul ajar/RPP, penguasaan materi tematik SD, dan interaksi interaktif dengan murid'),
(2, 'C2', 'Kompetensi Kepribadian & Sosial', 4.00, 'benefit', 'Keteladanan moral, empati kepada siswa SD, kerjasama sesama guru, dan komunikasi dengan wali murid'),
(3, 'C3', 'Prestasi Akademik & Inovasi Pembelajaran', 4.00, 'benefit', 'Pembuatan alat peraga/media digital inovatif, pembinaan lomba siswa, serta partisipasi karya ilmiah'),
(4, 'C4', 'Kedisiplinan & Presensi Kehadiran', 3.00, 'benefit', 'Ketepatan waktu mengajar, kehadiran apel/upacara sekolah, dan kelengkapan administrasi ajar bulanan'),
(5, 'C5', 'Catatan Pelanggaran & Keluhan Wali Murid', 2.00, 'cost', 'Jumlah keluhan atau teguran ketidaksesuaian tata tertib guru (Semakin kecil semakin baik)');

-- Data 8 Guru SD (Alternatif)
INSERT INTO `alternatif` (`id`, `nip`, `nama_guru`, `jenis_kelamin`, `pendidikan_terakhir`, `jabatan`, `masa_kerja`, `bidang_studi`, `email`, `telepon`, `alamat`) VALUES
(1, '198503142010011005', 'Budi Santoso, S.Pd.', 'L', 'S1 PGSD', 'Guru Kelas VI (Wali Kelas)', 14, 'Guru Kelas SD', 'budi.santoso@sd.sch.id', '081234567801', 'Jl. Merdeka No. 12, Kelurahan Maju Jaya'),
(2, '198807212014022003', 'Siti Aminah, M.Pd.', 'P', 'S2 Pendidikan Dasar', 'Guru Kelas III (Wali Kelas)', 10, 'Guru Kelas SD', 'siti.aminah@sd.sch.id', '081234567802', 'Jl. Kenanga No. 45, Kompleks Guru'),
(3, '199101052019031008', 'Hendra Wijaya, S.Pd.SD', 'L', 'S1 PGSD', 'Guru Kelas IV (Wali Kelas)', 6, 'Guru Kelas SD', 'hendra.wijaya@sd.sch.id', '081234567803', 'Jl. Mawar No. 08, Cempaka Indah'),
(4, '199304192020122011', 'Dewi Lestari, S.Pd.', 'P', 'S1 Pendidikan Jasmani', 'Guru Mata Pelajaran PJOK', 5, 'Pendidikan Jasmani SD', 'dewi.lestari@sd.sch.id', '081234567804', 'Jl. Melati No. 23, Sukamaju'),
(5, '198711122011011004', 'Ahmad Fauzi, S.Pd.I', 'L', 'S1 Pendidikan Agama Islam', 'Guru Pendidikan Agama Islam', 13, 'PAI SD', 'ahmad.fauzi@sd.sch.id', '081234567805', 'Jl. Pahlawan No. 71, Harapan Baru'),
(6, '199009082015042002', 'Rina Marlina, S.Pd.SD', 'P', 'S1 PGSD', 'Guru Kelas I (Wali Kelas)', 9, 'Guru Kelas SD', 'rina.marlina@sd.sch.id', '081234567806', 'Jl. Dahlia No. 15, Asri Permai'),
(7, '198412022009021003', 'Agus Prasetyo, M.Pd.', 'L', 'S2 Manajemen Pendidikan', 'Guru Kelas V (Wali Kelas)', 15, 'Guru Kelas SD', 'agus.prasetyo@sd.sch.id', '081234567807', 'Jl. Anggrek No. 34, Mekarsari'),
(8, '199506182022032007', 'Nurul Hidayah, S.Pd.', 'P', 'S1 Pendidikan Bahasa Inggris', 'Guru Muatan Lokal Bahasa Inggris', 3, 'Bahasa Inggris SD', 'nurul.hidayah@sd.sch.id', '081234567808', 'Jl. Flamboyan No. 09, Sukamaju');

-- Data Nilai Evaluasi (Matriks X_ij)
-- Kriteria C1 - C4 (Benefit): Rentang Nilai 70 - 98
-- Kriteria C5 (Cost): Nilai 1 - 10 (Semakin rendah semakin bagus)
INSERT INTO `penilaian` (`alternatif_id`, `kriteria_id`, `nilai`) VALUES
-- Guru 1: Budi Santoso
(1, 1, 92.00), (1, 2, 88.00), (1, 3, 85.00), (1, 4, 94.00), (1, 5, 2.00),
-- Guru 2: Siti Aminah
(2, 1, 95.00), (2, 2, 92.00), (2, 3, 96.00), (2, 4, 90.00), (2, 5, 1.00),
-- Guru 3: Hendra Wijaya
(3, 1, 84.00), (3, 2, 86.00), (3, 3, 80.00), (3, 4, 88.00), (3, 5, 4.00),
-- Guru 4: Dewi Lestari
(4, 1, 86.00), (4, 2, 89.00), (4, 3, 90.00), (4, 4, 85.00), (4, 5, 3.00),
-- Guru 5: Ahmad Fauzi
(5, 1, 89.00), (5, 2, 95.00), (5, 3, 82.00), (5, 4, 96.00), (5, 5, 1.00),
-- Guru 6: Rina Marlina
(6, 1, 90.00), (6, 2, 91.00), (6, 3, 87.00), (6, 4, 92.00), (6, 5, 2.00),
-- Guru 7: Agus Prasetyo
(7, 1, 93.00), (7, 2, 89.00), (7, 3, 88.00), (7, 4, 91.00), (7, 5, 2.00),
-- Guru 8: Nurul Hidayah
(8, 1, 82.00), (8, 2, 85.00), (8, 3, 84.00), (8, 4, 86.00), (8, 5, 5.00);
