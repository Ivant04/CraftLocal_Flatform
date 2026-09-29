import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện tại không có mục nào để hiển thị.',
  icon,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-soft-clay flex items-center justify-center mb-6">
      {icon || <PackageOpen size={36} className="text-outline" />}
    </div>
    <h3 className="text-xl font-semibold text-on-surface mb-2">{title}</h3>
    <p className="text-on-surface-variant max-w-md mb-6">{description}</p>
    {action}
  </div>
);

export default EmptyState;
