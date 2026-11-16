import React, { useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowLeft, Calendar, User, Clock } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import tourGuideApi from "../../api/tourGuideApi";

type ScanResult = "idle" | "valid" | "used" | "invalid";

interface CheckInDetail {
  touristName?: string;
  workshopTitle?: string;
  timeslot?: string;
  bookingCode?: string;
  checkedInAt?: string;
  note?: string;
}

const QRCheckInPage: React.FC = () => {
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [checkInDetail, setCheckInDetail] = useState<CheckInDetail | null>(null);

  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;

    setLoading(true);
    setErrorMessage("");
    setCheckInDetail(null);

    try {
      const res = await tourGuideApi.checkIn(code);
      const data = res.data?.data || res.data || {};
      setCheckInDetail(data);
      setResult("valid");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Check-in không thành công.";
      setErrorMessage(msg);
      if (msg.toLowerCase().includes("đã được check-in") || msg.toLowerCase().includes("đã sử dụng")) {
        setResult("used");
      } else {
        setResult("invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <Link
          to="/tour-guide/schedules"
          className="inline-flex items-center gap-1.5 text-xs text-[#7A6255] hover:text-[#964824] mb-3 transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          <span>Quay lại Lịch phân công</span>
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] text-center">
          Quét mã QR Check-in
        </h1>
        <p className="text-xs md:text-sm text-[#7A6255] text-center mt-1">
          Quét vé điện tử hoặc nhập mã vé / mã đặt chỗ của khách tham gia
        </p>
      </div>

      {/* Camera Scanning Frame */}
      <div className="bg-[#3D2B1F] rounded-3xl aspect-square max-h-[300px] flex items-center justify-center relative overflow-hidden shadow-inner">
        <div className="text-center text-white/80 p-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <QrCode size={36} className="text-[#EAD8CC]" />
          </div>
          <p className="text-sm font-semibold text-white">Camera quét mã</p>
          <p className="text-xs text-white/60 mt-1">Hướng camera máy quét vào mã QR trên vé của khách</p>
        </div>
        <div className="absolute inset-6 border-2 border-dashed border-[#964824]/60 rounded-2xl pointer-events-none" />
      </div>

      {/* Manual Input Form */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 shadow-xs">
        <p className="text-xs font-semibold text-[#3D2B1F] mb-3">
          Hoặc nhập mã vé / mã đặt chỗ thủ công:
        </p>
        <form onSubmit={handleCheckIn} className="flex gap-2.5">
          <Input
            value={manualCode}
            onChange={(e) => {
              setManualCode(e.target.value);
              setResult("idle");
              setErrorMessage("");
            }}
            placeholder="Ví dụ: BK-179480... hoặc QR token"
            className="text-xs font-mono"
            disabled={loading}
          />
          <Button
            type="submit"
            onClick={handleCheckIn}
            disabled={loading || !manualCode.trim()}
            className="shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Check-in"}
          </Button>
        </form>
      </div>

      {/* Result Display */}
      {result !== "idle" && (
        <div
          className={`p-5 rounded-2xl border text-center transition-all ${
            result === "valid"
              ? "bg-emerald-50/80 border-emerald-200"
              : result === "used"
              ? "bg-amber-50/80 border-amber-200"
              : "bg-rose-50/80 border-rose-200"
          }`}
        >
          {result === "valid" && (
            <div className="space-y-3">
              <CheckCircle size={44} className="mx-auto text-emerald-600" />
              <div>
                <p className="font-serif font-bold text-emerald-800 text-lg">Check-in thành công!</p>
                <p className="text-emerald-700 text-xs mt-0.5">Vé hợp lệ, khách hàng đã được đón vào buổi trải nghiệm.</p>
              </div>

              {checkInDetail && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200 text-left text-xs space-y-1.5 text-[#3D2B1F]">
                  {checkInDetail.touristName && (
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-[#964824]" />
                      <span>Khách hàng: <strong>{checkInDetail.touristName}</strong></span>
                    </div>
                  )}
                  {checkInDetail.workshopTitle && (
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#964824]" />
                      <span>Workshop: <strong>{checkInDetail.workshopTitle}</strong></span>
                    </div>
                  )}
                  {checkInDetail.timeslot && (
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-[#964824]" />
                      <span>Khung giờ: <strong>{checkInDetail.timeslot}</strong></span>
                    </div>
                  )}
                  {checkInDetail.note && (
                    <p className="text-[11px] text-amber-800 italic mt-1 pt-1 border-t border-emerald-100">
                      {checkInDetail.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {result === "used" && (
            <div className="space-y-2">
              <AlertTriangle size={44} className="mx-auto text-amber-600" />
              <p className="font-serif font-bold text-amber-800 text-lg">Vé đã sử dụng</p>
              <p className="text-amber-700 text-xs">
                {errorMessage || "Vé này đã được thực hiện check-in trước đó."}
              </p>
            </div>
          )}

          {result === "invalid" && (
            <div className="space-y-2">
              <XCircle size={44} className="mx-auto text-rose-600" />
              <p className="font-serif font-bold text-rose-800 text-lg">Không thể check-in</p>
              <p className="text-rose-700 text-xs">
                {errorMessage || "Mã vé không hợp lệ hoặc không thuộc thẩm quyền của bạn."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCheckInPage;
