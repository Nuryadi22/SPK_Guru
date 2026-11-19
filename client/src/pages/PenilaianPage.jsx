import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from '../components/Modal';
import DetailModal from '../components/DetailModal';
import { useAuth } from '../context/AuthContext';

const PenilaianPage = () => {
  const [kriteria, setKriteria] = useState([]);
  const [matriks, setMatriks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal Form Input / Edit Penilaian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [nilaiForm, setNilaiForm] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Detail Penilaian Guru
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGuru, setDetailGuru] = useState(null);

  const { isAdmin } = useAuth();

  const fetchMatriks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/penilaian/matriks');
      if (res.data.success) {
        setKriteria(res.data.data.kriteria);
        setMatriks(res.data.data.matriks);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: 'Gagal memuat matriks penilaian: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatriks();
  }, []);

  const handleOpenInputModal = (guruRow) => {
    setSelectedGuru(guruRow);
    setFormError('');

    const initialValues = {};
    kriteria.forEach((k) => {
      initialValues[k.id] = guruRow.nilai[k.id] !== null && guruRow.nilai[k.id] !== undefined
        ? guruRow.nilai[k.id]
        : '';
    });
    setNilaiForm(initialValues);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (guruRow) => {
    setDetailGuru(guruRow);
    setIsDetailOpen(true);
  };

  const handleNilaiChange = (kriteriaId, value) => {
    setNilaiForm((prev) => ({
      ...prev,
      [kriteriaId]: value
    }));
  };

  const handleSubmitNilai = async (e) => {
    e.preventDefault();
    setFormError('');

    const payloadNilai = [];
    for (const k of kriteria) {
      const val = nilaiForm[k.id];
      if (val === '' || val === null || val === undefined) {
        setFormError(`Nilai untuk kriteria '${k.kode_kriteria} - ${k.nama_kriteria}' belum diisi.`);
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        setFormError(`Nilai untuk kriteria '${k.kode_kriteria}' harus berupa angka valid >= 0.`);
        return;
      }
      payloadNilai.push({
        kriteria_id: k.id,
        nilai: num
      });
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/penilaian/batch', {
        alternatif_id: selectedGuru.alternatif_id,
        nilai_list: payloadNilai
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setIsModalOpen(false);
        fetchMatriks();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan nilai evaluasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Matriks Penilaian Kinerja Guru</h2>
            <p className="card-desc">
              Pengisian dan evaluasi nilai setiap alternatif guru pada seluruh kriteria pemilihan guru berprestasi SD
            </p>
          </div>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {kriteria.length === 0 ? (
          <div className="alert alert-info">
            Belum ada kriteria yang dibuat. Silakan tambahkan kriteria terlebih dahulu pada menu <strong>Data Kriteria</strong>.
          </div>
        ) : null}

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No</th>
                <th style={{ width: '150px' }}>NIP</th>
                <th>Nama Guru</th>
                {kriteria.map((k) => (
                  <th key={k.id} style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div>{k.kode_kriteria}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                      ({k.jenis})
                    </div>
                  </th>
                ))}
                <th style={{ textAlign: 'center', width: '130px' }}>Status Data</th>
                <th style={{ textAlign: 'center', width: '160px' }}>Aksi Baris</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={kriteria.length + 5} style={{ textAlign: 'center', padding: '30px' }}>
                    Memuat matriks penilaian...
                  </td>
                </tr>
              ) : matriks.length > 0 ? (
                matriks.map((row, idx) => (
                  <tr key={row.alternatif_id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{row.nip}</td>
                    <td style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>
                      {row.nama_guru}
                    </td>
                    {kriteria.map((k) => {
                      const val = row.nilai[k.id];
                      return (
                        <td key={k.id} style={{ textAlign: 'right', fontWeight: '600' }}>
                          {val !== null && val !== undefined ? (
                            <span>{val}</span>
                          ) : (
                            <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>-</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      {row.terisi_lengkap ? (
                        <span className="badge badge-benefit">Lengkap</span>
                      ) : (
                        <span className="badge badge-cost">Belum Lengkap</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-detail"
                          onClick={() => handleOpenDetailModal(row)}
                        >
                          Detail
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-edit"
                            onClick={() => handleOpenInputModal(row)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={kriteria.length + 5} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    Belum ada data guru terdaftar. Silakan tambahkan guru pada menu <strong>Data Guru</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POP-UP: FORM INPUT & EDIT NILAI PENILAIAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Input & Edit Nilai Evaluasi Guru`}
        subtitle={`Guru: ${selectedGuru?.nama_guru} (NIP: ${selectedGuru?.nip})`}
        onSubmit={handleSubmitNilai}
        submitText="Simpan Matriks Nilai"
        isLoading={isSubmitting}
        size="lg"
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
            {formError}
          </div>
        )}

        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <strong>Petunjuk Evaluasi:</strong> Masukkan nilai capaian untuk setiap kriteria berikut. Kriteria bertipe <em>Benefit</em> bernilai semakin tinggi semakin baik (skala umum 70 - 100), sedangkan bertipe <em>Cost</em> bernilai semakin kecil semakin baik (contoh: 0 - 10 catatan evaluasi).
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {kriteria.map((k) => (
            <div
              key={k.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '16px',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>{k.kode_kriteria}</strong>
                  <span style={{ fontWeight: '600', color: 'var(--color-secondary)' }}>{k.nama_kriteria}</span>
                  <span className={`badge ${k.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                    {k.jenis} (Bobot: {k.bobot})
                  </span>
                </div>
                {k.keterangan && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {k.keterangan}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  className="form-input"
                  placeholder="Masukkan angka nilai"
                  value={nilaiForm[k.id] ?? ''}
                  onChange={(e) => handleNilaiChange(k.id, e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL POP-UP: DETAIL NILAI GURU */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Rincian Nilai Evaluasi: ${detailGuru?.nama_guru}`}
        subtitle={`NIP: ${detailGuru?.nip} &bull; Jabatan: ${detailGuru?.jabatan}`}
        size="md"
      >
        {detailGuru && (
          <div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>Kode</th>
                    <th>Nama Kriteria</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Sifat</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Bobot</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Nilai Kinerja</th>
                  </tr>
                </thead>
                <tbody>
                  {kriteria.map((k) => {
                    const val = detailGuru.nilai[k.id];
                    return (
                      <tr key={k.id}>
                        <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{k.kode_kriteria}</td>
                        <td style={{ fontWeight: '600' }}>{k.nama_kriteria}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${k.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                            {k.jenis}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{k.bobot}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '14px', color: 'var(--color-secondary)' }}>
                          {val !== null && val !== undefined ? val : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
};

export default PenilaianPage;
