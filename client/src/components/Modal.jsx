import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitText = 'Simpan Data',
  cancelText = 'Batal',
  isLoading = false,
  size = 'md'
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
      <div
        className={`modal-container ${size === 'lg' ? 'modal-container-lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {children}
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
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
