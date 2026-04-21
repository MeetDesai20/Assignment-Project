import React from 'react';

/**
 * Input Component - Minimalist Precision
 * Styles: underline or floating glass
 * Supports labels, error states, and icons
 */
export function Input({
  type = 'text',
  label,
  error,
  icon,
  placeholder,
  fullWidth = false,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const baseStyles = 'bg-transparent border-b-2 border-outline-variant/40 text-on-surface placeholder-on-surface-variant/60 focus:outline-none transition-smooth focus:border-primary';
  const sizeStyles = 'px-0 py-3 text-body-md';
  const width = fullWidth ? 'w-full' : '';
  const errorStyles = error ? 'border-error focus:border-error' : '';

  return (
    <div className={`relative ${width}`}>
      {label && (
        <label
          className={`absolute text-label-sm font-semibold transition-smooth pointer-events-none ${
            isFocused || props.value || placeholder
              ? 'top-0 text-primary text-label-sm'
              : 'top-3 text-on-surface-variant'
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && <span className="absolute left-0 text-on-surface-variant material-symbols-outlined">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          className={`${baseStyles} ${sizeStyles} ${width} ${errorStyles} ${icon ? 'pl-10' : ''} ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>

      {error && <p className="text-error text-label-sm mt-2">{error}</p>}
    </div>
  );
}

export default Input;
