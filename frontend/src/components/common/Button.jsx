import React from 'react';

/**
 * Button Component - The Kinetic Pill
 * Variants: primary, secondary, tertiary, danger
 * Sizes: sm, md, lg
 * States: default, hover, active, disabled
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles = 'font-label-md font-semibold transition-smooth rounded-full inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-2 text-label-md',
    md: 'px-6 py-3 text-label-md',
    lg: 'px-8 py-4 text-label-lg',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold shadow-glow-primary hover:shadow-glow-primary hover:opacity-90 active:opacity-80',
    secondary: 'bg-surface-variant/60 backdrop-blur-lg border border-outline-variant/20 text-on-surface hover:bg-surface-container hover:border-outline-variant/40 active:bg-surface-container-high',
    tertiary: 'bg-tertiary/20 border border-tertiary/40 text-tertiary hover:bg-tertiary/30 active:bg-tertiary/40',
    danger: 'bg-error/20 border border-error/40 text-error hover:bg-error/30 active:bg-error/40',
    ghost: 'text-on-surface hover:bg-surface-container/50 active:bg-surface-container',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${width} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="material-symbols-outlined text-xl">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="material-symbols-outlined text-xl">{icon}</span>}
    </button>
  );
}

export default Button;
