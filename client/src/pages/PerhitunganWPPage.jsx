import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import DetailModal from '../components/DetailModal';

const PerhitunganWPPage = () => {
  const [dataWP, setDataWP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('perankingan'); // 'perankingan' | 'vektor_s' | 'normalisasi'

  // Modal Detail Rincian Evaluasi Guru
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);

  const navigate = useNavigate();

  const fetchPerhitungan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/wp/hitung');
      if (res.data.success) {
        setDataWP(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses perhitungan WP. Pastikan data kriteria dan guru terisi lengkap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerhitungan();
  }, []);

  const handleOpenDetailModal = (item) => {
    setSelectedGuru(item);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Sedang memproses evaluasi Weighted Product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">{error}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchPerhitungan}
          >
            Coba Hitung Lagi
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/penilaian')}
          >
            Periksa Matriks Penilaian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Halaman & Ringkasan */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Kalkulasi Metode Weighted Product (WP)</h2>
            <p className="card-desc">
              Sistem mengevaluasi dan merangking guru berprestasi melalui tahapan pembobotan kriteria, penilaian terbobot, dan penetapan nilai preferensi akhir
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchPerhitungan}
            >
              Hitung Ulang WP
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/laporan')}
            >
              Lihat Format Laporan
            </button>
          </div>
        </div>

        {/* Banner Rekomendasi Utama */}
        {dataWP?.ringkasan?.guru_terbaik && (
          <div style={{ padding: '16px', backgroundColor: '#FAEEE8', border: '1px solid #EAC9BC', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              HASIL REKOMENDASI TERBAIK (PERINGKAT 1 GURU BERPRESTASI SD)
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-secondary)' }}>
                  {dataWP.ringkasan.guru_terbaik.nama_guru}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  NIP: {dataWP.ringkasan.guru_terbaik.nip} &bull; Jabatan: {dataWP.ringkasan.guru_terbaik.jabatan} &bull; Masa Kerja: {dataWP.ringkasan.guru_terbaik.masa_kerja} Tahun
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Nilai Preferensi Akhir:</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>
                  {dataWP.ringkasan.guru_terbaik.nilai_v.toFixed(6)} ({dataWP.ringkasan.guru_terbaik.persentase.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigasi Langkah Kalkulasi */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'perankingan' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('perankingan')}
          >
            1. Hasil Perankingan Akhir
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'vektor_s' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('vektor_s')}
          >
            2. Penilaian Terbobot Guru
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'normalisasi' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('normalisasi')}
          >
            3. Pembobotan Kriteria
          </button>
        </div>

        {/* ISI TAB 1: HASIL PERANKINGAN AKHIR */}
        {activeTab === 'perankingan' && (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Hasil perankingan komparatif seluruh guru berprestasi. Alternatif dengan nilai preferensi tertinggi menjadi prioritas utama penerima penghargaan Guru Berprestasi Sekolah Dasar.
            </div>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Peringkat</th>
                    <th style={{ width: '150px' }}>NIP</th>
                    <th>Nama Guru Berprestasi</th>
                    <th>Jabatan & Unit SD</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Skor Terbobot</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Nilai Preferensi</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Persentase</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Aksi Baris</th>
                  </tr>
                </thead>
                <tbody>
                  {dataWP?.perankingan && dataWP.perankingan.map((item) => (
                    <tr key={item.alternatif_id}>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${item.peringkat === 1 ? 'badge-rank-1' : item.peringkat <= 3 ? 'badge-rank-top' : 'badge-rank-normal'}`}>
                          Juara {item.peringkat}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.nip}</td>
                      <td style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>
                        {item.nama_guru}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{item.jabatan}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.nilai_s.toFixed(6)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '14px', color: 'var(--color-primary)' }}>
                        {item.nilai_v.toFixed(6)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-secondary)' }}>
                        {item.persentase.toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
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
                    <td style={{ textAlign: 'right', color: 'var(--color-secondary)' }}>100.00%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ISI TAB 2: PENILAIAN TERBOBOT GURU */}
        {activeTab === 'vektor_s' && (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Tabel hasil penilaian kinerja setiap guru setelah memperhitungkan proporsi bobot masing-masing kriteria.
            </div>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>No</th>
                    <th style={{ width: '150px' }}>NIP</th>
                    <th>Nama Guru</th>
                    {dataWP?.kriteria_normalisasi && dataWP.kriteria_normalisasi.map((k) => (
                      <th key={k.kriteria_id} style={{ textAlign: 'right' }}>
                        {k.kode_kriteria}
                      </th>
                    ))}
                    <th style={{ width: '150px', textAlign: 'right' }}>Total Skor Terbobot</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataWP?.vektor_s && dataWP.vektor_s.map((row, idx) => (
                    <tr key={row.alternatif_id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.nip}</td>
                      <td style={{ fontWeight: '700' }}>{row.nama_guru}</td>
                      {row.rincian_kalkulasi.map((r, i) => (
                        <td key={i} style={{ textAlign: 'right', fontSize: '12px' }}>
                          {r.hasil_pangkat.toFixed(4)}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)' }}>
                        {row.nilai_s.toFixed(6)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-detail"
                          onClick={() => handleOpenDetailModal(row)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-bg-muted)', fontWeight: '700' }}>
                    <td colSpan={dataWP?.kriteria_normalisasi.length + 3} style={{ textAlign: 'right' }}>
                      Jumlah Total Skor Terbobot:
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>
                      {dataWP?.ringkasan?.total_vektor_s.toFixed(6)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ISI TAB 3: PEMBOBOTAN KRITERIA */}
        {activeTab === 'normalisasi' && (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Proporsi tingkat kepentingan setiap kriteria evaluasi yang digunakan sebagai dasar pembobotan kinerja guru.
            </div>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Kode</th>
                    <th>Nama Kriteria</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Sifat / Jenis</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Bobot Awal</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Bobot Relatif</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Nilai Penyesuaian</th>
                    <th>Peran dalam Evaluasi Guru</th>
                  </tr>
                </thead>
                <tbody>
                  {dataWP?.kriteria_normalisasi && dataWP.kriteria_normalisasi.map((k) => (
                    <tr key={k.kriteria_id}>
                      <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{k.kode_kriteria}</td>
                      <td style={{ fontWeight: '600' }}>{k.nama_kriteria}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${k.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                          {k.jenis === 'benefit' ? 'Benefit' : 'Cost'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{k.bobot_awal.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-secondary)' }}>
                        {k.bobot_ternormalisasi.toFixed(4)} ({(k.bobot_ternormalisasi * 100).toFixed(1)}%)
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: k.pangkat > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {k.pangkat > 0 ? `+${k.pangkat.toFixed(4)}` : k.pangkat.toFixed(4)}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {k.jenis === 'benefit'
                          ? 'Kriteria Keunggulan: Semakin tinggi capaian guru, semakin besar pengaruh positifnya.'
                          : 'Kriteria Catatan: Semakin kecil angka keluhan/insiden, semakin baik hasil akhir guru.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-bg-muted)', fontWeight: '700' }}>
                    <td colSpan="3" style={{ textAlign: 'right' }}>Total:</td>
                    <td style={{ textAlign: 'right' }}>{dataWP?.ringkasan?.total_bobot_awal.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>1.0000 (100%)</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL POP-UP: RINCIAN EVALUASI KINERJA GURU (TOMBOL DETAIL) */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Rincian Evaluasi Kinerja: ${selectedGuru?.nama_guru}`}
        subtitle={`NIP: ${selectedGuru?.nip} &bull; Peringkat: ${selectedGuru?.peringkat || '-'} &bull; Jabatan: ${selectedGuru?.jabatan}`}
        size="lg"
      >
        {selectedGuru && (
          <div>
            {/* Kartu Ringkasan Hasil Nilai Guru */}
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
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Skor Evaluasi Terbobot:</span>
                <p style={{ fontWeight: '700', fontSize: '15px' }}>{selectedGuru.nilai_s.toFixed(6)}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nilai Preferensi Akhir:</span>
                <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-primary)' }}>
                  {selectedGuru.nilai_v.toFixed(6)} ({selectedGuru.persentase.toFixed(2)}%)
                </p>
              </div>
            </div>

            {/* Tabel Penilaian Tiap Kriteria (Tanpa Rumus) */}
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-secondary)', marginBottom: '10px' }}>
              Rincian Penilaian per Aspek Kriteria
            </h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>Kode</th>
                    <th>Nama Kriteria</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Sifat</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Nilai Kinerja</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Bobot Aspek</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Nilai Terbobot</th>
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
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-secondary)' }}>
                        {r.hasil_pangkat.toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-bg-muted)', fontWeight: '700' }}>
                    <td colSpan="5" style={{ textAlign: 'right' }}>
                      Total Skor Evaluasi Terbobot:
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontSize: '14px' }}>
                      {selectedGuru.nilai_s.toFixed(6)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
};

export default PerhitunganWPPage;
