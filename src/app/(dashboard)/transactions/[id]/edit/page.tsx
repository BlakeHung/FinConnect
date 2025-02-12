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

  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
    include: {
      category: true,
    },
  });

  if (!expense) {
    notFound();
  }

  // 檢查權限
  const isOwner = expense.userId === session.user.id;
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

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">編輯支出</h1>
        <TransactionForm 
          type="EXPENSE"
          categories={categories}
          defaultValues={{
            amount: expense.amount,
            categoryId: expense.categoryId,
            date: expense.date,
            description: expense.description || '',
            images: expense.images || [],
          }}
          expenseId={expense.id}
        />
      </div>
    </div>
  );
} 