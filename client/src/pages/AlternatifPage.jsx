import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from '../components/Modal';
import DetailModal from '../components/DetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

const AlternatifPage = () => {
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    nip: '',
    nama_guru: '',
    jenis_kelamin: 'L',
    pendidikan_terakhir: 'S1 PGSD',
    jabatan: '',
    masa_kerja: 5,
    bidang_studi: 'Guru Kelas SD',
    email: '',
    telepon: '',
    alamat: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Detail Profil Guru
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGuru, setDetailGuru] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isAdmin } = useAuth();

  const fetchGuru = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alternatif');
      if (res.data.success) {
        setGuruList(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Gagal memuat data guru: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuru();
  }, []);

  const resetForm = () => {
    setFormData({
      nip: '',
      nama_guru: '',
      jenis_kelamin: 'L',
      pendidikan_terakhir: 'S1 PGSD',
      jabatan: '',
      masa_kerja: 5,
      bidang_studi: 'Guru Kelas SD',
      email: '',
      telepon: '',
      alamat: ''
    });
    setFormError('');
    setSelectedId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    resetForm();
    setSelectedId(item.id);
    setFormData({
      nip: item.nip,
      nama_guru: item.nama_guru,
      jenis_kelamin: item.jenis_kelamin,
      pendidikan_terakhir: item.pendidikan_terakhir,
      jabatan: item.jabatan,
      masa_kerja: item.masa_kerja,
      bidang_studi: item.bidang_studi,
      email: item.email || '',
      telepon: item.telepon || '',
      alamat: item.alamat || ''
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = async (id) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/alternatif/${id}`);
      if (res.data.success) {
        setDetailGuru(res.data.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Gagal memuat detail profil guru.' });
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDeleteModal = (item) => {
    setDeleteTarget(item);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nip.trim() || !formData.nama_guru.trim() || !formData.jabatan.trim()) {
      setFormError('NIP, Nama Lengkap Guru, dan Jabatan wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'add') {
        const res = await api.post('/alternatif', formData);
        if (res.data.success) {
          setAlert({ type: 'success', message: res.data.message });
          setIsModalOpen(false);
          fetchGuru();
        }
      } else {
        const res = await api.put(`/alternatif/${selectedId}`, formData);
        if (res.data.success) {
          setAlert({ type: 'success', message: res.data.message });
          setIsModalOpen(false);
          fetchGuru();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data guru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/alternatif/${deleteTarget.id}`);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setIsDeleteOpen(false);
        fetchGuru();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Gagal menghapus data guru.' });
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Manajemen Data Guru (Alternatif SPK)</h2>
            <p className="card-desc">
              Daftar tenaga pendidik Sekolah Dasar yang dievaluasi dalam proses pemilihan guru berprestasi
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
            >
              Tambah Data Guru Baru
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
                <th style={{ width: '50px' }}>No</th>
                <th style={{ width: '160px' }}>NIP</th>
                <th>Nama Lengkap Guru</th>
                <th style={{ width: '80px', textAlign: 'center' }}>L/P</th>
                <th>Pendidikan</th>
                <th>Jabatan / Tugas</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Masa Kerja</th>
                <th>Bidang Studi</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Aksi Baris</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                    Memuat data guru...
                  </td>
                </tr>
              ) : guruList.length > 0 ? (
                guruList.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.nip}</td>
                    <td style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>
                      {item.nama_guru}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ backgroundColor: item.jenis_kelamin === 'L' ? '#EFF6FF' : '#FDF2F8', color: item.jenis_kelamin === 'L' ? '#1E40AF' : '#9D174D' }}>
                        {item.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td>{item.pendidikan_terakhir}</td>
                    <td>{item.jabatan}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.masa_kerja} thn</td>
                    <td>{item.bidang_studi}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-detail"
                          onClick={() => handleOpenDetailModal(item.id)}
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
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    Belum ada data guru yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POP-UP: TAMBAH / EDIT GURU */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Data Guru Baru' : `Edit Data Guru: ${formData.nama_guru}`}
        subtitle="Form isian data pendidik Sekolah Dasar"
        onSubmit={handleFormSubmit}
        submitText={modalMode === 'add' ? 'Simpan Data Guru' : 'Perbarui Data Guru'}
        isLoading={isSubmitting}
        size="lg"
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
            {formError}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label-required">Nomor Induk Pegawai (NIP)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 198503142010011005"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Nama Lengkap & Gelar</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Budi Santoso, S.Pd."
              value={formData.nama_guru}
              onChange={(e) => setFormData({ ...formData, nama_guru: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label-required">Jenis Kelamin</label>
            <select
              className="form-select"
              value={formData.jenis_kelamin}
              onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
            >
              <option value="L">Laki-Laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Pendidikan Terakhir</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: S1 PGSD atau S2 Pendidikan Dasar"
              value={formData.pendidikan_terakhir}
              onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label-required">Jabatan / Tugas Mengajar</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Guru Kelas IV (Wali Kelas)"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Masa Kerja (Tahun)</label>
            <input
              type="number"
              min="0"
              max="50"
              className="form-input"
              placeholder="Contoh: 8"
              value={formData.masa_kerja}
              onChange={(e) => setFormData({ ...formData, masa_kerja: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label-required">Bidang Studi / Mata Pelajaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Guru Kelas SD, PJOK, atau PAI"
              value={formData.bidang_studi}
              onChange={(e) => setFormData({ ...formData, bidang_studi: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Telepon / WhatsApp</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 081234567890"
              value={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Instansi</label>
          <input
            type="email"
            className="form-input"
            placeholder="Contoh: guru@sd.sch.id"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Alamat Domisili</label>
          <textarea
            className="form-textarea"
            rows="2"
            placeholder="Alamat tempat tinggal guru..."
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          />
        </div>
      </Modal>

      {/* MODAL POP-UP: DETAIL LENGKAP PROFIL GURU & NILAI KRITERIA */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailGuru ? `Detail Profil Guru: ${detailGuru.nama_guru}` : 'Memuat Detail...'}
        subtitle={`NIP: ${detailGuru?.nip || '-'} &bull; Jabatan: ${detailGuru?.jabatan || '-'}`}
        size="lg"
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
            Memuat profil dan rekam jejak nilai guru...
          </div>
        ) : detailGuru ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px', padding: '14px', backgroundColor: 'var(--color-bg-muted)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nama Lengkap:</span>
                <p style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>{detailGuru.nama_guru}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>NIP:</span>
                <p style={{ fontWeight: '600', fontFamily: 'monospace' }}>{detailGuru.nip}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pendidikan Terakhir:</span>
                <p style={{ fontWeight: '600' }}>{detailGuru.pendidikan_terakhir}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Masa Pengabdian:</span>
                <p style={{ fontWeight: '600' }}>{detailGuru.masa_kerja} Tahun</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bidang Penugasan:</span>
                <p style={{ fontWeight: '600' }}>{detailGuru.bidang_studi}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Kontak Telepon:</span>
                <p style={{ fontWeight: '600' }}>{detailGuru.telepon || '-'}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-secondary)', marginBottom: '10px' }}>
              Rekam Jejak Nilai Kriteria Evaluasi
            </h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Kode</th>
                    <th>Nama Kriteria</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Sifat</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Bobot (W)</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Nilai Diperoleh</th>
                  </tr>
                </thead>
                <tbody>
                  {detailGuru.daftar_penilaian && detailGuru.daftar_penilaian.length > 0 ? (
                    detailGuru.daftar_penilaian.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{p.kode_kriteria}</td>
                        <td style={{ fontWeight: '600' }}>{p.nama_kriteria}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${p.jenis === 'benefit' ? 'badge-benefit' : 'badge-cost'}`}>
                            {p.jenis}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{p.bobot}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '14px', color: 'var(--color-secondary)' }}>
                          {p.nilai}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                        Belum ada data nilai kriteria untuk guru ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </DetailModal>

      {/* MODAL POP-UP: KONFIRMASI HAPUS GURU */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Data Guru"
        message={`Apakah Anda yakin ingin menghapus data pendidik "${deleteTarget?.nama_guru}" (NIP: ${deleteTarget?.nip})? Seluruh nilai evaluasi dan rekam jejak perhitungannya akan dihapus dari sistem.`}
        confirmText="Ya, Hapus Guru"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AlternatifPage;
