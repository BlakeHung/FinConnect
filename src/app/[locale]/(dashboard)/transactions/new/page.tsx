import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: { locale: string };
  searchParams: Promise<{ type: 'EXPENSE' | 'INCOME' }>;
};

export default async function NewTransactionPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const queryParams = await searchParams;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('transactions');
  const today = new Date().toISOString().split('T')[0];
  
  if (!session) {
    redirect('/login');
  }

  if (!queryParams.type || !['EXPENSE', 'INCOME'].includes(queryParams.type)) {
    redirect('/transactions');
  }

  const categories = await prisma.category.findMany({
    where: {
      type: queryParams.type,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const activities = await prisma.activity.findMany({
    orderBy: {
      startDate: 'desc',
    },
    select: {
      id: true,
      name: true,
    },
  });

  // 取得用戶的群組
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { createdById: session.user.id },
        { 
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
    },
  });

  // 獲取最新的活動（如果有的話）
  const latestActivity = activities[0];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {queryParams.type === 'EXPENSE' ? t('new_expense') : t('new_income')}
        </h1>
        <TransactionForm 
          type={queryParams.type} 
          categories={categories}
          activities={activities}
          groups={groups}
          defaultValues={{
            date: today,
            activityId: latestActivity?.id || 'none', // 預設最新活動
          }}
        />
      </div>
    </div>
  );
} 