import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from '../components/Modal';
import DetailModal from '../components/DetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

const KriteriaPage = () => {
  const [kriteriaList, setKriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // State Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    kode_kriteria: '',
    nama_kriteria: '',
    bobot: 1,
    jenis: 'benefit',
    keterangan: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // State Modal Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isAdmin } = useAuth();

  const fetchKriteria = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kriteria');
      if (res.data.success) {
        setKriteriaList(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Gagal memuat data kriteria: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKriteria();
  }, []);

  const resetForm = () => {
    setFormData({
      kode_kriteria: '',
      nama_kriteria: '',
      bobot: 1,
      jenis: 'benefit',
      keterangan: ''
    });
    setFormError('');
    setSelectedId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    const nextNum = kriteriaList.length + 1;
    setFormData((prev) => ({ ...prev, kode_kriteria: `C${nextNum}` }));
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    resetForm();
    setSelectedId(item.id);
    setFormData({
      kode_kriteria: item.kode_kriteria,
      nama_kriteria: item.nama_kriteria,
      bobot: item.bobot,
      jenis: item.jenis,
      keterangan: item.keterangan || ''
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (item) => {
    setDetailData(item);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteModal = (item) => {
    setDeleteTarget(item);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.kode_kriteria.trim() || !formData.nama_kriteria.trim()) {
      setFormError('Kode kriteria dan nama kriteria wajib diisi.');
      return;
    }

    if (parseFloat(formData.bobot) <= 0) {
      setFormError('Nilai bobot kriteria harus lebih besar dari 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'add') {
        const res = await api.post('/kriteria', formData);
        if (res.data.success) {
          setAlert({ type: 'success', message: res.data.message });
          setIsModalOpen(false);
          fetchKriteria();
        }
      } else {
        const res = await api.put(`/kriteria/${selectedId}`, formData);
        if (res.data.success) {
          setAlert({ type: 'success', message: res.data.message });
          setIsModalOpen(false);
          fetchKriteria();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data kriteria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/kriteria/${deleteTarget.id}`);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setIsDeleteOpen(false);
        fetchKriteria();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Gagal menghapus kriteria.' });
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalBobot = kriteriaList.reduce((acc, k) => acc + parseFloat(k.bobot || 0), 0);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Manajemen Data Kriteria Penilaian</h2>
            <p className="card-desc">
              Kelola daftar kriteria evaluasi guru SD beserta nilai bobot preferensi dan jenis atribut
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
            >
              Tambah Kriteria Baru
            </button>
          )}
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Kode</th>
                <th>Nama Kriteria Evaluasi</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Nilai Bobot</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Bobot Relatif</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Sifat / Jenis</th>
                <th>Keterangan Aspek Penilaian</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Aksi Baris</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    Memuat data kriteria...
                  </td>
                </tr>
              ) : kriteriaList.length > 0 ? (
                kriteriaList.map((item) => {
                  const normW = totalBobot > 0 ? (parseFloat(item.bobot) / totalBobot) : 0;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                        {item.kode_kriteria}
                      </td>
                      <td style={{ fontWeight: '600' }}>{item.nama_kriteria}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>{item.bobot}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-secondary)', fontWeight: '600' }}>
                        {(normW * 100).toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${item.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                          {item.jenis === 'benefit' ? 'Benefit' : 'Cost'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                        {item.keterangan || '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-detail"
                            onClick={() => handleOpenDetailModal(item)}
                          >
                            Detail
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                className="btn btn-edit"
                                onClick={() => handleOpenEditModal(item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => handleOpenDeleteModal(item)}
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    Belum ada data kriteria yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
            {kriteriaList.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: 'var(--color-bg-muted)', fontWeight: '700' }}>
                  <td colSpan="2" style={{ textAlign: 'right' }}>Total Bobot:</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>{totalBobot.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-secondary)' }}>100%</td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL POP-UP: TAMBAH / EDIT KRITERIA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Data Kriteria Baru' : `Edit Kriteria: ${formData.kode_kriteria}`}
        subtitle="Form input kriteria evaluasi guru sekolah dasar"
        onSubmit={handleFormSubmit}
        submitText={modalMode === 'add' ? 'Simpan Kriteria' : 'Perbarui Kriteria'}
        isLoading={isSubmitting}
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
            {formError}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label-required">Kode Kriteria</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: C1, C2, dst."
              value={formData.kode_kriteria}
              onChange={(e) => setFormData({ ...formData, kode_kriteria: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Bobot Nilai (1 - 5 / Angka Positif)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              className="form-input"
              placeholder="Contoh: 5 atau 4"
              value={formData.bobot}
              onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Nama Kriteria</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Kompetensi Pedagogik & Penguasaan Kelas"
            value={formData.nama_kriteria}
            onChange={(e) => setFormData({ ...formData, nama_kriteria: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Sifat / Jenis Kriteria</label>
          <select
            className="form-select"
            value={formData.jenis}
            onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
          >
            <option value="benefit">Benefit (Semakin tinggi nilai, semakin baik)</option>
            <option value="cost">Cost (Semakin kecil nilai, semakin baik)</option>
          </select>
          <span className="form-help">
            Kriteria benefit memberikan kontribusi positif terhadap prestasi guru, sedangkan kriteria cost merupakan aspek catatan atau evaluasi.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan / Indikator Penilaian</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Tuliskan panduan atau indikator aspek penilaian ini..."
            value={formData.keterangan}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
          />
        </div>
      </Modal>

      {/* MODAL POP-UP: DETAIL KRITERIA */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Rincian Kriteria: ${detailData?.kode_kriteria} - ${detailData?.nama_kriteria}`}
        subtitle="Informasi lengkap atribut kriteria evaluasi metode WP"
        size="md"
      >
        {detailData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Kode Kriteria:</span>
                <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-primary)' }}>{detailData.kode_kriteria}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Jenis / Sifat:</span>
                <p style={{ fontWeight: '700', fontSize: '14px' }}>
                  <span className={`badge ${detailData.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                    {detailData.jenis === 'benefit' ? 'Benefit' : 'Cost'}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nama Kriteria Lengkap:</span>
              <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-secondary)' }}>{detailData.nama_kriteria}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nilai Bobot:</span>
                <p style={{ fontWeight: '700', fontSize: '15px' }}>{detailData.bobot}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bobot Relatif:</span>
                <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-primary)' }}>
                  {totalBobot > 0 ? `${((parseFloat(detailData.bobot) / totalBobot) * 100).toFixed(1)}%` : '-'}
                </p>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Keterangan & Indikator:</span>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                {detailData.keterangan || 'Tidak ada catatan tambahan untuk kriteria ini.'}
              </p>
            </div>
          </div>
        )}
      </DetailModal>

      {/* MODAL POP-UP: KONFIRMASI HAPUS KRITERIA */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Kriteria"
        message={`Apakah Anda yakin ingin menghapus kriteria "${deleteTarget?.kode_kriteria} - ${deleteTarget?.nama_kriteria}"? Seluruh entri nilai penilaian yang berkaitan dengan kriteria ini juga akan terhapus.`}
        confirmText="Ya, Hapus Kriteria"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default KriteriaPage;
