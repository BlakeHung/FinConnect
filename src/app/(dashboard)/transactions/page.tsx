import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserFilter } from "@/components/UserFilter";
import { SortFilter } from "@/components/SortFilter";

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { 
    userId?: string;
    sortBy?: SortField;
    order?: SortOrder;
  };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // 檢查是否為管理員或財務
  const canViewAll = session.user.role === 'ADMIN' || session.user.role === 'FINANCE';

  // 如果是管理員或財務，獲取所有使用者列表
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

  // 處理排序參數
  const sortBy = searchParams.sortBy as SortField || 'date';
  const order = searchParams.order as SortOrder || 'desc';

  // 構建查詢條件
  const where = {
    userId: canViewAll 
      ? searchParams.userId || undefined  // 如果有選擇特定使用者
      : session.user.id,  // 一般使用者只能看到自己的
  };

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      category: true,
      user: true,
      activity: true,
    },
    orderBy: {
      [sortBy]: order,
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">交易記錄</h1>
        <Link
          href="/transactions/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          記錄支出
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {canViewAll && (
          <UserFilter users={users} />
        )}
        <SortFilter />
      </div>

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Link 
            key={expense.id}
            href={`/transactions/${expense.id}`}
          >
            <div 
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{expense.description || '無說明'}</h3>
                  <p className="text-sm text-gray-500">
                    {expense.category.name} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                  {canViewAll && (
                    <p className="text-xs text-gray-400">
                      記錄者: {expense.user.name}
                    </p>
                  )}
                </div>
                <p className="font-medium text-lg">
                  ${expense.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {expenses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            還沒有任何交易記錄
          </div>
        )}
      </div>
    </div>
  );
} 