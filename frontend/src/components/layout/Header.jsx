import React from 'react';

/**
 * Navigation Header Component
 * Glassmorphic navigation with logo and user menu
 */
export function Header({
  logo,
  title,
  actions,
  sticky = true,
  className = '',
}) {
  return (
    <header
      className={`${
        sticky ? 'sticky top-0 z-40' : ''
      } bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="Logo" className="h-8 w-8" />}
          {title && <h1 className="text-headline-md font-headline font-bold text-on-surface">{title}</h1>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">{actions}</div>
      </div>
    </header>
  );
}

export default Header;
