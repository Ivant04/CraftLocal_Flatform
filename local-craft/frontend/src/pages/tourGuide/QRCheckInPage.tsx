import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, QrCode } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import QRScanner from "../../components/qr/QRScanner";
import tourGuideApi from "../../api/tourGuideApi";

type ScanResult = "idle" | "valid" | "used" | "invalid";

function extractToken(raw: string): string {
  const trimmed = raw.trim();
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      const token = url.searchParams.get("token");
      if (token) return token.trim();
    }
  } catch {
    // not a valid URL, continue with fallback
  }

  // Check if string contains token=...
  const match = trimmed.match(/[?&]token=([^&]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]).trim();
  }

  return trimmed;
}

const QRCheckInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult>("idle");
  const [message, setMessage] = useState("");
  const [checkedData, setCheckedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>("");

  const executeCheckIn = useCallback(async (rawToken: string) => {
    const token = extractToken(rawToken);
    if (!token) return;

    try {
      setLoading(true);
      setMessage("");
      setLastScanned(token);
      setManualCode(token);

      const res = await tourGuideApi.checkIn(token);
      setResult("valid");
      setCheckedData(res.data?.data || null);
      setMessage(res.data?.message || "Khách đã được check-in thành công.");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Mã QR không hợp lệ.";
      setMessage(errMsg);
      setCheckedData(null);
      if (
        errMsg.toLowerCase().includes("sử dụng") ||
        errMsg.toLowerCase().includes("check-in") ||
        errMsg.toLowerCase().includes("trước đó")
      ) {
        setResult("used");
      } else {
        setResult("invalid");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle URL token param (e.g. redirected from phone camera)
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      executeCheckIn(tokenFromUrl);
    }
  }, [searchParams, executeCheckIn]);

  const handleScannerScan = (decodedText: string) => {
    const token = extractToken(decodedText);
    if (token && token !== lastScanned) {
      executeCheckIn(token);
    }
  };

  const handleReset = () => {
    setResult("idle");
    setMessage("");
    setCheckedData(null);
    setManualCode("");
    setLastScanned("");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto px-4 py-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5">
          <QrCode size={14} /> Điểm danh & Soát vé
        </span>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-deep-earth">
          Quét QR Check-in Khách Hàng
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto">
          Dùng camera quét mã vé điện tử của khách hoặc nhập mã định danh để xác nhận vào xưởng.
        </p>
      </div>

      {/* Real Live Camera Scanner */}
      <QRScanner
        onScan={handleScannerScan}
        onError={(err) => console.warn("[QRCheckInPage] Scan notice:", err)}
      />

      {/* Manual Input Code Fallback */}
      <div className="bg-white rounded-2xl border border-outline-subtle p-5 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Hoặc nhập mã vé thủ công:
        </label>
        <div className="flex gap-2">
          <Input
            value={manualCode}
            onChange={(e) => {
              setManualCode(e.target.value);
              if (result !== "idle") setResult("idle");
            }}
            placeholder="Dán URL vé hoặc nhập QR-xxxxxxxx..."
            className="flex-1 font-mono text-sm"
          />
          <Button
            onClick={() => executeCheckIn(manualCode)}
            disabled={loading || !manualCode.trim()}
            className="shrink-0"
          >
            {loading ? "Đang soát..." : "Check-in"}
          </Button>
        </div>
      </div>

      {/* Check-in Result Notification Card */}
      {result !== "idle" && (
        <div
          className={`p-6 rounded-2xl text-center border transition-all animate-fadeIn ${
            result === "valid"
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm"
              : result === "used"
              ? "bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm"
              : "bg-red-50/80 border-red-300 text-red-950 shadow-sm"
          }`}
        >
          {result === "valid" && (
            <>
              <CheckCircle size={52} className="mx-auto mb-3 text-emerald-600 animate-bounce" />
              <p className="font-bold text-xl text-emerald-800">Check-in thành công!</p>
              <p className="text-emerald-700 text-sm mt-1">{message}</p>
              {checkedData && (
                <div className="mt-4 p-3 rounded-xl bg-white/80 border border-emerald-200 text-xs text-stone-700 text-left font-mono">
                  {checkedData.touristName && (
                    <p><strong>Khách hàng:</strong> {checkedData.touristName}</p>
                  )}
                  {checkedData.workshopTitle && (
                    <p><strong>Workshop:</strong> {checkedData.workshopTitle}</p>
                  )}
                  {checkedData.timeslot && (
                    <p><strong>Khung giờ:</strong> {checkedData.timeslot}</p>
                  )}
                  {checkedData.bookingCode && (
                    <p><strong>Mã đặt chỗ:</strong> {checkedData.bookingCode}</p>
                  )}
                </div>
              )}
            </>
          )}

          {result === "used" && (
            <>
              <AlertTriangle size={52} className="mx-auto mb-3 text-amber-600" />
              <p className="font-bold text-xl text-amber-800">Vé đã được sử dụng!</p>
              <p className="text-amber-700 text-sm mt-1">{message}</p>
            </>
          )}

          {result === "invalid" && (
            <>
              <XCircle size={52} className="mx-auto mb-3 text-red-600" />
              <p className="font-bold text-xl text-red-800">Vé không hợp lệ!</p>
              <p className="text-red-700 text-sm mt-1">{message}</p>
            </>
          )}

          <div className="mt-5 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 bg-white shadow-2xs"
            >
              <RefreshCw size={14} /> Quét vé tiếp theo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCheckInPage;
