import React, { useEffect } from 'react';

const DetailModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg'
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
            aria-label="Tutup Rincian"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
