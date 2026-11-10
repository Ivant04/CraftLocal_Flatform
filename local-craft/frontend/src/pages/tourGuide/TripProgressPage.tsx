import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Circle, PlayCircle, StopCircle } from 'lucide-react';
import { timeslots } from '../../utils/mockData';
import { formatTime } from '../../utils/formatDate';
import Button from '../../components/common/Button';

type TripStatus = 'NOT_STARTED' | 'ONGOING' | 'FINISHED';

const tripLabels: Record<TripStatus, string> = {
    NOT_STARTED: 'Chưa bắt đầu',
    ONGOING: 'Đang diễn ra',
    FINISHED: 'Đã kết thúc',
};

const steps = [
    { label: 'Đón khách', desc: 'Check-in & giới thiệu' },
    { label: 'Bắt đầu workshop', desc: 'Hướng dẫn kỹ thuật' },
    { label: 'Thực hành', desc: 'Khách tự tay làm' },
    { label: 'Hoàn thiện', desc: 'Kiểm tra & đóng gói' },
    { label: 'Kết thúc', desc: 'Cảm ơn & chụp ảnh' },
];

const TripProgressPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [tripStatus, setTripStatus] = useState<TripStatus>('NOT_STARTED');
    const [currentStep, setCurrentStep] = useState(0);

    const timeslot = timeslots.find((ts) => ts._id === id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-headline-lg text-headline-md text-deep-earth">Tiến độ chuyến đi</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tripStatus === 'NOT_STARTED' ? 'bg-gray-100 text-gray-700' : tripStatus === 'ONGOING' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{tripLabels[tripStatus]}</span>
            </div>
            {timeslot && (
                <div className="bg-white rounded-xl border border-soft-clay p-5">
                    <h2 className="font-semibold">{timeslot.workshopTitle}</h2>
                    <p className="text-sm text-on-surface-variant">{timeslot.date} · {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}</p>
                </div>
            )}
            <div className="bg-white rounded-xl border border-soft-clay p-6">
                <div className="space-y-6">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="shrink-0 mt-0.5">
                                {i < currentStep ? <CheckCircle size={24} className="text-green-500" /> : i === currentStep && tripStatus === 'ONGOING' ? <PlayCircle size={24} className="text-blue-500 animate-pulse" /> : <Circle size={24} className="text-outline" />}
                            </div>
                            <div className={`${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                                <p className="font-medium">{step.label}</p>
                                <p className="text-sm text-on-surface-variant">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex gap-3">
                {tripStatus === 'NOT_STARTED' && <Button onClick={() => { setTripStatus('ONGOING'); setCurrentStep(0); }}><PlayCircle size={18} className="mr-2" /> Bắt đầu chuyến</Button>}
                {tripStatus === 'ONGOING' && currentStep < steps.length - 1 && <Button onClick={() => setCurrentStep(currentStep + 1)}>Bước tiếp theo</Button>}
                {tripStatus === 'ONGOING' && currentStep === steps.length - 1 && <Button onClick={() => setTripStatus('FINISHED')} variant="secondary"><StopCircle size={18} className="mr-2" /> Kết thúc chuyến</Button>}
                {tripStatus === 'FINISHED' && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center w-full"><CheckCircle size={32} className="mx-auto mb-2 text-green-500" /><p className="font-semibold text-green-700">Chuyến đi đã hoàn thành!</p></div>}
            </div>
        </div>
    );
};

export default TripProgressPage;
