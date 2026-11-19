import React, { useEffect } from 'react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Ya, Hapus Data',
  cancelText = 'Batal',
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--color-text-main)', fontSize: '13px' }}>{message}</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-danger-solid"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
