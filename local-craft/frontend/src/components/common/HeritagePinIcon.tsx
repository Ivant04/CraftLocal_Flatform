import React from 'react';

interface HeritagePinIconProps {
  className?: string;
}

/**
 * Modern Heritage location pin icon combining an architectural map pin contour
 * with a traditional Vietnamese craft-seal diamond core.
 */
const HeritagePinIcon: React.FC<HeritagePinIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    {/* Subtle seal horizon arc */}
    <path
      d="M10.5 27.2C12.15 27.95 14 28.35 16 28.35C18 28.35 19.85 27.95 21.5 27.2"
      stroke="#3D2B1F"
      strokeWidth="1.4"
      strokeOpacity="0.65"
      strokeLinecap="round"
    />
    {/* Architectural pin body */}
    <path
      d="M16 4.5C11.3056 4.5 7.5 8.21 7.5 12.79C7.5 18.67 16 26.2 16 26.2C16 26.2 24.5 18.67 24.5 12.79C24.5 8.21 20.6944 4.5 16 4.5Z"
      fill="#964824"
      fillOpacity="0.14"
      stroke="#964824"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Traditional lacquer/seal diamond emblem */}
    <path
      d="M16 8.8L19.7 12.5L16 16.2L12.3 12.5L16 8.8Z"
      fill="#D4A373"
      fillOpacity="0.4"
      stroke="#3D2B1F"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* Pin focal point */}
    <circle cx="16" cy="12.5" r="1.15" fill="#964824" />
  </svg>
);

export default HeritagePinIcon;

