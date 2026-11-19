const pool = require('../config/db');
const { calculateWeightedProduct } = require('../utils/wpCalculator');

// Menjalankan kalkulasi metode Weighted Product (WP)
const getPerhitunganWP = async (req, res) => {
  try {
    const [kriteria] = await pool.query('SELECT * FROM kriteria ORDER BY kode_kriteria ASC');
    const [alternatif] = await pool.query('SELECT * FROM alternatif ORDER BY nama_guru ASC');
    const [penilaian] = await pool.query('SELECT * FROM penilaian');

    if (kriteria.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kriteria penilaian belum diinputkan ke sistem.'
      });
    }

    if (alternatif.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data alternatif guru belum diinputkan ke sistem.'
      });
    }

    // Hitung menggunakan kalkulator Weighted Product
    const hasilWP = calculateWeightedProduct(kriteria, alternatif, penilaian);

    return res.json({
      success: true,
      message: 'Kalkulasi metode Weighted Product berhasil dilakukan.',
      data: hasilWP
    });
  } catch (error) {
    console.error('WP Calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan perhitungan WP: ' + error.message
    });
  }
};

// Mengambil ringkasan statistik untuk halaman Dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const [[{ total_kriteria }]] = await pool.query('SELECT COUNT(*) AS total_kriteria FROM kriteria');
    const [[{ total_guru }]] = await pool.query('SELECT COUNT(*) AS total_guru FROM alternatif');
    const [[{ total_penilaian }]] = await pool.query('SELECT COUNT(*) AS total_penilaian FROM penilaian');

    let guruPeringkatSatu = null;
    let topTiga = [];

    // Jika data kriteria dan guru ada, hitung sekilas untuk menampilkan peringkat 1 di dashboard
    if (total_kriteria > 0 && total_guru > 0) {
      const [kriteria] = await pool.query('SELECT * FROM kriteria ORDER BY kode_kriteria ASC');
      const [alternatif] = await pool.query('SELECT * FROM alternatif ORDER BY nama_guru ASC');
      const [penilaian] = await pool.query('SELECT * FROM penilaian');

      try {
        const hasil = calculateWeightedProduct(kriteria, alternatif, penilaian);
        guruPeringkatSatu = hasil.perankingan[0] || null;
        topTiga = hasil.perankingan.slice(0, 3);
      } catch (err) {
        // Abaikan jika nilai belum lengkap
      }
    }

    return res.json({
      success: true,
      data: {
        total_kriteria: parseInt(total_kriteria || 0, 10),
        total_guru: parseInt(total_guru || 0, 10),
        total_penilaian: parseInt(total_penilaian || 0, 10),
        guru_terbaik: guruPeringkatSatu,
        top_tiga: topTiga
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat ringkasan dashboard: ' + error.message
    });
  }
};

module.exports = {
  getPerhitunganWP,
  getDashboardSummary
};
