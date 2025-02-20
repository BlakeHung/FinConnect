import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Activity, ArrowDown, ArrowUp } from "lucide-react";
import { TransactionChart } from "@/components/analytics/TransactionChart";
import { ActivityStats } from "@/components/analytics/ActivityStats";
import { CategoryChart } from "@/components/analytics/CategoryChart";
import { MonthlyComparison } from "@/components/analytics/MonthlyComparison";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // 獲取本月日期範圍
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // 獲取本月收支統計
  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // 計算本月收入和支出
  const monthlyStats = monthlyTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'INCOME') {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  // 獲取待付款金額
  const unpaidAmount = await prisma.transaction.aggregate({
    where: {
      paymentStatus: 'UNPAID',
    },
    _sum: {
      amount: true,
    },
  });

  // 獲取活動支出統計
  const activityExpenses = await prisma.transaction.groupBy({
    by: ['activityId'],
    where: {
      activityId: { not: null },
      type: 'EXPENSE',
    },
    _sum: {
      amount: true,
    },
  });

  // 獲取過去30天的收支趨勢數據
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyTransactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      date: true,
      amount: true,
      type: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // 處理圖表數據
  const chartData = dailyTransactions.reduce((acc: { date: string; income: number; expense: number }[], transaction) => {
    const date = transaction.date.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      if (transaction.type === 'INCOME') {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }
    } else {
      acc.push({
        date,
        income: transaction.type === 'INCOME' ? transaction.amount : 0,
        expense: transaction.type === 'EXPENSE' ? transaction.amount : 0,
      });
    }
    
    return acc;
  }, []);

  // 獲取活動詳細統計
  const activities = await prisma.activity.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      transactions: {
        where: {
          type: 'EXPENSE',
        },
        select: {
          amount: true,
          paymentStatus: true,
        },
      },
    },
  });

  const activityStats = activities.map(activity => ({
    id: activity.id,
    name: activity.name,
    totalExpense: activity.transactions.reduce((sum, t) => sum + t.amount, 0),
    unpaidAmount: activity.transactions
      .filter(t => t.paymentStatus === 'UNPAID')
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: activity.transactions.length,
  }));

  // 獲取分類支出統計
  const categoryExpenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      type: 'EXPENSE',
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // 獲取分類名稱
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryExpenses.map(ce => ce.categoryId),
      },
    },
  });

  // 處理分類圖表數據
  const categoryChartData = categoryExpenses.map(ce => ({
    name: categories.find(c => c.id === ce.categoryId)?.name || '未分類',
    value: ce._sum.amount || 0,
  }));

  // 獲取過去6個月的數據
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);


  // 處理月度比較數據
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'short' });
  }).reverse();

  const monthlyComparisonData = months.map(month => ({
    month,
    income: Math.random() * 50000, // 這裡需要替換為實際數據
    expense: Math.random() * 30000, // 這裡需要替換為實際數據
  }));

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">統計分析</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 本月收入 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月收入</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyStats.income.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* 本月支出 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月支出</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyStats.expense.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* 待付款金額 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待付款金額</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(unpaidAmount._sum.amount || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* 活動總支出 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活動總支出</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activityExpenses.reduce((sum, activity) => sum + (activity._sum.amount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 收支趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>收支趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionChart data={chartData} />
        </CardContent>
      </Card>

      {/* 分類支出分析 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>本月支出分類</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={categoryChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>月度收支比較</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyComparison data={monthlyComparisonData} />
          </CardContent>
        </Card>
      </div>

      {/* 活動統計 */}
      <div>
        <h2 className="text-xl font-bold mb-4">活動統計</h2>
        <ActivityStats activities={activityStats} />
      </div>
    </div>
  );
} 