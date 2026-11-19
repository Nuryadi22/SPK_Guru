/**
 * Modul Perhitungan Weighted Product (WP)
 * SPK Pemilihan Guru Berprestasi Sekolah Dasar
 */

function calculateWeightedProduct(kriteriaList, alternatifList, penilaianList) {
  if (!kriteriaList || kriteriaList.length === 0) {
    throw new Error('Data kriteria belum tersedia.');
  }
  if (!alternatifList || alternatifList.length === 0) {
    throw new Error('Data alternatif guru belum tersedia.');
  }

  // 1. Matriks Penilaian: Map (alternatif_id -> (kriteria_id -> nilai))
  const matrix = {};
  alternatifList.forEach(alt => {
    matrix[alt.id] = {};
    kriteriaList.forEach(k => {
      matrix[alt.id][k.id] = 0;
    });
  });

  penilaianList.forEach(p => {
    if (matrix[p.alternatif_id] && matrix[p.alternatif_id][p.kriteria_id] !== undefined) {
      matrix[p.alternatif_id][p.kriteria_id] = parseFloat(p.nilai) || 0;
    }
  });

  // 2. Normalisasi Bobot Kriteria (W)
  const totalBobot = kriteriaList.reduce((sum, k) => sum + parseFloat(k.bobot || 0), 0);

  if (totalBobot <= 0) {
    throw new Error('Total bobot kriteria harus lebih besar dari 0.');
  }

  const normalisasiBobot = kriteriaList.map(k => {
    const rawBobot = parseFloat(k.bobot);
    const wNorm = rawBobot / totalBobot;
    // Jika benefit pangkat positif (+), jika cost pangkat negatif (-)
    const pangkat = k.jenis === 'cost' ? -wNorm : wNorm;

    return {
      kriteria_id: k.id,
      kode_kriteria: k.kode_kriteria,
      nama_kriteria: k.nama_kriteria,
      jenis: k.jenis,
      bobot_awal: rawBobot,
      bobot_ternormalisasi: wNorm,
      pangkat: pangkat
    };
  });

  // 3. Menghitung Vektor S (S_i = \prod (X_ij)^w_j)
  const vektorSList = [];

  alternatifList.forEach(alt => {
    let productS = 1;
    const rincianKalkulasi = [];

    normalisasiBobot.forEach(norm => {
      const nilaiX = matrix[alt.id][norm.kriteria_id] || 0;

      // Handle nilai 0 atau negatif untuk pemangkatan matematis
      const safeNilai = nilaiX > 0 ? nilaiX : 1;
      const hasilPangkat = Math.pow(safeNilai, norm.pangkat);

      productS *= hasilPangkat;

      rincianKalkulasi.push({
        kode_kriteria: norm.kode_kriteria,
        nama_kriteria: norm.nama_kriteria,
        jenis: norm.jenis,
        nilai_asli: nilaiX,
        pangkat: norm.pangkat,
        hasil_pangkat: hasilPangkat,
        formula_teks: `(${nilaiX})^(${norm.pangkat.toFixed(4)}) = ${hasilPangkat.toFixed(6)}`
      });
    });

    vektorSList.push({
      alternatif_id: alt.id,
      nip: alt.nip,
      nama_guru: alt.nama_guru,
      jabatan: alt.jabatan,
      pendidikan_terakhir: alt.pendidikan_terakhir,
      masa_kerja: alt.masa_kerja,
      nilai_s: productS,
      rincian_kalkulasi: rincianKalkulasi
    });
  });

  // 4. Menghitung Total Vektor S (\sum S_k)
  const totalS = vektorSList.reduce((sum, item) => sum + item.nilai_s, 0);

  if (totalS <= 0) {
    throw new Error('Total nilai Vektor S bernilai 0. Pastikan nilai penilaian sudah terisi dengan benar.');
  }

  // 5. Menghitung Vektor V (V_i = S_i / \sum S_k) & Perankingan
  const hasilPerankingan = vektorSList.map(item => {
    const nilaiV = item.nilai_s / totalS;
    const persentase = nilaiV * 100;

    return {
      alternatif_id: item.alternatif_id,
      nip: item.nip,
      nama_guru: item.nama_guru,
      jabatan: item.jabatan,
      pendidikan_terakhir: item.pendidikan_terakhir,
      masa_kerja: item.masa_kerja,
      nilai_s: item.nilai_s,
      nilai_v: nilaiV,
      persentase: persentase,
      rincian_kalkulasi: item.rincian_kalkulasi,
      formula_v_teks: `${item.nilai_s.toFixed(6)} / ${totalS.toFixed(6)} = ${nilaiV.toFixed(6)}`
    };
  });

  // Urutkan nilai V secara descending (terbesar ke terkecil)
  hasilPerankingan.sort((a, b) => b.nilai_v - a.nilai_v);

  // Sematkan nomor peringkat
  hasilPerankingan.forEach((item, index) => {
    item.peringkat = index + 1;
    item.status_kelayakan = index === 0 ? 'Rekomendasi Utama (Peringkat 1)' : (index < 3 ? 'Kandidat Unggulan' : 'Memenuhi Syarat');
  });

  return {
    ringkasan: {
      total_kriteria: kriteriaList.length,
      total_alternatif: alternatifList.length,
      total_bobot_awal: totalBobot,
      total_vektor_s: totalS,
      guru_terbaik: hasilPerankingan[0] || null
    },
    matriks_awal: matrix,
    kriteria_normalisasi: normalisasiBobot,
    vektor_s: vektorSList,
    perankingan: hasilPerankingan
  };
}

module.exports = {
  calculateWeightedProduct
};
