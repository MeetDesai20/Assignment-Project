import React from 'react';

/**
 * Card Component - The Content Vessel
 * No dividers - uses spacing and surface tiers for hierarchy
 * Features glassmorphic hover state and ambient glow
 */
export function Card({
  children,
  className = '',
  interactive = false,
  glow = false,
  hover = true,
  ...props
}) {
  const baseStyles = 'bg-surface-container-low transition-smooth rounded-2xl p-6 md:p-8';
  const interactiveStyles = interactive && hover ? 'cursor-pointer hover:bg-surface-container hover:shadow-glow-primary' : '';
  const glowStyles = glow ? 'shadow-glow-primary' : '';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
