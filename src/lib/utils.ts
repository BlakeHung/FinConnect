import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getActivityStatus(
  startDate: Date, 
  endDate: Date, 
  enabled: boolean, 
  translations?: {
    disabled?: string;
    upcoming?: string;
    ongoing?: string;
    ended?: string;
  }
) {
  const now = new Date();
  
  // 默認文字，當沒有提供翻譯時使用
  const defaultTexts = {
    disabled: '未啟用',
    upcoming: '即將開始',
    ongoing: '進行中',
    ended: '已結束'
  };
  
  // 合併默認文字和提供的翻譯
  const texts = {
    ...defaultTexts,
    ...translations
  };
  
  if (!enabled) {
    return { status: texts.disabled, className: 'bg-gray-100 text-gray-800' };
  }
  
  if (now < startDate) {
    return { status: texts.upcoming, className: 'bg-yellow-100 text-yellow-800' };
  }
  
  if (now > endDate) {
    return { status: texts.ended, className: 'bg-gray-100 text-gray-800' };
  }
  
  return { status: texts.ongoing, className: 'bg-green-100 text-green-800' };
} 