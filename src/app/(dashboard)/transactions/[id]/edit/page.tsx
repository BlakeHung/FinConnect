import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      category: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  // 檢查權限
  const isOwner = transaction.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    redirect('/transactions');  // 如果沒有權限，重定向到列表頁面
  }

  // 獲取所有類別
  const categories = await prisma.category.findMany({
    where: {
      type: 'EXPENSE',
    },
    orderBy: {
      name: 'asc',
    },
  });

  const canManagePayments = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">編輯支出</h1>
        <TransactionForm 
          type="EXPENSE"
          categories={categories}
          defaultValues={{
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            date: transaction.date,
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