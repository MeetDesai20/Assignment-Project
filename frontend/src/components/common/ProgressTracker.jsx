import React from 'react';

/**
 * Progress Tracker Component
 * Emerald for charity/success, Blue for system performance
 * Rounded full caps with 20% opacity background
 */
export function ProgressTracker({
  label,
  value = 0,
  max = 100,
  displayValue,
  displayMax,
  type = 'tertiary', // tertiary for charity, primary for system
  showLabel = true,
  animated = true,
  className = '',
  ...props
}) {
  const percentage = (value / max) * 100;

  const colorMap = {
    tertiary: {
      track: 'bg-tertiary/20',
      fill: 'bg-tertiary',
      label: 'text-tertiary',
    },
    primary: {
      track: 'bg-primary/20',
      fill: 'bg-primary',
      label: 'text-primary',
    },
    secondary: {
      track: 'bg-secondary/20',
      fill: 'bg-secondary',
      label: 'text-secondary',
    },
  };

  const colors = colorMap[type];

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <p className="text-label-md font-semibold text-on-surface">{label}</p>
          <p className={`text-label-md font-semibold ${colors.label}`}>
            {displayValue ?? value}/{displayMax ?? max}
          </p>
        </div>
      )}

      <div className={`w-full h-2 rounded-full ${colors.track} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colors.fill} ${animated ? 'transition-smooth' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressTracker;
