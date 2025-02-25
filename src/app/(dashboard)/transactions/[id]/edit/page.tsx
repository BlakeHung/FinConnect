import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EditTransactionPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  console.log(queryParams);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });
  console.log(transaction)
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
  
  const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">編輯交易</h1>
        <TransactionForm 
          type={transaction.type}
          categories={categories}
          activities={activities}
          defaultValues={{
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            activityId: transaction.activityId || 'none',
            date: formattedDate,
            description: transaction.description || '',
            images: transaction.images || [],
            paymentStatus: transaction.paymentStatus,
          }}
          transactionId={transaction.id}
          canManagePayments={canManagePayments}
        />
      </div>
    </div>
  );
} 