import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserFilter } from "@/components/UserFilter";
import { SortFilter } from "@/components/SortFilter";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const userId = await Promise.resolve(searchParams.userId);
  const where = {
    userId: canViewAll 
      ? userId || undefined  // 如果有選擇特定使用者
      : session.user.id,  // 一般使用者只能看到自己的
  };

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: true,
      user: true,
    },
    orderBy: {
      [sortBy]: order,
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">交易記錄</h1>
        
        {/* 新增按鈕群組 */}
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

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <Link 
            key={transaction.id}
            href={`/transactions/${transaction.id}`}
          >
            <div 
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{transaction.description || '無說明'}</h3>
                  <p className="text-sm text-gray-500">
                    {transaction.category.name} • {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  {canViewAll && (
                    <p className="text-xs text-gray-400">
                      記錄者: {transaction.user.name}
                    </p>
                  )}
                </div>
                <p className="font-medium text-lg">
                  ${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {transactions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            還沒有任何交易記錄
          </div>
        )}
      </div>
    </div>
  );
} 