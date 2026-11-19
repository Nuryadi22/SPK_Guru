import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import DetailModal from '../components/DetailModal';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wp/dashboard');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      setError('Gagal memuat ringkasan dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenDetail = (guru) => {
    setSelectedGuru(guru);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Memuat data ringkasan sistem...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Kartu Selamat Datang */}
      <div className="card" style={{ borderLeft: '6px solid var(--color-primary)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-secondary)' }}>
          Selamat Datang di Sistem Pendukung Keputusan Guru Berprestasi
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '13px' }}>
          Sistem ini dirancang untuk mengevaluasi dan menetapkan guru berprestasi pada jenjang Sekolah Dasar (SD)
          secara objektif, transparan, dan terukur menggunakan metode <strong>Weighted Product (WP)</strong>.
        </p>
      </div>

      {/* Grid Statistik Utama */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-title">Jumlah Kriteria</div>
          <div className="stat-value">{summary?.total_kriteria || 0}</div>
          <div className="stat-desc">Kriteria evaluasi aktif (Pedagogik, Sosial, dsb.)</div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="stat-title">Alternatif Guru SD</div>
          <div className="stat-value">{summary?.total_guru || 0}</div>
          <div className="stat-desc">Tenaga pendidik terdaftar dalam sistem</div>
        </div>

        <div className="stat-card stat-card-accent">
          <div className="stat-title">Entri Nilai Matriks</div>
          <div className="stat-value">{summary?.total_penilaian || 0}</div>
          <div className="stat-desc">Rekam jejak nilai evaluasi kriteria</div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-title">Rekomendasi Utama (Peringkat 1)</div>
          <div className="stat-value" style={{ fontSize: '16px', lineHeight: '1.3', marginTop: '10px' }}>
            {summary?.guru_terbaik ? summary.guru_terbaik.nama_guru : 'Belum Dihitung'}
          </div>
          <div className="stat-desc">
            {summary?.guru_terbaik
              ? `Nilai Preferensi: ${summary.guru_terbaik.nilai_v.toFixed(4)} (${summary.guru_terbaik.persentase.toFixed(2)}%)`
              : 'Silakan lakukan perhitungan WP'}
          </div>
        </div>
      </div>

      {/* Tabel Kandidat Teratas & Menu Cepat */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Kandidat Peringkat Teratas (Top 3)</h3>
              <p className="card-desc">Hasil perankingan sementara berdasarkan akumulasi penilaian kinerja guru</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/perhitungan')}
            >
              Lihat Semua Peringkat
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Peringkat</th>
                  <th>Nama Lengkap Guru</th>
                  <th>Jabatan & Unit</th>
                  <th style={{ textAlign: 'right' }}>Nilai Preferensi</th>
                  <th style={{ textAlign: 'right' }}>Persentase</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {summary?.top_tiga && summary.top_tiga.length > 0 ? (
                  summary.top_tiga.map((item, idx) => (
                    <tr key={item.alternatif_id}>
                      <td>
                        <span className={`badge ${idx === 0 ? 'badge-rank-1' : 'badge-rank-top'}`}>
                          Juara {item.peringkat}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{item.nama_guru}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{item.jabatan}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>{item.nilai_v.toFixed(6)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontWeight: '700' }}>
                        {item.persentase.toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-detail"
                          onClick={() => handleOpenDetail(item)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      Belum ada kalkulasi perankingan. Silakan jalankan menu Perhitungan WP.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Alur & Tombol Tindakan Cepat */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Tindakan Cepat</h3>
              <p className="card-desc">Akses langsung modul alur SPK</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/perhitungan')}
            >
              Jalankan Perhitungan WP
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => navigate('/penilaian')}
            >
              Kelola Matriks Penilaian
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%' }}
              onClick={() => navigate('/alternatif')}
            >
              Kelola Data Guru SD
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%' }}
              onClick={() => navigate('/kriteria')}
            >
              Kelola Bobot Kriteria
            </button>

            <button
              type="button"
              className="btn btn-accent"
              style={{ width: '100%' }}
              onClick={() => navigate('/laporan')}
            >
              Buka Laporan Resmi & Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Penjelasan Metodologi Weighted Product */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '8px' }}>
          Tahapan Evaluasi Metode Weighted Product
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
          Sistem ini menerapkan metode Weighted Product untuk memproses data evaluasi tenaga pendidik secara terpadu melalui tiga tahapan utama:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '14px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <strong style={{ color: 'var(--color-secondary)' }}>1. Penyesuaian Bobot Kriteria</strong>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Menyesuaikan proporsi tingkat kepentingan setiap kriteria penilaian secara berimbang berdasarkan sifat kriteria keunggulan maupun aspek catatan evaluasi.
            </p>
          </div>
          <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <strong style={{ color: 'var(--color-secondary)' }}>2. Penilaian Terbobot Guru</strong>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Mengakumulasikan capaian kinerja setiap guru pada seluruh kriteria dengan memperhitungkan tingkat kepentingan bobot yang telah ditetapkan.
            </p>
          </div>
          <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <strong style={{ color: 'var(--color-secondary)' }}>3. Penentuan Peringkat Akhir</strong>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Membandingkan nilai preferensi akhir setiap kandidat terhadap keseluruhan guru untuk menetapkan penerima predikat Guru Berprestasi terbaik.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Detail Guru Peringkat */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Rincian Hasil Peringkat Guru: ${selectedGuru?.nama_guru}`}
        subtitle={`NIP: ${selectedGuru?.nip} &bull; Jabatan: ${selectedGuru?.jabatan}`}
      >
        {selectedGuru && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', padding: '14px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Peringkat Akhir:</span>
                <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-primary)' }}>
                  Peringkat ke-{selectedGuru.peringkat}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Status Kelayakan:</span>
                <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-success)' }}>
                  {selectedGuru.status_kelayakan}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Skor Evaluasi Terbobot:</span>
                <p style={{ fontWeight: '700', fontSize: '14px' }}>{selectedGuru.nilai_s.toFixed(6)}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nilai Preferensi Akhir:</span>
                <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-primary)' }}>
                  {selectedGuru.nilai_v.toFixed(6)} ({selectedGuru.persentase.toFixed(2)}%)
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-secondary)', marginBottom: '10px' }}>
              Rincian Capaian Nilai per Kriteria
            </h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Kriteria</th>
                    <th>Sifat</th>
                    <th style={{ textAlign: 'right' }}>Nilai Kinerja</th>
                    <th style={{ textAlign: 'right' }}>Bobot Kriteria</th>
                    <th style={{ textAlign: 'right' }}>Nilai Terbobot</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGuru.rincian_kalkulasi && selectedGuru.rincian_kalkulasi.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '700' }}>{r.kode_kriteria}</td>
                      <td>{r.nama_kriteria}</td>
                      <td>
                        <span className={`badge ${r.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                          {r.jenis === 'benefit' ? 'Benefit' : 'Cost'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{r.nilai_asli}</td>
                      <td style={{ textAlign: 'right' }}>{Math.abs(r.pangkat).toFixed(4)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{r.hasil_pangkat.toFixed(6)}</td>
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

export default DashboardPage;
