import React from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={`bg-white rounded-2xl border border-[#EAD8CC] shadow-[0_4px_24px_rgba(61,43,31,0.04)] p-6 md:p-8 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-[#EAD8CC]/40">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-[#964824]/10 text-[#964824] flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#3D2B1F]">{title}</h2>
              {description && <p className="text-xs md:text-sm text-[#7A6255] mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
