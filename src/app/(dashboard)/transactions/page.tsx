import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
      user: true,
      activity: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">交易記錄</h1>
        <Link
          href="/transactions/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          記錄支出
        </Link>
      </div>
      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Link 
            key={expense.id}
            href={`/transactions/${expense.id}`}
          >
            <div 
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{expense.description || '無說明'}</h3>
                  <p className="text-sm text-gray-500">
                    {expense.category.name} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-medium text-lg">
                  ${expense.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {expenses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            還沒有任何交易記錄
          </div>
        )}
      </div>
    </div>
  );
} 