import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

interface QRScannerProps {
  onScan: (value: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [manualCode, setManualCode] = useState('');

  return (
    <div className="space-y-6">
      {/* Camera placeholder */}
      <div className="bg-charcoal-ink rounded-2xl aspect-square max-h-[300px] flex items-center justify-center relative overflow-hidden">
        <div className="text-center text-white/80">
          <QrCode size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Camera Scanner</p>
          <p className="text-xs opacity-50 mt-1">Point camera at QR code</p>
        </div>
        <div className="absolute inset-8 border-2 border-primary/50 rounded-xl" />
      </div>

      {/* Manual input */}
      <div className="flex gap-3">
        <Input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Enter code manually"
        />
        <Button onClick={() => { if (manualCode) onScan(manualCode); }} className="shrink-0">
          Scan
        </Button>
      </div>
    </div>
  );
};

export default QRScanner;
