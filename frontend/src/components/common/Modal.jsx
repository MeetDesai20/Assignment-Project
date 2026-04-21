import React from 'react';

/**
 * Modal/Dialog Component
 * Glassmorphic overlay with smooth animations
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  className = '',
}) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-smooth"
      onClick={onClose}
    >
      <div
        className={`bg-surface-container rounded-3xl shadow-glow-primary ${sizeStyles[size]} w-full mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center p-6 md:p-8 border-b border-outline-variant/20">
            <h2 className="text-headline-md font-headline font-bold text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-smooth"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 md:p-8">{children}</div>

        {/* Footer/Actions */}
        {actions && (
          <div className="flex justify-end gap-3 p-6 md:p-8 border-t border-outline-variant/20">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
