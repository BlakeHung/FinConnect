import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";
import { getTranslations } from 'next-intl/server';

type SplitType = 'EQUAL' | 'PERCENTAGE' | 'FIXED';

type PageProps = {
  params: { id: string; locale: string };
};

export default async function EditTransactionPage({
  params,
}: PageProps) {
  const { id } = params;
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  try {
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

    const isOwner = transaction.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      redirect('/transactions');
    }

    const formattedDate = transaction.date.toISOString().split('T')[0];

    const [categories, activities, groups, users] = await Promise.all([
      prisma.category.findMany({
        where: { type: transaction.type },
        orderBy: { name: 'asc' },
      }),
      prisma.activity.findMany({
        orderBy: { startDate: 'desc' },
        select: { id: true, name: true },
      }),
      prisma.group.findMany({
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
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      })
    ]);
    
    const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

    const splits = transaction.splits.map((split) => ({
      id: split.id,
      amount: split.splitAmount,
      description: split.description || '',
      assignedToId: split.assignedToId,
      splitType: split.status as SplitType,
      isIncluded: split.isIncluded,
      splitValue: split.splitValue || 0
    }));

    const payments = transaction.payments.map((payment) => ({
      payerId: payment.payerId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod || '',
      note: payment.note || ''
    }));

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