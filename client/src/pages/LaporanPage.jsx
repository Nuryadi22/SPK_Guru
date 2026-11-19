import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import DetailModal from '../components/DetailModal';

const LaporanPage = () => {
  const [dataWP, setDataWP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Detail Rincian
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);

  const navigate = useNavigate();

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wp/hitung');
      if (res.data.success) {
        setDataWP(res.data.data);
      }
    } catch (err) {
      setError('Gagal memuat laporan. Pastikan seluruh kriteria dan nilai telah terisi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleOpenDetailModal = (item) => {
    setSelectedGuru(item);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Mempersiapkan dokumen laporan resmi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">{error}</div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/perhitungan')}
        >
          Buka Halaman Perhitungan WP
        </button>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div>
      {/* Tombol Aksi di Layar (Tidak ikut tercetak saat print) */}
      <div className="card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title">Laporan Keputusan Hasil Akhir Guru Berprestasi</h3>
          <p className="card-desc">Format resmi cetak Surat Keputusan Sekolah Dasar</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            Cetak Dokumen Laporan
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/perhitungan')}
          >
            Kembali ke Perhitungan
          </button>
        </div>
      </div>

      {/* DOKUMEN CETAK FORMAL */}
      <div className="card" style={{ padding: '36px 40px', backgroundColor: '#FFFFFF' }}>
        {/* KOP SURAT RESMI SEKOLAH DASAR */}
        <div className="kop-surat">
          <div className="kop-instansi">PEMERINTAH KABUPATEN / KOTA &bull; DINAS PENDIDIKAN</div>
          <div className="kop-sekolah">SEKOLAH DASAR NEGERI 01 HARAPAN BANGSA</div>
          <div className="kop-alamat">
            Jalan Ki Hajar Dewantara No. 45, Kecamatan Sukamaju &bull; Telp. (021) 8765-4321 &bull; Email: sdn01harapan@pendidikan.go.id
          </div>
        </div>

        {/* JUDUL LAPORAN RESMI */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
            SURAT KEPUTUSAN PENETAPAN GURU BERPRESTASI SEKOLAH DASAR
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            BERDASARKAN HASIL EVALUASI METODE WEIGHTED PRODUCT (WP) TAHUN AJARAN 2026/2027
          </p>
          <div style={{ width: '80px', height: '2px', backgroundColor: 'var(--color-primary)', margin: '8px auto 0 auto' }}></div>
        </div>

        {/* PARAGRAF PENGANTAR */}
        <p style={{ fontSize: '13px', lineHeight: '1.7', textAlign: 'justify', marginBottom: '18px' }}>
          Berdasarkan hasil akumulasi penilaian kriteria kinerja tenaga pendidik (Kompetensi Pedagogik, Kompetensi Kepribadian & Sosial, Prestasi & Inovasi Pembelajaran, Kedisiplinan Kehadiran, serta Catatan Pelanggaran Etika) yang diproses secara kuantitatif melalui sistem pendukung keputusan metode <strong>Weighted Product (WP)</strong>, maka dengan ini ditetapkan perolehan skor preferensi dan perankingan guru berprestasi sebagai berikut:
        </p>

        {/* TABEL HASIL PERANKINGAN RESMI */}
        <div className="table-responsive" style={{ marginBottom: '24px' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Peringkat</th>
                <th style={{ width: '160px' }}>NIP</th>
                <th>Nama Lengkap Guru</th>
                <th>Jabatan / Tugas</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Skor Terbobot</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Nilai Preferensi</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Persentase</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Status Keputusan</th>
                <th className="no-print" style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataWP?.perankingan && dataWP.perankingan.map((item) => (
                <tr key={item.alternatif_id}>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${item.peringkat === 1 ? 'badge-rank-1' : item.peringkat <= 3 ? 'badge-rank-top' : 'badge-rank-normal'}`}>
                      Peringkat {item.peringkat}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.nip}</td>
                  <td style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>
                    {item.nama_guru}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{item.jabatan}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.nilai_s.toFixed(6)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {item.nilai_v.toFixed(6)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>
                    {item.persentase.toFixed(2)}%
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: item.peringkat === 1 ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                      {item.peringkat === 1 ? 'Pemenang Utama' : item.peringkat <= 3 ? 'Kandidat Unggul' : 'Memenuhi Syarat'}
                    </span>
                  </td>
                  <td className="no-print" style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-detail"
                      onClick={() => handleOpenDetailModal(item)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'var(--color-bg-muted)', fontWeight: '700' }}>
                <td colSpan="4" style={{ textAlign: 'right' }}>Total Akumulasi:</td>
                <td style={{ textAlign: 'right' }}>{dataWP?.ringkasan?.total_vektor_s.toFixed(6)}</td>
                <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>1.000000</td>
                <td style={{ textAlign: 'right' }}>100.00%</td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* CATATAN RESMI */}
        <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <strong>Catatan Keputusan:</strong>
          <ol style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: '1.6' }}>
            <li>
              Peringkat 1 dengan nama <strong>{dataWP?.ringkasan?.guru_terbaik?.nama_guru}</strong> dinyatakan berhak menerima Piagam Penghargaan Guru Berprestasi Sekolah Dasar dan direkomendasikan mewakili sekolah pada ajang pemilihan tingkat Kecamatan / Kabupaten.
            </li>
            <li>
              Keputusan ini bersifat mutlak berdasarkan hasil evaluasi sistem pendukung keputusan Weighted Product yang valid dan dapat dipertanggungjawabkan.
            </li>
          </ol>
        </div>

        {/* LEMBAR TANDA TANGAN FORMAL */}
        <div className="ttd-container">
          <div className="ttd-box">
            <div className="ttd-jabatan">
              Ketua Tim Penilai Kinerja Guru,
            </div>
            <div className="ttd-nama">
              Drs. H. Mulyadi, M.Pd.
            </div>
            <div className="ttd-nip">
              NIP. 197804152003121002
            </div>
          </div>

          <div className="ttd-box">
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
              Ditetapkan di Sukamaju, {currentDate}
            </div>
            <div className="ttd-jabatan">
              Kepala Sekolah SDN 01 Harapan Bangsa,
            </div>
            <div className="ttd-nama">
              Dra. Hj. Sri Wahyuni, M.Pd.
            </div>
            <div className="ttd-nip">
              NIP. 196908121994032001
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL GURU (UNTUK VERIFIKASI PADA LAPORAN) */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Rincian Capaian Kinerja: ${selectedGuru?.nama_guru}`}
        subtitle={`NIP: ${selectedGuru?.nip} &bull; Peringkat ke-${selectedGuru?.peringkat}`}
      >
        {selectedGuru && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px', padding: '14px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Peringkat Akhir:</span>
                <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-primary)' }}>
                  Peringkat ke-{selectedGuru.peringkat}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Status Rekomendasi:</span>
                <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-success)' }}>
                  {selectedGuru.status_kelayakan}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Skor Terbobot:</span>
                <p style={{ fontWeight: '700', fontSize: '15px' }}>{selectedGuru.nilai_s.toFixed(6)}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nilai Preferensi:</span>
                <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-primary)' }}>
                  {selectedGuru.nilai_v.toFixed(6)} ({selectedGuru.persentase.toFixed(2)}%)
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-secondary)', marginBottom: '8px' }}>
              Detail Nilai Capaian per Aspek Kriteria
            </h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Kriteria</th>
                    <th style={{ textAlign: 'center' }}>Sifat</th>
                    <th style={{ textAlign: 'right' }}>Nilai Kinerja</th>
                    <th style={{ textAlign: 'right' }}>Bobot Aspek</th>
                    <th style={{ textAlign: 'right' }}>Nilai Terbobot</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGuru.rincian_kalkulasi && selectedGuru.rincian_kalkulasi.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{r.kode_kriteria}</td>
                      <td>{r.nama_kriteria}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${r.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                          {r.jenis === 'benefit' ? 'Benefit' : 'Cost'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{r.nilai_asli}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {Math.abs(r.pangkat).toFixed(4)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--color-secondary)' }}>
                        {r.hasil_pangkat.toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
};

export default LaporanPage;
