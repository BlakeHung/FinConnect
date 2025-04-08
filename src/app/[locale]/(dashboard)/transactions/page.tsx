import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserFilter } from "@/components/UserFilter";
import { SortFilter } from "@/components/SortFilter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/TransactionTable";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { withServerLoading } from "@/lib/prisma-with-loading";

type SearchParams = {
  userId?: string;
  activityId?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export default async function TransactionsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  setRequestLocale(locale);
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const canViewAll = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

  // 使用 withServerLoading 包裝用戶查詢
  const users = canViewAll ? await withServerLoading(async () => {
    return await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }) : [];

  // 使用 withServerLoading 包裝活動查詢
  const activities = await withServerLoading(async () => {
    return await prisma.activity.findMany({
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
  });

  const where: Record<string, unknown> = {};
  
  if (searchParams.userId) {
    where.userId = searchParams.userId;
  }
  
  if (searchParams.activityId) {
    where.activityId = searchParams.activityId;
  }

  const orderBy: Record<string, 'asc' | 'desc'> = {};
  
  if (searchParams.sortBy) {
    orderBy[searchParams.sortBy] = searchParams.order || 'desc';
  } else {
    orderBy.updatedAt = 'desc';
  }

  // 使用 withServerLoading 包裝交易查詢
  const transactions = await withServerLoading(async () => {
    const results = await prisma.transaction.findMany({
      where,
      orderBy: [
        { updatedAt: 'desc' },
        { date: 'desc' }
      ],
      include: {
        user: true,
        activity: true,
        category: true,
        splits: true,
      },
    });
    
    // 添加 isSplit 屬性
    return results.map(transaction => ({
      ...transaction,
      isSplit: transaction.splits && transaction.splits.length > 0,
    }));
  });

  const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
            <Link href={`/${locale}/transactions/new?type=EXPENSE`}>
              <Plus className="mr-2 h-4 w-4" />
              {t("new_expense")}
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            <Link href={`/${locale}/transactions/new?type=INCOME`}>
              <Plus className="mr-2 h-4 w-4" />
              {t("new_income")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {canViewAll && (
          <UserFilter users={users} />
        )}
        <SortFilter />
      </div>

      <div className="mt-6">
        <TransactionTable 
          transactions={transactions} 
          activities={activities}
          canManagePayments={canManagePayments}
        />
      </div>
    </div>
  );
} 