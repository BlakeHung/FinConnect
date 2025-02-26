import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getActivityStatus(startDate: Date, endDate: Date, enabled: boolean) {
  const now = new Date();
  
  if (!enabled) {
    return { status: '未啟用', className: 'bg-gray-100 text-gray-800' };
  }
  
  if (now < startDate) {
    return { status: '即將開始', className: 'bg-yellow-100 text-yellow-800' };
  }
  
  if (now > endDate) {
    return { status: '已結束', className: 'bg-gray-100 text-gray-800' };
  }
  
  return { status: '進行中', className: 'bg-green-100 text-green-800' };
} 