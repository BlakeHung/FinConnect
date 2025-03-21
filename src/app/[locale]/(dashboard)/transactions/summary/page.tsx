import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { TransactionSummary } from "@/components/TransactionSummary";

export default async function TransactionSummaryPage({
  params: { locale },
  searchParams,
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/${locale}/login`);
  }
  
  // 獲取查詢參數
  const period = searchParams.period || 'month';
  const startDate = searchParams.startDate || new Date(new Date().setDate(1)).toISOString().split('T')[0];
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0];
  
  // 設置日期範圍
  let dateRange = {};
  if (period === 'custom' && startDate && endDate) {
    dateRange = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
  } else {
    const now = new Date();
    let start = new Date();
    
    if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
    }
    
    dateRange = {
      date: {
        gte: start,
        lte: now,
      },
    };
  }
  
  // 獲取收入支出總額
  const totals = await prisma.$transaction([
    prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'EXPENSE',
        ...dateRange,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'INCOME',
        ...dateRange,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);
  
  // 按類別分組的交易總額
  const expensesByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId: session.user.id,
      type: 'EXPENSE',
      ...dateRange,
    },
    _sum: {
      amount: true,
    },
  });
  
  const incomesByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId: session.user.id,
      type: 'INCOME',
      ...dateRange,
    },
    _sum: {
      amount: true,
    },
  });
  
  // 獲取所有類別信息
  const categories = await prisma.category.findMany();
  
  // 按日期分組的支出趨勢
  const expensesByDate = await prisma.transaction.groupBy({
    by: ['date'],
    where: {
      userId: session.user.id,
      type: 'EXPENSE',
      ...dateRange,
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
  
  // 按日期分組的收入趨勢
  const incomesByDate = await prisma.transaction.groupBy({
    by: ['date'],
    where: {
      userId: session.user.id,
      type: 'INCOME',
      ...dateRange,
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
  
  // 處理類別數據
  const expenseCategoriesData = expensesByCategory.map(item => ({
    categoryId: item.categoryId,
    amount: item._sum.amount || 0,
    category: categories.find(c => c.id === item.categoryId)?.name || 'Unknown',
  }));
  
  const incomeCategoriesData = incomesByCategory.map(item => ({
    categoryId: item.categoryId,
    amount: item._sum.amount || 0,
    category: categories.find(c => c.id === item.categoryId)?.name || 'Unknown',
  }));
  
  // 處理趨勢數據
  const expensesTrend = expensesByDate.map(item => ({
    date: item.date.toISOString().split('T')[0],
    amount: item._sum.amount || 0,
  }));
  
  const incomesTrend = incomesByDate.map(item => ({
    date: item.date.toISOString().split('T')[0],
    amount: item._sum.amount || 0,
  }));
  
  const summaryData = {
    totals: {
      expense: totals[0]._sum.amount || 0,
      income: totals[1]._sum.amount || 0,
      balance: (totals[1]._sum.amount || 0) - (totals[0]._sum.amount || 0),
    },
    expensesByCategory: expenseCategoriesData,
    incomesByCategory: incomeCategoriesData,
    expensesTrend,
    incomesTrend,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('summary')}</h1>
      
      <TransactionSummary 
        data={summaryData}
        period={period}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
} 