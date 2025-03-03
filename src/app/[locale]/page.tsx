import { redirect } from 'next/navigation';

export default function LocaleIndexPage() {
  // 重定向到儀表板頁面
  redirect('./dashboard');
} 