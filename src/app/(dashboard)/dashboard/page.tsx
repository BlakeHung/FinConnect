import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Receipt, PieChart } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    activeActivities,
    recentTransactions,
    categoryStats,
  ] = await Promise.all([
    // 取得進行中的活動
    prisma.activity.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: {
        edm: true,
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
    }),
    // 取得最近的交易記錄
    prisma.transaction.findMany({
      include: {
        category: true,
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    }),
    // 取得分類統計
      prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    }).then(async (stats) => {
      const categories = await prisma.category.findMany({
        where: {
          id: {
            in: stats.map(s => s.categoryId),
          },
        },
      });

      const totalAmount = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

      return stats.map(stat => ({
        ...stat,
        category: categories.find(c => c.id === stat.categoryId)!,
        percentage: (stat._sum.amount! / (totalAmount || 1)) * 100,
      })).sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0));
    }),
  ]);

  return {
    activeActivities,
    recentTransactions,
    categoryStats,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">儀表板</h2>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CalendarDays className="h-5 w-5" />
            <h3 className="font-semibold">進行中活動</h3>
          </div>
          <p className="text-2xl font-bold">{stats.activeActivities.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Receipt className="h-5 w-5" />
            <h3 className="font-semibold">本月交易筆數</h3>
          </div>
          <p className="text-2xl font-bold">{stats.recentTransactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 分類統計 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">本月支出分類</h3>
          </div>
          <div className="space-y-4">
            {stats.categoryStats.map((stat) => (
              <div key={stat.categoryId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stat.category.name}</span>
                  <span className="text-gray-600">
                    ${stat._sum.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 text-right">
                  {stat.percentage.toFixed(1)}%
                </p>
              </div>
            ))}
            {stats.categoryStats.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                本月尚無支出記錄
              </p>
            )}
          </div>
        </div>

        {/* 進行中活動列表 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">進行中的活動</h3>
          </div>
          <div className="divide-y">
            {stats.activeActivities.map((activity) => (
              <div key={activity.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      href={`/activities/${activity.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {activity.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.startDate).toLocaleDateString()} - 
                      {new Date(activity.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.edm && (
                    <Link
                      href={`/activities/${activity.id}/edm`}
                      className="text-sm text-green-600 hover:underline"
                    >
                      查看 EDM
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {stats.activeActivities.length === 0 && (
              <p className="py-4 text-gray-500 text-center">目前沒有進行中的活動</p>
            )}
          </div>
        </div>
      </div>

      {/* 最近交易記錄 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">最近交易記錄</h3>
        </div>
        <div className="divide-y">
          {stats.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {transaction.description || '無說明'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.category.name} • 
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    記錄者: {transaction.user.name}
                  </p>
                </div>
                <p className="font-medium text-lg">
                  ${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {stats.recentTransactions.length === 0 && (
            <p className="py-4 text-gray-500 text-center">尚無交易記錄</p>
          )}
        </div>
      </div>
    </div>
  );
} 