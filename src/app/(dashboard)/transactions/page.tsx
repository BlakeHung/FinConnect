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

type SearchParams = {
  userId?: string;
  activityId?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<SearchParams>;
};

export default async function TransactionsPage({
  params,
  searchParams,
}: PageProps) {
  const queryParams = await searchParams;
  const session = await getServerSession(authOptions);
  console.log(params);
  if (!session) {
    redirect('/login');
  }

  const canViewAll = session.user.role === 'ADMIN' || session.user.role === 'FINANCE';

  const users = canViewAll ? await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  }) : [];

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

  const where = {
    ...(queryParams.userId && { userId: queryParams.userId }),
    ...(queryParams.activityId && { activityId: queryParams.activityId }),
  };

  const orderBy = queryParams.sortBy
    ? {
        [queryParams.sortBy]: queryParams.order || 'desc',
      }
    : { date: 'desc' as const };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy,
    include: {
      category: true,
      activity: true,
      user: true,
    },
  });

  const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">交易記錄</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
            <a href="/transactions/new?type=EXPENSE" className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              新增支出
            </a>
          </Button>
          <Button asChild className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            <a href="/transactions/new?type=INCOME" className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              新增收入
            </a>
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