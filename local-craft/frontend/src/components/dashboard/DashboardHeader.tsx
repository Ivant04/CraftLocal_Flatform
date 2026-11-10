import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const DashboardHeader: React.FC<{ title: string }> = ({ title }) => {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-headline-lg text-headline-md text-deep-earth">{title}</h1>
        {user && <p className="text-on-surface-variant mt-1">Chào mừng trở lại, {user.fullName}</p>}
      </div>
    </div>
  );
};

export default DashboardHeader;
