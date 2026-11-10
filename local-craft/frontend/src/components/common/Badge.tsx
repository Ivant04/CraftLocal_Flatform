import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[#964824]/10 text-[#964824] border-[#964824]/20',
  secondary: 'bg-[#3D2B1F]/10 text-[#3D2B1F] border-[#3D2B1F]/20',
  accent: 'bg-[#E9C176]/20 text-[#8B6508] border-[#E9C176]/40',
  success: 'bg-[#384B3F]/12 text-[#2D5A43] border-[#384B3F]/25',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-[#F4EFEB] text-[#5A4A41] border-[#EAD8CC]',
  outline: 'bg-transparent text-[#7A6255] border-[#EAD8CC]',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
  sm: 'px-2.5 py-1 text-xs font-semibold',
  md: 'px-3 py-1.5 text-sm font-semibold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

