import React from 'react';

interface BrandMarkProps {
  size?: number;
  variant?: 'default' | 'reversed' | 'seal';
  className?: string;
}

/**
 * Compact square icon mark derived from the CRAFT logo's signature "A" + leaf motif.
 * Used for sidebars, favicons, badges, and tight square spaces.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 40,
  variant = 'default',
  className = '',
}) => {
  const isReversed = variant === 'reversed';
  const isSeal = variant === 'seal';

  const bgFill = isSeal ? '#964824' : isReversed ? '#FAF7F2' : '#1B1A18';
  const letterFill = isSeal ? '#FAF7F2' : isReversed ? '#1B1A18' : '#FAF7F2';
  const leafFill = isSeal ? '#E9C176' : isReversed ? '#964824' : '#E9C176';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="36" height="36" rx="10" fill={bgFill} />
      {/* Editorial "A" without crossbar */}
      <path
        d="M20.2 8.5L29.2 29.8H31.8V31H24.2V29.8H26.4L19.4 13L12.6 29.8H14.8V31H9.2V29.8H11.2L19.8 8.5H20.2Z"
        fill={letterFill}
      />
      {/* Signature organic craft leaf inside "A" */}
      <path
        d="M15.4 27.2C16.2 22.6 19.6 19.6 24.4 19.7C23.6 24.3 20.2 27.3 15.4 27.2Z"
        fill={leafFill}
      />
    </svg>
  );
};

interface BrandLogoProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

/**
 * Full CRAFT wordmark logo ("CRAFT / TINH HOA NGHE VIET") in transparent crisp SVG.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'light',
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const height = size === 'sm' ? 34 : size === 'lg' ? 52 : 42;
  const viewBox = showTagline ? '0 0 368 106' : '0 0 368 78';
  const mainColor = theme === 'dark' ? '#FFFFFF' : '#1B1A18';
  const subColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#3D2B1F';

  return (
    <svg
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-auto select-none transition-opacity duration-200 group-hover:opacity-85 ${className}`}
      role="img"
      aria-label="CRAFT - Tinh hoa nghề Việt"
    >
      <g fill={mainColor}>
        {/* C */}
        <path d="M68.5 26.8C66.6 19.6 59.8 14.2 48.8 14.2C34 14.2 25.4 26.2 25.4 41.2C25.4 56.6 34.4 68.4 49.6 68.4C59.4 68.4 66.2 63.6 70.2 56.2L71.8 57C67.4 65.8 58.6 70.6 47.4 70.6C28.2 70.6 15.6 58 15.6 41.2C15.6 24.4 29 12 47.8 12C55.4 12 61.6 14 65.8 15.8L67.6 13H69.4L70.4 26.8H68.5Z" />

        {/* R with sweeping upturned tail */}
        <path d="M81 13H114.5C129 13 137.4 19.6 137.4 29.2C137.4 37.8 130.6 43.2 120.2 44.6C125.6 49.6 129.6 59.8 135 67.2C138.2 71.6 142.8 72.4 147.6 69.6L148.4 70.8C142.4 75.8 134.8 76.2 129.4 70.8C123.4 64.8 119.2 51.8 112.4 45.2H100V68H108.2V69.6H81V68H89.4V14.6H81V13ZM100 14.8V43.4H112.8C122.4 43.4 127.2 38.4 127.2 29.4C127.2 20.2 122 14.8 112.8 14.8H100Z" />

        {/* A (open interior, no crossbar) */}
        <path d="M180.6 12.2H182.2L209 68H216.6V69.6H192.6V68H198.6L179.4 25.4L160.2 68H167.2V69.6H147.4V68H155.4L180.6 12.2Z" />

        {/* Signature organic leaf inside A */}
        <path d="M167.2 59.4C169.4 47.6 178.4 40.4 190.4 40.8C188.2 52.6 179.2 59.8 167.2 59.4Z" />

        {/* F */}
        <path d="M220.4 13H269.6L270.8 26.2H269C267.4 19 262.8 14.8 253.6 14.8H239.4V40.6H250.4C255.8 40.6 258.4 38.6 259.4 33.8H261V49.2H259.4C258.4 44.2 255.8 42.4 250.4 42.4H239.4V68H248.2V69.6H220.4V68H229V14.8H220.4V13Z" />

        {/* T */}
        <path d="M276.6 13H350.6L351.8 26.4H350C348.2 18.8 343.6 14.8 334.4 14.8H318.8V68H328V69.6H299.2V68H308.4V14.8H292.8C283.6 14.8 279 18.8 277.2 26.4H275.4L276.6 13Z" />
      </g>

      {showTagline && (
        <text
          x="184"
          y="96"
          textAnchor="middle"
          fill={subColor}
          fontFamily="Manrope, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="12.5"
          fontWeight="500"
          letterSpacing="5.6"
        >
          TINH HOA NGHỀ VIỆT
        </text>
      )}
    </svg>
  );
};

export default BrandLogo;
