import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: { type?: 'EXPENSE' | 'INCOME' }
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // 從 URL 參數獲取類型，預設為支出
  const type = searchParams.type || 'EXPENSE';

  // 獲取所有分類
  const categories = await prisma.category.findMany({
    where: {
      type: type,  // 根據選擇的類型過濾分類
    },
    orderBy: [
      { name: 'asc' },
    ],
  });

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          新增{type === 'EXPENSE' ? '支出' : '收入'}
        </h1>
        <TransactionForm 
          categories={categories}
          type={type}
        />
      </div>
    </div>
  );
} 