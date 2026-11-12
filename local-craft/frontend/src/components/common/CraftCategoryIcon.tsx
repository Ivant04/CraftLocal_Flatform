import React from 'react';

interface CraftCategoryIconProps {
  slug?: string;
  name?: string;
  className?: string;
}

type CraftKey =
  | 'pottery'
  | 'stone'
  | 'lantern'
  | 'cuisine'
  | 'coffee'
  | 'bamboo'
  | 'textile'
  | 'lacquer';

function resolveCraftKey(slug = '', name = ''): CraftKey {
  const key = `${slug} ${name}`.toLowerCase();
  if (key.includes('gom') || key.includes('gốm')) return 'pottery';
  if (key.includes('da') || key.includes('đá') || key.includes('khac')) return 'stone';
  if (key.includes('den') || key.includes('đèn') || key.includes('long')) return 'lantern';
  if (key.includes('am-thuc') || key.includes('ẩm thực')) return 'cuisine';
  if (key.includes('ca-phe') || key.includes('cà phê') || key.includes('thao-moc')) return 'coffee';
  if (key.includes('may-tre') || key.includes('mây') || key.includes('tre')) return 'bamboo';
  if (key.includes('det') || key.includes('dệt') || key.includes('tho-cam')) return 'textile';
  if (key.includes('son-mai') || key.includes('sơn mài') || key.includes('tranh')) return 'lacquer';
  return 'pottery';
}

/**
 * Modern Heritage duotone geometric vector emblems for craft categories.
 * Uniform 32x32 viewBox, 1.65px strokes, rounded joins, CraftLocal terracotta & earth palette.
 */
