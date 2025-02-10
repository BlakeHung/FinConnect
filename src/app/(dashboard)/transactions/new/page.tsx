import { prisma } from "@/lib/prisma";
import { TransactionForm } from "@/components/TransactionForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const categories = await prisma.category.findMany({
    where: {
      type: "EXPENSE",
    },
  });

  const activities = await prisma.activity.findMany({
    where: {
      endDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">新增交易</h1>
      <div className="max-w-md">
        <TransactionForm 
          categories={categories}
          activities={activities}
          type="EXPENSE"
        />
      </div>
    </div>
  );
} 