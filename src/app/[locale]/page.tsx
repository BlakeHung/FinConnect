import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LocaleIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('./login');
  }

  // 如果已登入，重定向到儀表板頁面
  redirect('./dashboard');
} 