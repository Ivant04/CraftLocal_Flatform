import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, Upload, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../common/Button';

interface QRScannerProps {
  onScan: (value: string) => void;
  className?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, className = '' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isStoppingRef = useRef(false);

  // Initialize and list cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const list = devices.map((d) => ({ id: d.id, label: d.label || `Camera ${d.id}` }));
          setCameras(list);
          // Prefer back camera ("environment") if available
          const backCam = list.find((c) =>
            /back|rear|environment|sau/i.test(c.label)
          );
          setSelectedCameraId(backCam ? backCam.id : list[0].id);
        } else {
          setErrorMsg('Không tìm thấy thiết bị camera trên máy này.');
        }
      })
      .catch((err) => {
        console.warn('[QRScanner] Get cameras error:', err);
        setErrorMsg('Chưa cấp quyền camera. Vui lòng cho phép quyền truy cập camera trong trình duyệt.');
      });

    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async (cameraIdToUse?: string) => {
    try {
      setErrorMsg('');
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const camConfig = cameraIdToUse
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: 'environment' };

      await html5QrCodeRef.current.start(
        camConfig,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.75);
            return { width: edge, height: edge };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Play subtle beep / vibration
          try {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(120);
            }
          } catch {}

          onScan(decodedText);
        },
        () => {
          // Frame parse error - ignore
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('[QRScanner] Start camera error:', err);
      setIsScanning(false);
      setErrorMsg(
        err?.message?.includes('NotAllowedError') || err?.name === 'NotAllowedError'
          ? 'Trình duyệt bị từ chối quyền camera. Vui lòng nhấn biểu tượng ổ khóa cạnh thanh địa chỉ để cấp quyền camera.'
          : 'Không thể mở camera. Vui lòng thử chọn camera khác hoặc tải ảnh QR lên.'
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('[QRScanner] Stop error:', err);
      } finally {
        isStoppingRef.current = false;
        setIsScanning(false);
      }
    }
  };

  // Switch to next available camera
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCameraId(nextCamera.id);

    if (isScanning) {
      await stopScanner();
      await startScanner(nextCamera.id);
    }
  };

  // Scan from uploaded file / photo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      setErrorMsg('');

      let qrScanner = html5QrCodeRef.current;
      if (!qrScanner) {
        qrScanner = new Html5Qrcode('qr-reader-viewport', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrCodeRef.current = qrScanner;
      }

      if (qrScanner.isScanning) {
        await stopScanner();
      }

      const decodedText = await qrScanner.scanFile(file, true);
      if (decodedText) {
        onScan(decodedText);
      }
    } catch (err: any) {
      setErrorMsg('Không tìm thấy mã QR rõ nét trong bức ảnh này. Vui lòng thử lại với ảnh chụp góc thẳng hơn.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scanner Viewport */}
      <div className="relative bg-stone-900 rounded-3xl overflow-hidden shadow-xl aspect-square max-h-[360px] mx-auto border-4 border-white/20 flex flex-col items-center justify-center">
        {/* html5-qrcode target container */}
        <div id="qr-reader-viewport" className="w-full h-full object-cover" />

        {/* Laser Scanning Animation Overlay (When Active) */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Corner guide brackets */}
            <div className="w-[70%] h-[70%] border-2 border-dashed border-[#E9C176]/80 rounded-2xl relative shadow-[0_0_20px_rgba(233,193,118,0.2)]">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-[#E9C176]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-[#E9C176]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-[#E9C176]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-[#E9C176]" />
              {/* Animated laser line */}
              <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-[#E9C176] to-transparent animate-pulse top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-white/80 text-[11px] font-medium tracking-wide mt-3 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
              Giữ mã QR vào giữa khung hình
            </p>
          </div>
        )}

        {/* Camera Idle Overlay (Before Opening Camera) */}
        {!isScanning && (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-[#E9C176] flex items-center justify-center border border-white/15">
              <Camera size={32} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Camera quét vé QR</h4>
              <p className="text-stone-300 text-xs mt-1 max-w-xs leading-relaxed">
                Nhấn nút mở camera để quét trực tiếp vé của khách hoặc tải ảnh chụp mã QR từ thư viện máy.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => startScanner(selectedCameraId)}
              className="mt-1 shadow-lg cursor-pointer"
            >
              <Camera size={16} className="mr-1.5" /> Bật Camera quét ngay
            </Button>
          </div>
        )}
      </div>

      {/* Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {isScanning ? (
          <Button
            variant="outline"
            size="sm"
            onClick={stopScanner}
            className="text-xs font-semibold"
          >
            <CameraOff size={14} className="mr-1 text-rose-500" /> Tắt Camera
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => startScanner(selectedCameraId)}
            className="text-xs font-semibold"
          >
            <Camera size={14} className="mr-1" /> Mở Camera
          </Button>
        )}

        {cameras.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitchCamera}
            className="text-xs font-semibold text-stone-700 bg-white/80 hover:bg-white border border-stone-200"
            title="Đổi camera trước / sau"
          >
            <RefreshCw size={14} className="mr-1 text-[#964824]" /> Đổi Camera ({cameras.length})
          </Button>
        )}

        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          variant="ghost"
          size="sm"
          disabled={isProcessingFile}
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-stone-700 bg-white/80 hover:bg-white border border-stone-200 cursor-pointer"
        >
          <Upload size={14} className="mr-1 text-amber-600" />
          <span>{isProcessingFile ? 'Đang đọc ảnh...' : 'Tải ảnh QR lên'}</span>
        </Button>
      </div>

      {/* Error / Guide Message */}
      {errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
