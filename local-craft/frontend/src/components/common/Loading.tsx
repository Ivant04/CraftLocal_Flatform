import React from 'react';

const Loading: React.FC<{ text?: string; fullScreen?: boolean }> = ({ text = 'Đang tải...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-soft-clay border-t-primary animate-spin" />
      </div>
      <p className="text-on-surface-variant font-medium">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-20">{content}</div>;
};

export default Loading;
