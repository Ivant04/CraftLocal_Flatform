import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Headphones,
} from 'lucide-react';
import audioGuideApi, { AudioGuideResponse } from '../../api/audioGuideApi';

interface AudioGuidePlayerProps {
  title: string;
  location?: string;
  type?: string;
  notes?: string;
  narrativeText?: string;
  audioUrl?: string;
  compact?: boolean;
  allowGenerate?: boolean;
  onAudioGenerated?: (data: AudioGuideResponse) => void;
}

export const AudioGuidePlayer: React.FC<AudioGuidePlayerProps> = ({
  title,
  location,
  type,
  notes,
  narrativeText: initialNarrative,
  audioUrl: initialAudioUrl,
  compact = false,
  allowGenerate = false,
  onAudioGenerated,
}) => {
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);
  const [narrativeText, setNarrativeText] = useState<string | undefined>(initialNarrative);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state if initial props change
  useEffect(() => {
    if (initialAudioUrl) setAudioUrl(initialAudioUrl);
    if (initialNarrative) setNarrativeText(initialNarrative);
  }, [initialAudioUrl, initialNarrative]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play error, trying speech synthesis fallback:', err);
        fallbackSpeechSynthesis();
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate audio using OpenAI TTS + Cloudinary
  const handleGenerateAudio = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const res = await audioGuideApi.generateStopAudio({
        title,
        location,
        type,
        notes,
        voice: 'nova',
      });
      if (res.data) {
        setAudioUrl(res.data.audioUrl);
        setNarrativeText(res.data.narrativeText);
        setDuration(res.data.durationSeconds);
        onAudioGenerated?.(res.data);

        // Auto play when loaded
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }, 300);
      }
    } catch (err: any) {
      console.error('Failed to generate audio guide:', err);
      setErrorMsg(err?.response?.data?.message || 'Không thể tạo âm thanh AI lúc này. Bạn có thể nghe bằng giọng đọc máy.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser SpeechSynthesis fallback
  const fallbackSpeechSynthesis = () => {
    const textToRead = narrativeText || notes || `${title} tại ${location || 'làng nghề thủ công'}`;
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ đọc giọng nói');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = playbackRate;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!audioUrl && !allowGenerate) {
    return null;
  }

  return (
    <div className={`rounded-2xl border transition-all ${
      isPlaying
        ? 'bg-[#FFF9F2] border-[#964824]/40 shadow-sm'
        : 'bg-white border-amber-200/80 hover:border-amber-300'
    } ${compact ? 'p-3' : 'p-4'}`}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Main Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
            isPlaying ? 'bg-[#964824] text-white scale-105 shadow-xs' : 'bg-amber-100 text-[#964824]'
          }`}>
            {isPlaying ? (
              <div className="flex items-end justify-center gap-0.5 h-4 w-4">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-2"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-4"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-3"></span>
              </div>
            ) : (
              <Headphones size={18} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3D2B1F] tracking-wide flex items-center gap-1">
                AI Audio Guide
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-[#964824]/10 text-[#964824] rounded-md">
                  Cloud TTS MP3
                </span>
              </span>
            </div>
            <p className="text-[11px] text-[#7A6255] line-clamp-1">
              Thuyết minh văn hóa: <strong className="font-medium text-[#3D2B1F]">{title}</strong>
            </p>
          </div>
        </div>

        {/* Right CTA / Action */}
        <div className="flex items-center gap-2 shrink-0">
          {audioUrl ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                  isPlaying
                    ? 'bg-[#964824] text-white hover:bg-[#7e3a1b]'
                    : 'bg-[#964824] text-white hover:bg-[#7e3a1b]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={13} className="fill-white" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-white" />
                    <span>Nghe audio</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={cyclePlaybackRate}
                title="Tốc độ phát"
                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-amber-200 bg-white text-[#7A6255] hover:text-[#964824] hover:bg-amber-50"
              >
                {playbackRate}x
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGenerateAudio}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#964824] to-[#b35a2d] hover:opacity-95 transition-all shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Đang tạo giọng AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-amber-200" />
                  <span>Tạo thuyết minh AI</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Scrubber & Progress Bar when Audio is available */}
      {audioUrl && (
        <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center gap-3">
          <span className="text-[10px] font-mono font-medium text-[#7A6255] w-9 text-right shrink-0">
            {formatSeconds(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 60}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-amber-200/60 rounded-lg appearance-none cursor-pointer accent-[#964824]"
          />

          <span className="text-[10px] font-mono font-medium text-[#7A6255] w-9 shrink-0">
            {formatSeconds(duration)}
          </span>

          {narrativeText && (
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              title="Xem kịch bản lời thoại"
              className="text-[#7A6255] hover:text-[#964824] p-1 rounded-md hover:bg-amber-100/60 shrink-0"
            >
              <FileText size={14} />
            </button>
          )}
        </div>
      )}

      {/* Transcript Accordion */}
      {narrativeText && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#964824] hover:underline"
          >
            {showTranscript ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>{showTranscript ? 'Thu gọn lời thoại' : 'Xem lời thuyết minh văn hóa'}</span>
          </button>

          {showTranscript && (
            <div className="mt-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-[#3D2B1F] leading-relaxed italic animate-in fade-in duration-200">
              &ldquo;{narrativeText}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Error / Fallback display */}
      {errorMsg && (
        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center justify-between gap-2">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={fallbackSpeechSynthesis}
            className="font-bold underline shrink-0 hover:text-red-900"
          >
            Đọc bằng máy
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioGuidePlayer;
