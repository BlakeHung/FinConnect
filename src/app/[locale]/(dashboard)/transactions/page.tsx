import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionFilters } from "@/components/TransactionFilters";
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from '@/lib/i18n';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, Calendar, LayoutList } from "lucide-react";
import type { Locale } from '@/lib/i18n';

export default async function TransactionsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 設置請求的語言環境
  setRequestLocale(locale);

  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/${locale}/login`);
  }
  
  // 處理搜索與篩選條件
  const {
    search,
    categoryId,
    activityId,
    startDate,
    endDate,
    type,
    minAmount,
    maxAmount,
    page = '1'
  } = searchParams;
  
  // 構建過濾條件
  let where = {
    userId: session.user.id,
  };
  
  if (search) {
    where.description = {
      contains: search,
      mode: 'insensitive',
    };
  }
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (activityId) {
    if (activityId === 'none') {
      where.activityId = null;
    } else {
      where.activityId = activityId;
    }
  }
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }
  
  if (type) {
    where.type = type;
  }
  
  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) {
      where.amount.gte = parseFloat(minAmount);
    }
    if (maxAmount) {
      where.amount.lte = parseFloat(maxAmount);
    }
  }
  
  // 分頁
  const pageSize = 10;
  const skip = (parseInt(page) - 1) * pageSize;
  
  // 獲取交易列表與總數
  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        activity: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);
  
  // 獲取類別和活動數據（用於篩選）
  const [categories, activities] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.activity.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('transactions')}</h1>
        
        <div className="flex gap-2">
          <Link href={`/${locale}/transactions/summary`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t('summary')}
            </Button>
          </Link>
          
          <Link href={`/${locale}/transactions/recurring`}>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              {t('recurring')}
            </Button>
          </Link>
          
          <Link href={`/${locale}/transactions/batch`}>
            <Button variant="outline" size="sm">
              <LayoutList className="mr-2 h-4 w-4" />
              {t('batch')}
            </Button>
          </Link>
          
          <Link href={`/${locale}/transactions/new?type=EXPENSE`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('new_transaction')}
            </Button>
          </Link>
        </div>
      </div>
      
      <TransactionFilters 
        categories={categories}
        activities={activities}
      />
      
      <TransactionTable 
        transactions={JSON.parse(JSON.stringify(transactions))}
        currentPage={parseInt(page)}
        totalPages={totalPages}
        locale={locale}
      />
    </div>
  );
} 