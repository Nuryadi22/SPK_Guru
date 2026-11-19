const pool = require('../config/db');

// Mengambil seluruh matriks penilaian (daftar guru beserta nilai di tiap kriteria)
const getMatriksPenilaian = async (req, res) => {
  try {
    const [kriteria] = await pool.query('SELECT * FROM kriteria ORDER BY kode_kriteria ASC');
    const [alternatif] = await pool.query('SELECT * FROM alternatif ORDER BY nama_guru ASC');
    const [penilaian] = await pool.query('SELECT * FROM penilaian');

    // Buat pemetaan penilaian: [alt_id][kriteria_id] = nilai
    const nilaiMap = {};
    penilaian.forEach(p => {
      if (!nilaiMap[p.alternatif_id]) {
        nilaiMap[p.alternatif_id] = {};
      }
      nilaiMap[p.alternatif_id][p.kriteria_id] = parseFloat(p.nilai);
    });

    // Susun baris matriks
    const matriks = alternatif.map(alt => {
      const nilaiPerKriteria = {};
      let terisiLengkap = true;

      kriteria.forEach(k => {
        const val = (nilaiMap[alt.id] && nilaiMap[alt.id][k.id] !== undefined)
          ? nilaiMap[alt.id][k.id]
          : null;
        nilaiPerKriteria[k.id] = val;
        if (val === null) terisiLengkap = false;
      });

      return {
        alternatif_id: alt.id,
        nip: alt.nip,
        nama_guru: alt.nama_guru,
        jabatan: alt.jabatan,
        nilai: nilaiPerKriteria,
        terisi_lengkap: terisiLengkap
      };
    });

    return res.json({
      success: true,
      data: {
        kriteria,
        alternatif,
        matriks
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil matriks penilaian: ' + error.message
    });
  }
};

// Mengambil data nilai seorang guru untuk dimuat ke dalam Modal Edit Penilaian
const getPenilaianGuru = async (req, res) => {
  const { alternatifId } = req.params;
  try {
    const [altRows] = await pool.query('SELECT id, nip, nama_guru, jabatan FROM alternatif WHERE id = ?', [alternatifId]);
    if (altRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan.'
      });
    }

    const [rows] = await pool.query(`
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
    `, [alternatifId]);

    return res.json({
      success: true,
      data: {
        guru: altRows[0],
        penilaian: rows
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil form nilai guru: ' + error.message
    });
  }
};

// Menyimpan atau memperbarui sekumpulan nilai untuk satu guru (via Modal Form)
const savePenilaianBatch = async (req, res) => {
  const { alternatif_id, nilai_list } = req.body;

  if (!alternatif_id || !Array.isArray(nilai_list) || nilai_list.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Data penilaian tidak valid. Pastikan alternatif guru dan daftar nilai terisi.'
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of nilai_list) {
      const kriteria_id = parseInt(item.kriteria_id, 10);
      const nilai = parseFloat(item.nilai);

      if (isNaN(nilai) || nilai < 0) {
        throw new Error(`Nilai untuk kriteria ID ${kriteria_id} tidak valid.`);
      }

      await connection.query(`
        INSERT INTO penilaian (alternatif_id, kriteria_id, nilai)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE nilai = VALUES(nilai), updated_at = CURRENT_TIMESTAMP
      `, [alternatif_id, kriteria_id, nilai]);
    }

    await connection.commit();
    return res.json({
      success: true,
      message: 'Nilai evaluasi guru berhasil disimpan.'
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan penilaian: ' + error.message
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getMatriksPenilaian,
  getPenilaianGuru,
  savePenilaianBatch
};
