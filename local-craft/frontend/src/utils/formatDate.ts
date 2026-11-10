import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date: string): string => {
  return dayjs(date).format('MMM DD, YYYY');
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('MMM DD, YYYY HH:mm');
};

export const formatTime = (time: string): string => {
  return dayjs(`2000-01-01 ${time}`).format('h:mm A');
};

export const formatRelative = (date: string): string => {
  return dayjs(date).fromNow();
};

export const isToday = (date: string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};
