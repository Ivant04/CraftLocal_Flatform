import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export const formatDate = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format('DD/MM/YYYY') : String(date);
};

export const formatDateTime = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : String(date);
};

export const formatTime = (time?: string | Date | null): string => {
  if (!time) return '--:--';
  if (time instanceof Date) {
    return Number.isNaN(time.getTime()) ? '--:--' : dayjs(time).format('HH:mm');
  }

  const str = String(time).trim();
  if (!str || str.toLowerCase() === 'invalid date') return '--:--';

  // 1. Pure time string like "09:00", "9:00", "09:00:00"
  const timeOnly = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (timeOnly) {
    return `${timeOnly[1].padStart(2, '0')}:${timeOnly[2]}`;
  }

  // 2. Time string with AM/PM like "9:00 AM", "02:30 PM"
  const ampm = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let hours = parseInt(ampm[1], 10);
    const minutes = ampm[2];
    const modifier = ampm[3].toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // 3. ISO or full datetime string (e.g. "2026-11-15T02:00:00.000Z" or "2026-11-15 09:00")
  const parsed = dayjs(str);
  if (parsed.isValid()) {
    return parsed.format('HH:mm');
  }

  // 4. Fallback: try prefixing 2000-01-01
  const fallback = dayjs(`2000-01-01 ${str}`);
  if (fallback.isValid()) {
    return fallback.format('HH:mm');
  }

  return str;
};

export const formatRelative = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.fromNow() : '';
};

export const isToday = (date?: string | Date | null): boolean => {
  if (!date) return false;
  const d = dayjs(date);
  return d.isValid() ? d.isSame(dayjs(), 'day') : false;
};
