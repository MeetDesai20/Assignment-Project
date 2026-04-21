import React from 'react';

/**
 * Badge Component
 * Status indicators with color variants
 */
export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-label-md font-semibold';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-label-sm',
    md: 'px-3 py-1.5 text-label-md',
    lg: 'px-4 py-2 text-label-lg',
  };

  const variantStyles = {
    primary: 'bg-primary/20 text-primary border border-primary/30',
    secondary: 'bg-secondary/20 text-secondary border border-secondary/30',
    tertiary: 'bg-tertiary/20 text-tertiary border border-tertiary/30',
    error: 'bg-error/20 text-error border border-error/30',
    success: 'bg-tertiary-fixed/20 text-tertiary-fixed border border-tertiary-fixed/30',
  };

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      {label}
    </div>
  );
}

export default Badge;
