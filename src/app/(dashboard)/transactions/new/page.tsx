import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: { type: 'EXPENSE' | 'INCOME' };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // 獲取分類列表
  const categories = await prisma.category.findMany({
    where: {
      type: searchParams.type,
    },
    orderBy: {
      name: 'asc',
    },
  });
  const today = new Date().toISOString().split('T')[0];  // 格式化今天的日期為 YYYY-MM-DD

  // 獲取進行中的活動，按創建時間降序排序
  const activities = await prisma.activity.findMany({
    where: {
      status: 'ACTIVE',
      startDate: {
        lte: new Date(), // 開始日期在今天或之前
      },
      endDate: {
        gte: new Date(), // 結束日期在今天或之後
      },
    },
    orderBy: {
      createdAt: 'desc', // 按創建時間降序排序
    },
    select: {
      id: true,
      name: true,
    },
  });

  // 獲取最新創建的活動（如果有的話）
  const latestActivity = activities[0];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          新增{searchParams.type === 'EXPENSE' ? '支出' : '收入'}
        </h1>
        <TransactionForm 
          type={searchParams.type} 
          categories={categories}
          activities={activities}
          defaultValues={{
            date: today,
            activityId: latestActivity?.id || 'none', // 預設最新活動
          }}
        />
      </div>
    </div>
  );
} 