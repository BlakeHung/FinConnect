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
  params: { locale },
  searchParams,
}: PageProps) {
  const t = await getTranslations('transactions');
  const queryParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // 獲取分類列表
  const categories = await prisma.category.findMany({
    where: {
      type: queryParams.type,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  // 獲取進行中的活動
  const activities = await prisma.activity.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      startDate: 'desc',
    },
    select: {
      id: true,
      name: true,
    },
  });
  
  // 獲取用戶的群組，包含成員數據
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { createdById: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      members: {
        select: {
          id: true,
          name: true,
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    },
  });
  
  const today = new Date().toISOString().split('T')[0];
  const latestActivity = activities[0];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
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
            activityId: latestActivity?.id || 'none',
          }}
        />
      </div>
    </div>
  );
} 