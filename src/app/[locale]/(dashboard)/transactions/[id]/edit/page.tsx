import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";
import { getTranslations } from 'next-intl/server';
import { withServerLoading } from '@/lib/prisma-with-loading';

type SplitType = 'EQUAL' | 'PERCENTAGE' | 'FIXED';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EditTransactionPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const t = await getTranslations('transactions');
  const queryParams = await searchParams;
  console.log("Query params:", queryParams);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  try {
    // 獲取交易詳情
    const transaction = await withServerLoading(async () => {
      return await prisma.transaction.findUnique({
        where: {
          id: id
        },
        include: {
          category: true,
          splits: {
            include: {
              assignedTo: true
            }
          },
          payments: {
            include: {
              payer: true
            }
          },
          activity: true,
          group: true
        }
      });
    });
    
    if (!transaction) {
      console.log("Transaction not found with ID:", id);
      notFound();
    }
    
    console.log("Transaction data fetched:", JSON.stringify(transaction, null, 2));

    // 單獨查詢分帳數據
    console.log("Fetching split data for transaction ID:", id);
    const splitData = await prisma.transactionSplit.findMany({
      where: { transactionId: id },
    });
    
    console.log("Split data fetched:", JSON.stringify(splitData, null, 2));
    console.log("Number of splits found:", splitData.length);

    // 獲取付款資料
    const paymentData = await withServerLoading(async () => {
      return await prisma.transactionPayment.findMany({
        where: {
          transactionId: id
        },
        include: {
          payer: true
        }
      });
    });
    
    console.log("Payment records fetched:", JSON.stringify(paymentData, null, 2));
    console.log("Number of payments found:", paymentData.length);

    // 檢查權限
    const isOwner = transaction.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      console.log("Permission denied. User is not owner or admin.");
      redirect('/transactions');
    }

    // 格式化交易日期為 YYYY-MM-DD
    const formattedDate = transaction.date.toISOString().split('T')[0];
    console.log("Formatted date:", formattedDate);

    // 獲取所有分類
    const categories = await withServerLoading(async () => {
      return await prisma.category.findMany({
        where: {
          type: transaction.type,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    // 獲取所有活動
    const activities = await withServerLoading(async () => {
      return await prisma.activity.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    });
    
    // 獲取所有群組
    const groups = await withServerLoading(async () => {
      return await prisma.group.findMany({
        where: {
          OR: [
            { createdById: session.user.id },
            { 
              members: {
                some: {
                  userId: session.user.id
                }
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
        },
      });
    });
    
    // 獲取所有用戶
    const users = await withServerLoading(async () => {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });
    
    const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

    // 處理分帳數據
    const splits = splitData.map((split) => {
      console.log("Processing split:", JSON.stringify(split, null, 2));
      return {
        id: split.id,
        amount: split.splitAmount,
        description: split.description || '',
        assignedToId: split.assignedToId,
        splitType: split.status as SplitType,
        isIncluded: split.isIncluded,
        splitValue: split.splitValue || 0
      };
    });
    console.log("Processed splits for form:", JSON.stringify(splits, null, 2));

    // 處理付款記錄
    const payments = paymentData.map((payment) => {
      return {
        payerId: payment.payerId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || '',
        note: payment.note || ''
      };
    });
    console.log("Processed payments for form:", JSON.stringify(payments, null, 2));

    // 這裡我們將原始數據轉化為表單所需格式
    const transactionType = transaction.type === 'EXPENSE' || transaction.type === 'INCOME' 
      ? transaction.type as 'EXPENSE' | 'INCOME'
      : 'EXPENSE'; // 默認為支出
      
    // 準備傳遞給表單的默認值
    const defaultValues = {
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      activityId: transaction.activityId || 'none',
      date: new Date(formattedDate),
      description: transaction.description || '',
      images: transaction.images || [],
      paymentStatus: transaction.paymentStatus,
      groupId: transaction.groupId || undefined,
      splits: splits,
      payments: payments
    };
    
    console.log("Default values for form:", JSON.stringify(defaultValues, null, 2));

    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('form.title_edit')}</h1>
          <TransactionForm 
            type={transactionType}
            categories={categories}
            activities={activities}
            groups={groups}
            users={users}
            defaultValues={defaultValues}
            transactionId={transaction.id}
            canManagePayments={canManagePayments}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading transaction data:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6 text-red-500">{t('error_loading')}</h1>
          <p>{t('please_try_again')}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }
} 