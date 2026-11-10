import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 pb-6 border-b border-[#EAD8CC]/60 ${className}`}>
      <div>
        {badge && (
          <span className="inline-block px-3 py-1 bg-[#964824]/10 text-[#964824] rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            {badge}
          </span>
        )}
        <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-[#3D2B1F] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#7A6255] text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
};

export default PageHeader;
