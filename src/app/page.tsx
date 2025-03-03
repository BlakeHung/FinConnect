import { redirect } from 'next/navigation';

// 重定向到默認語言
export default function RootPage() {
  redirect('/zh');
}
