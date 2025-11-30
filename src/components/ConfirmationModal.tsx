import React, { useEffect, useRef } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button when modal opens for safety
      confirmButtonRef.current?.focus();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'rgba(220, 53, 69, 0.15)',
      iconColor: '#dc3545',
      confirmBg: 'rgba(220, 53, 69, 0.9)',
      confirmHoverBg: 'rgba(200, 35, 51, 0.95)',
      icon: '🗑️',
    },
    warning: {
      iconBg: 'rgba(255, 193, 7, 0.15)',
      iconColor: '#ffc107',
      confirmBg: 'rgba(255, 193, 7, 0.9)',
      confirmHoverBg: 'rgba(224, 168, 0, 0.95)',
      icon: '⚠️',
    },
    info: {
      iconBg: 'rgba(0, 123, 255, 0.15)',
      iconColor: '#007bff',
      confirmBg: 'rgba(0, 123, 255, 0.9)',
      confirmHoverBg: 'rgba(0, 86, 179, 0.95)',
      icon: 'ℹ️',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-icon" style={{ backgroundColor: style.iconBg }}>
          <span style={{ fontSize: '32px' }}>{style.icon}</span>
        </div>
        
        <h2 id="modal-title" className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        
        <div className="modal-actions">
          <button
            className="modal-button modal-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            className="modal-button modal-button-confirm"
            onClick={onConfirm}
            style={{
              backgroundColor: style.confirmBg,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
