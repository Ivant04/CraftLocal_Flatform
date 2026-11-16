import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  StopCircle,
  Loader2,
  Clock,
  ArrowLeft,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import tourGuideApi from '../../api/tourGuideApi';
import { normalizeTimeslot } from '../../utils/normalizers';
import { formatTime } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import type { Timeslot } from '../../types/timeslot.type';

type TripStatus = 'NOT_STARTED' | 'ONGOING' | 'FINISHED';

const tripLabels: Record<TripStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  ONGOING: 'Đang diễn ra',
  FINISHED: 'Đã hoàn thành',
};

const tripStatusStyles: Record<TripStatus, { bg: string; text: string; border: string }> = {
  NOT_STARTED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
  ONGOING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  FINISHED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

const steps = [
  { label: 'Đón khách & Check-in', desc: 'Kiểm tra mã QR vé và phát dụng cụ, vật liệu bảo hộ.' },
  { label: 'Giới thiệu & Thuyết minh', desc: 'Kể câu chuyện làng nghề, lịch sử và kỹ thuật chế tác thủ công.' },
  { label: 'Thực hành chế tác', desc: 'Nghệ nhân và HDV hướng dẫn du khách tự tay làm tác phẩm.' },
  { label: 'Hoàn thiện & Đóng gói', desc: 'Kiểm tra độ tinh xảo, ký tên và đóng gói sản phẩm mang về.' },
  { label: 'Kết thúc & Cảm ơn', desc: 'Chụp ảnh kỷ niệm, mời du khách đánh giá và chia tay.' },
];

const TripProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [timeslot, setTimeslot] = useState<Timeslot | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('NOT_STARTED');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimeslot = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await tourGuideApi.getSchedule();
        const rawList = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const found = rawList.map(normalizeTimeslot).find((ts: Timeslot) => ts._id === id) || null;
        setTimeslot(found);
        if (found?.status === 'ONGOING') {
          setTripStatus('ONGOING');
        } else if (found?.status === 'COMPLETED') {
          setTripStatus('FINISHED');
          setCurrentStep(steps.length);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải thông tin ca trải nghiệm.');
      } finally {
        setLoading(false);
      }
    };
    fetchTimeslot();
  }, [id]);

  const handleStartTrip = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError('');
      await tourGuideApi.startTrip(id);
      setTripStatus('ONGOING');
      setCurrentStep(0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể bắt đầu chuyến đi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishTrip = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError('');
      await tourGuideApi.finishTrip(id);
      setTripStatus('FINISHED');
      setCurrentStep(steps.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể kết thúc chuyến đi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loading />
      </div>
    );
  }

  const isBeforeStartTime = timeslot?.startTime ? new Date() < new Date(timeslot.startTime) : false;
  const formattedStartTime =
    timeslot?.startTimeLabel || (timeslot?.startTime ? formatTime(timeslot.startTime) : '');
  const style = tripStatusStyles[tripStatus];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          to="/tour-guide/schedules"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6255] hover:text-[#964824] transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Quay lại Lịch phân công</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
              Điều phối buổi trải nghiệm
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
              Tiến độ chuyến đi
            </h1>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${style.bg} ${style.text} ${style.border}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tripStatus === 'ONGOING'
                  ? 'bg-blue-500 animate-ping'
                  : tripStatus === 'FINISHED'
                  ? 'bg-emerald-500'
                  : 'bg-stone-400'
              }`}
            />
            {tripLabels[tripStatus]}
          </span>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workshop Summary Card */}
      {timeslot && (
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-[#3D2B1F]">{timeslot.workshopTitle}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6255]">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#964824]" />
                {timeslot.date}
              </span>
              <span className="flex items-center gap-1 font-mono text-[#964824]">
                <Clock size={13} />
                {timeslot.startTimeLabel || formatTime(timeslot.startTime)} -{' '}
                {timeslot.endTimeLabel || formatTime(timeslot.endTime)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} className="text-[#964824]" />
                {timeslot.bookedSlots} / {timeslot.totalSlots} khách đã đặt
              </span>
            </div>
          </div>

          <Link
            to={`/tour-guide/customers/${timeslot._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#964824] bg-[#964824]/10 hover:bg-[#964824]/20 rounded-xl transition-colors shrink-0"
          >
            <Users size={14} />
            <span>Xem danh sách khách</span>
          </Link>
        </div>
      )}

      {/* Stepper Timeline Card */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-6 shadow-xs space-y-6">
        <h3 className="font-serif font-bold text-base text-[#3D2B1F]">
          Các giai đoạn trải nghiệm
        </h3>

        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAD8CC]">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep || tripStatus === 'FINISHED';
            const isCurrent = i === currentStep && tripStatus === 'ONGOING';

            return (
              <div key={i} className="relative flex items-start gap-4">
                {/* Step Marker */}
                <div
                  className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-[#964824] text-white ring-4 ring-[#964824]/20 animate-pulse'
                      : 'bg-white border-2 border-[#EAD8CC] text-[#7A6255]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
                </div>

                {/* Step Content */}
                <div className={`flex-1 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                  <p
                    className={`font-semibold text-sm ${
                      isCurrent
                        ? 'text-[#964824] font-bold'
                        : isCompleted
                        ? 'text-[#3D2B1F]'
                        : 'text-[#7A6255]'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-[#7A6255] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 shadow-xs space-y-3">
        {tripStatus === 'NOT_STARTED' && (
          <>
            {isBeforeStartTime && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                <Clock size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <span className="font-bold">Chưa đến giờ bắt đầu workshop (Bắt đầu lúc {formattedStartTime}):</span>
                  <p className="mt-0.5 text-blue-800">
                    Du khách có thể đến check-in sớm để chuẩn bị. Hướng dẫn viên có thể bắt đầu chuyến khi đến đúng giờ quy định.
                  </p>
                </div>
              </div>
            )}
            {!isBeforeStartTime && timeslot && timeslot.bookedSlots === 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                Khung giờ này hiện chưa có khách đặt vé thành công. Hướng dẫn viên chỉ có thể bắt đầu khi có khách tham gia.
              </div>
            )}
            <Button
              fullWidth
              onClick={handleStartTrip}
              disabled={submitting || isBeforeStartTime || (timeslot !== null && timeslot.bookedSlots === 0)}
              className="py-3"
            >
              <PlayCircle size={18} className="mr-2" />
              {submitting
                ? 'Đang xử lý...'
                : isBeforeStartTime
                ? `Chưa đến giờ bắt đầu (${formattedStartTime})`
                : timeslot && timeslot.bookedSlots === 0
                ? 'Chưa có khách tham gia'
                : 'Bắt đầu buổi trải nghiệm'}
            </Button>
          </>
        )}

        {tripStatus === 'ONGOING' && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {currentStep < steps.length - 1 ? (
              <Button
                fullWidth
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="py-3"
              >
                <span>Chuyển sang bước: {steps[currentStep + 1]?.label}</span>
                <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : null}

            <Button
              fullWidth
              variant="outline"
              onClick={handleFinishTrip}
              disabled={submitting}
              className="py-3 text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <StopCircle size={18} className="mr-2 text-rose-600" />
              <span>{submitting ? 'Đang hoàn tất...' : 'Kết thúc buổi trải nghiệm'}</span>
            </Button>
          </div>
        )}

        {tripStatus === 'FINISHED' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-1" />
            <p className="font-serif font-bold text-base text-emerald-900">
              Buổi trải nghiệm đã hoàn thành tốt đẹp!
            </p>
            <p className="text-xs text-emerald-700">
              Cảm ơn bạn đã đồng hành và lan tỏa tinh hoa làng nghề truyền thống cùng CraftLocal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripProgressPage;
