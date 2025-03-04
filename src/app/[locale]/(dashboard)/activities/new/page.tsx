import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActivityForm } from "@/components/ActivityForm";
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function NewActivityPage({ params }: { params: { locale: string } }) {
  // 設置請求語言，啟用靜態渲染
  setRequestLocale(params.locale);
  
  const session = await getServerSession(authOptions);
  
  // 獲取翻譯
  const t = await getTranslations({ locale: params.locale, namespace: 'activities' });
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('new_activity')}</h1>
        <ActivityForm />
      </div>
    </div>
  );
} 