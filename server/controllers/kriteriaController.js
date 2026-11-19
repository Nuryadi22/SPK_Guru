const pool = require('../config/db');

// Mengambil seluruh data kriteria
const getAllKriteria = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kriteria ORDER BY kode_kriteria ASC');
    return res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kriteria: ' + error.message
    });
  }
};

// Mengambil detail satu kriteria
const getKriteriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM kriteria WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kriteria tidak ditemukan.'
      });
    }
    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kriteria: ' + error.message
    });
  }
};

// Menambah kriteria baru (via Modal Form)
const createKriteria = async (req, res) => {
  const { kode_kriteria, nama_kriteria, bobot, jenis, keterangan } = req.body;

  if (!kode_kriteria || !nama_kriteria || bobot === undefined || !jenis) {
    return res.status(400).json({
      success: false,
      message: 'Mohon lengkapi kode kriteria, nama kriteria, bobot, dan jenis kriteria.'
    });
  }

  const numericBobot = parseFloat(bobot);
  if (isNaN(numericBobot) || numericBobot <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Nilai bobot harus berupa angka positif lebih dari 0.'
    });
  }

  const validJenis = ['benefit', 'cost'].includes(jenis.toLowerCase()) ? jenis.toLowerCase() : 'benefit';

  try {
    // Cek duplikasi kode kriteria
    const [existing] = await pool.query('SELECT id FROM kriteria WHERE kode_kriteria = ?', [kode_kriteria.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Kode kriteria '${kode_kriteria}' sudah terdaftar.`
      });
    }

    const [result] = await pool.query(
      'INSERT INTO kriteria (kode_kriteria, nama_kriteria, bobot, jenis, keterangan) VALUES (?, ?, ?, ?, ?)',
      [kode_kriteria.trim().toUpperCase(), nama_kriteria.trim(), numericBobot, validJenis, keterangan || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Data kriteria berhasil ditambahkan.',
      data: {
        id: result.insertId,
        kode_kriteria: kode_kriteria.trim().toUpperCase(),
        nama_kriteria: nama_kriteria.trim(),
        bobot: numericBobot,
        jenis: validJenis,
        keterangan: keterangan || ''
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan kriteria: ' + error.message
    });
  }
};

// Memperbarui data kriteria (via Modal Form)
const updateKriteria = async (req, res) => {
  const { id } = req.params;
  const { kode_kriteria, nama_kriteria, bobot, jenis, keterangan } = req.body;

  if (!kode_kriteria || !nama_kriteria || bobot === undefined || !jenis) {
    return res.status(400).json({
      success: false,
      message: 'Mohon lengkapi semua bidang isian kriteria.'
    });
  }

  const numericBobot = parseFloat(bobot);
  if (isNaN(numericBobot) || numericBobot <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Nilai bobot harus berupa angka positif lebih dari 0.'
    });
  }

  const validJenis = ['benefit', 'cost'].includes(jenis.toLowerCase()) ? jenis.toLowerCase() : 'benefit';

  try {
    // Cek apakah kriteria ada
    const [current] = await pool.query('SELECT id FROM kriteria WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kriteria yang akan diubah tidak ditemukan.'
      });
    }

    // Cek duplikasi kode pada ID lain
    const [duplicate] = await pool.query(
      'SELECT id FROM kriteria WHERE kode_kriteria = ? AND id != ?',
      [kode_kriteria.trim(), id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Kode kriteria '${kode_kriteria}' telah digunakan oleh kriteria lain.`
      });
    }

    await pool.query(
      'UPDATE kriteria SET kode_kriteria = ?, nama_kriteria = ?, bobot = ?, jenis = ?, keterangan = ? WHERE id = ?',
      [kode_kriteria.trim().toUpperCase(), nama_kriteria.trim(), numericBobot, validJenis, keterangan || '', id]
    );

    return res.json({
      success: true,
      message: 'Data kriteria berhasil diperbarui.',
      data: {
        id: parseInt(id, 10),
        kode_kriteria: kode_kriteria.trim().toUpperCase(),
        nama_kriteria: nama_kriteria.trim(),
        bobot: numericBobot,
        jenis: validJenis,
        keterangan: keterangan || ''
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kriteria: ' + error.message
    });
  }
};

// Menghapus kriteria
const deleteKriteria = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM kriteria WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kriteria tidak ditemukan.'
      });
    }
    return res.json({
      success: true,
      message: 'Kriteria beserta nilai keterkaitannya berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kriteria: ' + error.message
    });
  }
};

module.exports = {
  getAllKriteria,
  getKriteriaById,
  createKriteria,
  updateKriteria,
  deleteKriteria
};
