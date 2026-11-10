import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  value: string;
  size?: number;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ value, size = 200 }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <QRCodeSVG value={value} size={size} level="H" />
    </div>
    <p className="text-xs text-on-surface-variant font-mono">{value}</p>
  </div>
);

export default QRDisplay;
