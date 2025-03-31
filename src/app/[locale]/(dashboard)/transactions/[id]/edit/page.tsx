import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";
import { getTranslations } from 'next-intl/server';

type SplitType = 'EQUAL' | 'PERCENTAGE' | 'FIXED';

type PageProps = {
  params: { id: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EditTransactionPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = params;
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  try {
    // 使用 Prisma 查詢事務詳情，使用單一查詢包含所有關聯
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { 
        category: true,
        group: true,
        splits: {
          include: {
            assignedTo: true
          }
        },
        payments: {
          include: {
            payer: true
          }
        }
      },
    });
    
    if (!transaction) {
      notFound();
    }

    // 檢查權限
    const isOwner = transaction.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      redirect('/transactions');
    }

    // 格式化交易日期為 YYYY-MM-DD
    const formattedDate = transaction.date.toISOString().split('T')[0];

    const categories = await prisma.category.findMany({
      where: {
        type: transaction.type,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const activities = await prisma.activity.findMany({
      orderBy: {
        startDate: 'desc',
      },
      select: {
        id: true,
        name: true,
      },
    });
    
    // 取得用戶的群組
    const groups = await prisma.group.findMany({
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
    
    // 獲取系統中的用戶列表（用於付款記錄）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

    // 處理分帳數據
    const splits = transaction.splits.map((split) => ({
      id: split.id,
      amount: split.splitAmount,
      description: split.description || '',
      assignedToId: split.assignedToId,
      splitType: split.status as SplitType,
      isIncluded: split.isIncluded,
      splitValue: split.splitValue || 0
    }));

    // 處理付款記錄
    const payments = transaction.payments.map((payment) => ({
      payerId: payment.payerId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod || '',
      note: payment.note || ''
    }));

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
      splits,
      payments
    };

    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('form.title_edit')}</h1>
          <TransactionForm 
            type={transaction.type as 'EXPENSE' | 'INCOME'}
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