import { prisma } from "@/lib/prisma";
import { TransactionList } from "@/components/TransactionList";
import Link from "next/link";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
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
          href="/expenses"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          記錄支出
        </Link>
      </div>
      <TransactionList transactions={transactions} />
    </div>
  );
} 