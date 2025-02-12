import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
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
        <h1 className="text-2xl font-bold mb-6">新增支出</h1>
        <TransactionForm 
          type="EXPENSE"
          categories={categories}
        />
      </div>
    </div>
  );
} 