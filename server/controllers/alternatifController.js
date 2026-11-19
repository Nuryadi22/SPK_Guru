const pool = require('../config/db');

// Mengambil seluruh data alternatif (guru)
const getAllAlternatif = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
        (SELECT COUNT(*) FROM penilaian p WHERE p.alternatif_id = a.id) AS total_kriteria_dinilai
      FROM alternatif a
      ORDER BY a.nama_guru ASC
    `);
    return res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data alternatif guru: ' + error.message
    });
  }
};

// Mengambil rincian detail profil dan riwayat nilai kriteria seorang guru (Untuk Tombol Detail)
const getAlternatifDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [altRows] = await pool.query('SELECT * FROM alternatif WHERE id = ?', [id]);
    if (altRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data alternatif guru tidak ditemukan.'
      });
    }

    const guru = altRows[0];

    // Ambil nilai per kriteria guru ini
    const [penilaianRows] = await pool.query(`
      SELECT 
        k.id AS kriteria_id,
        k.kode_kriteria,
        k.nama_kriteria,
        k.bobot,
        k.jenis,
        COALESCE(p.nilai, 0) AS nilai
      FROM kriteria k
      LEFT JOIN penilaian p ON p.kriteria_id = k.id AND p.alternatif_id = ?
      ORDER BY k.kode_kriteria ASC
    `, [id]);

    return res.json({
      success: true,
      data: {
        ...guru,
        daftar_penilaian: penilaianRows
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil rincian data guru: ' + error.message
    });
  }
};

// Menambah data guru baru (via Modal Form)
const createAlternatif = async (req, res) => {
  const {
    nip,
    nama_guru,
    jenis_kelamin,
    pendidikan_terakhir,
    jabatan,
    masa_kerja,
    bidang_studi,
    email,
    telepon,
    alamat
  } = req.body;

  if (!nip || !nama_guru || !jenis_kelamin || !pendidikan_terakhir || !jabatan || !bidang_studi) {
    return res.status(400).json({
      success: false,
      message: 'Mohon lengkapi NIP, Nama Guru, Jenis Kelamin, Pendidikan, Jabatan, dan Bidang Studi.'
    });
  }

  try {
    // Cek duplikasi NIP
    const [existing] = await pool.query('SELECT id FROM alternatif WHERE nip = ?', [nip.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `NIP '${nip}' telah terdaftar untuk guru lain.`
      });
    }

    const [result] = await pool.query(`
      INSERT INTO alternatif (
        nip, nama_guru, jenis_kelamin, pendidikan_terakhir, jabatan,
        masa_kerja, bidang_studi, email, telepon, alamat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nip.trim(),
      nama_guru.trim(),
      jenis_kelamin.toUpperCase() === 'P' ? 'P' : 'L',
      pendidikan_terakhir.trim(),
      jabatan.trim(),
      parseInt(masa_kerja || 0, 10),
      bidang_studi.trim(),
      email ? email.trim() : null,
      telepon ? telepon.trim() : null,
      alamat ? alamat.trim() : null
    ]);

    return res.status(201).json({
      success: true,
      message: 'Data guru berhasil ditambahkan ke daftar alternatif.',
      data: {
        id: result.insertId,
        nip,
        nama_guru
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data guru: ' + error.message
    });
  }
};

// Mengubah data guru (via Modal Form)
const updateAlternatif = async (req, res) => {
  const { id } = req.params;
  const {
    nip,
    nama_guru,
    jenis_kelamin,
    pendidikan_terakhir,
    jabatan,
    masa_kerja,
    bidang_studi,
    email,
    telepon,
    alamat
  } = req.body;

  if (!nip || !nama_guru || !jenis_kelamin || !pendidikan_terakhir || !jabatan || !bidang_studi) {
    return res.status(400).json({
      success: false,
      message: 'Mohon lengkapi seluruh kolom isian wajib.'
    });
  }

  try {
    const [current] = await pool.query('SELECT id FROM alternatif WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data guru tidak ditemukan.'
      });
    }

    // Cek duplikasi NIP pada ID lain
    const [duplicate] = await pool.query(
      'SELECT id FROM alternatif WHERE nip = ? AND id != ?',
      [nip.trim(), id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: `NIP '${nip}' telah digunakan oleh data guru lain.`
      });
    }

    await pool.query(`
      UPDATE alternatif SET
        nip = ?,
        nama_guru = ?,
        jenis_kelamin = ?,
        pendidikan_terakhir = ?,
        jabatan = ?,
        masa_kerja = ?,
        bidang_studi = ?,
        email = ?,
        telepon = ?,
        alamat = ?
      WHERE id = ?
    `, [
      nip.trim(),
      nama_guru.trim(),
      jenis_kelamin.toUpperCase() === 'P' ? 'P' : 'L',
      pendidikan_terakhir.trim(),
      jabatan.trim(),
      parseInt(masa_kerja || 0, 10),
      bidang_studi.trim(),
      email ? email.trim() : null,
      telepon ? telepon.trim() : null,
      alamat ? alamat.trim() : null,
      id
    ]);

    return res.json({
      success: true,
      message: 'Data profil guru berhasil diperbarui.',
      data: { id: parseInt(id, 10), nip, nama_guru }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data guru: ' + error.message
    });
  }
};

// Menghapus data guru
const deleteAlternatif = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM alternatif WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data guru tidak ditemukan.'
      });
    }
    return res.json({
      success: true,
      message: 'Data guru dan semua rekam jejak penilaiannya berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data guru: ' + error.message
    });
  }
};

module.exports = {
  getAllAlternatif,
  getAlternatifDetail,
  createAlternatif,
  updateAlternatif,
  deleteAlternatif
};
