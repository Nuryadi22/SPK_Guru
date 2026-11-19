const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load konfigurasi .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware standar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute API
const authRoutes = require('./routes/authRoutes');
const kriteriaRoutes = require('./routes/kriteriaRoutes');
const alternatifRoutes = require('./routes/alternatifRoutes');
const penilaianRoutes = require('./routes/penilaianRoutes');
const wpRoutes = require('./routes/wpRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/kriteria', kriteriaRoutes);
app.use('/api/alternatif', alternatifRoutes);
app.use('/api/penilaian', penilaianRoutes);
app.use('/api/wp', wpRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SPK Pemilihan Guru Berprestasi SD (Weighted Product)',
    timestamp: new Date().toISOString()
  });
});

// Menyajikan build statis frontend React (Vite) jika folder client/dist ada
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Menyajikan frontend React dari: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #4E3629; background: #FBF8F3; min-height: 100vh;">
        <h1 style="color: #B85D3B;">SPK Guru Berprestasi Sekolah Dasar (Metode WP)</h1>
        <p>API Server Backend Node.js sedang berjalan pada port ${PORT}.</p>
        <p>Frontend dalam tahap pengembangan. Jalankan <code>npm run client</code> atau <code>npm run build</code> untuk membangun tampilan antarmuka.</p>
        <p><a href="/api/health" style="color: #B85D3B; text-decoration: underline;">Cek Status API Health</a></p>
      </div>
    `);
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` SPK Guru Berprestasi SD - Metode Weighted Product  `);
  console.log(` Server berjalan di : http://localhost:${PORT}        `);
  console.log(` Lingkungan         : ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

module.exports = app;
