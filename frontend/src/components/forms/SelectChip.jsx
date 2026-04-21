import React from 'react';

/**
 * Select Chip Component
 * Use secondary-container for unselected, secondary for selected
 * Includes neon purple inner glow when selected
 */
export function SelectChip({
  label,
  selected = false,
  onClick,
  icon,
  className = '',
  ...props
}) {
  const baseStyles = 'px-4 py-2 rounded-full text-label-md font-semibold transition-smooth cursor-pointer inline-flex items-center gap-2 border';

  const selectedStyles = selected
    ? 'bg-secondary border-secondary/60 text-on-secondary shadow-inner-glow'
    : 'bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high';

  return (
    <button
      className={`${baseStyles} ${selectedStyles} ${className}`}
      onClick={onClick}
      type="button"
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      {label}
    </button>
  );
}

export default SelectChip;
