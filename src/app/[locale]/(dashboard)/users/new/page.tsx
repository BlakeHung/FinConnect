import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserForm } from "@/components/UserForm";
import { getTranslations } from 'next-intl/server';

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('users');
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }

  // 如果是 demo 帳號，直接重定向到使用者列表
  if (session.user.email === 'demo@wchung.tw') {
    redirect('/users');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('new')}</h1>
        <UserForm />
      </div>
    </div>
  );
} 