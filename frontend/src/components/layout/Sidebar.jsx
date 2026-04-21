import React from 'react';

/**
 * Sidebar Navigation Component
 * Glassmorphic with smooth transitions
 */
export function Sidebar({
  items = [],
  activeItem,
  onSelect,
  collapsed = false,
  className = '',
}) {
  return (
    <nav
      className={`bg-surface-container-low border-r border-outline-variant/20 transition-smooth ${
        collapsed ? 'w-20' : 'w-64'
      } h-screen sticky top-0 overflow-y-auto ${className}`}
    >
      <div className="p-4 md:p-6 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth text-left ${
              activeItem === item.id
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-on-surface hover:bg-surface-container/50'
            }`}
          >
            {item.icon && (
              <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
            )}
            {!collapsed && <span className="text-label-md font-semibold">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Sidebar;