const CraftCategoryIcon: React.FC<CraftCategoryIconProps> = ({
  slug = '',
  name = '',
  className = 'w-8 h-8',
}) => {
  const craft = resolveCraftKey(slug, name);

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {craft === 'pottery' && (
        <>
          <path
            d="M11.5 6.5H20.5L19.2 10.2C22.2 12.1 23.8 15.2 23.2 19.1C22.6 22.8 19.9 25 16 25C12.1 25 9.4 22.8 8.8 19.1C8.2 15.2 9.8 12.1 12.8 10.2L11.5 6.5Z"
            fill="#964824"
            fillOpacity="0.14"
            stroke="#964824"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M11.2 16.5H20.8" stroke="#3D2B1F" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M16 18.2L17.6 19.8L16 21.4L14.4 19.8L16 18.2Z" fill="#D4A373" />
          <ellipse cx="16" cy="26.8" rx="7.5" ry="1.6" stroke="#3D2B1F" strokeWidth="1.4" />
        </>
      )}

      {craft === 'stone' && (
        <>
          <path
            d="M9.5 25.5L6.5 16.5L13 7.5L21 9.5L25.5 18L22.5 25.5H9.5Z"
            fill="#3D2B1F"
            fillOpacity="0.1"
            stroke="#3D2B1F"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M13 7.5L15.5 16L22.5 25.5M6.5 16.5L15.5 16L21 9.5"
            stroke="#964824"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M21 5.5L25.5 10" stroke="#964824" strokeWidth="1.65" strokeLinecap="round" />
        </>
      )}

      {craft === 'lantern' && (
        <>
          <line x1="16" y1="3.5" x2="16" y2="6.5" stroke="#3D2B1F" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="12.5" y="6.5" width="7" height="2" rx="1" fill="#3D2B1F" />
          <ellipse
            cx="16"
            cy="15.5"
            rx="8.2"
            ry="7"
            fill="#964824"
            fillOpacity="0.16"
            stroke="#964824"
            strokeWidth="1.65"
          />
          <ellipse cx="16" cy="15.5" rx="4" ry="7" stroke="#964824" strokeWidth="1.35" />
          <path d="M16 13.3L17.8 15.5L16 17.7L14.2 15.5L16 13.3Z" fill="#D4A373" />
          <rect x="12.5" y="22.5" width="7" height="2" rx="1" fill="#3D2B1F" />
          <path d="M14.2 24.5V28M16 24.5V29M17.8 24.5V28" stroke="#964824" strokeWidth="1.45" strokeLinecap="round" />
        </>
      )}

      {craft === 'cuisine' && (
        <>
          <path
            d="M6.5 16.5H25.5C25.5 21.8 21.4 25.5 16 25.5C10.6 25.5 6.5 21.8 6.5 16.5Z"
            fill="#964824"
            fillOpacity="0.14"
            stroke="#964824"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path d="M12.5 26.8H19.5" stroke="#3D2B1F" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9 19.5C11 18.6 13 20.4 16 19.5C19 18.6 21 20.4 23 19.5" stroke="#3D2B1F" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M19.5 6.5L14.5 14M24 7.5L17.5 14" stroke="#3D2B1F" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10.5 12.5C9.7 11 11.3 9.5 10.5 8" stroke="#D4A373" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {craft === 'coffee' && (
        <>
          {/* Vietnamese Phin Coffee Brewer & Leaf */}
          <path d="M9.5 8.5H20.5" stroke="#3D2B1F" strokeWidth="1.65" strokeLinecap="round" />
          <path d="M14 6.5H16" stroke="#3D2B1F" strokeWidth="1.7" strokeLinecap="round" />
          <rect
            x="10.5"
            y="8.5"
            width="9"
            height="6.5"
            rx="1"
            fill="#3D2B1F"
            fillOpacity="0.12"
            stroke="#3D2B1F"
            strokeWidth="1.55"
          />
          <path d="M8.5 15H21.5" stroke="#964824" strokeWidth="1.65" strokeLinecap="round" />
          <path
            d="M10 15L11.2 24.5C11.3 25.3 12 26 12.9 26H17.1C18 26 18.7 25.3 18.8 24.5L20 15"
            fill="#964824"
            fillOpacity="0.15"
            stroke="#964824"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M22.5 12C25.5 11.5 26.8 14 25.5 16.5C24.2 18.8 21.8 18.5 21.2 16.8C20.6 15.1 21 12.5 22.5 12Z"
            fill="#384B3F"
            fillOpacity="0.2"
            stroke="#384B3F"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
        </>
      )}

      {craft === 'bamboo' && (
        <>
          {/* Woven Bamboo Lattice & Artisan Basket Rim */}
          <path
            d="M8.5 11.5H23.5L21.5 24.5C21.3 25.4 20.5 26 19.6 26H12.4C11.5 26 10.7 25.4 10.5 24.5L8.5 11.5Z"
            fill="#964824"
            fillOpacity="0.12"
            stroke="#964824"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path d="M7.5 11.5H24.5" stroke="#3D2B1F" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M12.5 11.5L18.5 26M19.5 11.5L13.5 26M9.8 18.5H22.2" stroke="#964824" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M16 11C16 7.8 18.8 5.8 22 6C21.6 9 19.2 11 16 11Z"
            fill="#384B3F"
            fillOpacity="0.2"
            stroke="#384B3F"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
        </>
      )}

      {craft === 'textile' && (
        <>
          {/* Brocade Diamond Loom Pattern (Tho Cam) */}
          <rect
            x="6.5"
            y="6.5"
            width="19"
            height="19"
            rx="4"
            fill="#964824"
            fillOpacity="0.1"
            stroke="#3D2B1F"
            strokeWidth="1.6"
          />
          <path
            d="M16 9.5L22.5 16L16 22.5L9.5 16L16 9.5Z"
            fill="#964824"
            fillOpacity="0.18"
            stroke="#964824"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 13L19 16L16 19L13 16L16 13Z" fill="#D4A373" />
          <path d="M6.5 16H9.5M22.5 16H25.5M16 6.5V9.5M16 22.5V25.5" stroke="#3D2B1F" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}

      {craft === 'lacquer' && (
        <>
          {/* Vietnamese Lacquer Art Frame & Gold Sun */}
          <rect
            x="6"
            y="7.5"
            width="20"
            height="17"
            rx="3.5"
            fill="#3D2B1F"
            fillOpacity="0.1"
            stroke="#3D2B1F"
            strokeWidth="1.65"
          />
          <circle cx="20.5" cy="12.5" r="2.2" fill="#D4A373" stroke="#964824" strokeWidth="1.3" />
          <path
            d="M6.5 21.5L12.5 15.5L17.5 20L21 17L25.5 21.5"
            fill="#964824"
            fillOpacity="0.2"
            stroke="#964824"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9.5 24.5L11.5 27.5M22.5 24.5L20.5 27.5" stroke="#3D2B1F" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export default CraftCategoryIcon;

