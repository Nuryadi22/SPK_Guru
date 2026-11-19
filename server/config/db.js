const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback default

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spk_guru_wp',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

// Test koneksi database saat inisialisasi
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Terhubung ke MySQL server (${process.env.DB_NAME || 'spk_guru_wp'})`);
    connection.release();
  } catch (error) {
    console.warn(`[Database Warning] Belum terhubung ke MySQL: ${error.message}`);
    console.warn(`[Petunjuk] Pastikan MySQL di XAMPP / phpMyAdmin aktif dan database 'spk_guru_wp' sudah diimpor dari file 'database.sql'.`);
  }
})();

module.exports = pool;
