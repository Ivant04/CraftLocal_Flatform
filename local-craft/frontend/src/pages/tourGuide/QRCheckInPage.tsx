import React, { useState } from "react";
import { QrCode, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

type ScanResult = "idle" | "valid" | "used" | "invalid";

const QRCheckInPage: React.FC = () => {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult>("idle");

  const handleCheckIn = () => {
    if (!manualCode) return;
    if (manualCode.startsWith("BK-001")) setResult("valid");
    else if (manualCode.startsWith("BK-002")) setResult("used");
    else setResult("invalid");
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="font-headline-lg text-headline-md text-deep-earth text-center">
        Check-in bằng QR
      </h1>
      <div className="bg-charcoal-ink rounded-2xl aspect-square max-h-[350px] flex items-center justify-center relative overflow-hidden">
        <div className="text-center text-white/80">
          <QrCode size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">Camera quét mã</p>
          <p className="text-xs opacity-50 mt-1">Hướng camera vào mã QR</p>
        </div>
        <div className="absolute inset-8 border-2 border-primary/50 rounded-xl" />
      </div>
      <div className="bg-white rounded-xl border border-soft-clay p-5">
        <p className="text-sm font-medium text-on-surface mb-3">
          Hoặc nhập mã thủ công:
        </p>
        <div className="flex gap-3">
          <Input
            value={manualCode}
            onChange={(e) => {
              setManualCode(e.target.value);
              setResult("idle");
            }}
            placeholder="BK-001-CRAFT-2025"
          />
          <Button onClick={handleCheckIn} className="shrink-0">
            Check-in
          </Button>
        </div>
      </div>
      {result !== "idle" && (
        <div
          className={`p-5 rounded-xl text-center ${result === "valid" ? "bg-green-50 border border-green-200" : result === "used" ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}`}
        >
          {result === "valid" && (
            <>
              <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
              <p className="font-semibold text-green-700 text-lg">Vé hợp lệ!</p>
              <p className="text-green-600 text-sm">
                Khách đã được check-in thành công.
              </p>
            </>
          )}
          {result === "used" && (
            <>
              <AlertTriangle
                size={48}
                className="mx-auto mb-3 text-amber-500"
              />
              <p className="font-semibold text-amber-700 text-lg">
                Vé đã sử dụng
              </p>
              <p className="text-amber-600 text-sm">
                Vé này đã được check-in trước đó.
              </p>
            </>
          )}
          {result === "invalid" && (
            <>
              <XCircle size={48} className="mx-auto mb-3 text-red-500" />
              <p className="font-semibold text-red-700 text-lg">
                Vé không hợp lệ
              </p>
              <p className="text-red-600 text-sm">
                Mã QR không được nhận diện.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCheckInPage;
