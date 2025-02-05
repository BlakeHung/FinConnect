import { prisma } from "@/lib/prisma";
import { TransactionForm } from "@/components/TransactionForm";

export default async function ExpensesPage() {
  const categories = await prisma.category.findMany({
    where: {
      type: "EXPENSE",
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">記錄支出</h1>
      <div className="max-w-md">
        <TransactionForm 
          categories={categories}
          type="EXPENSE"
        />
      </div>
    </div>
  );
} 