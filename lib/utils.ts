import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[dayOfWeek];
}
