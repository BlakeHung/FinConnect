import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
export default async function SharedTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      user: true,
    },
  });

  if (!expense) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">支出詳情</h1>
          <p className="text-sm text-gray-500">分享檢視</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-gray-600">金額</h3>
            <p className="text-2xl font-bold">${expense.amount.toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-gray-600">類別</h3>
            <p>{expense.category.name}</p>
          </div>

          <div>
            <h3 className="text-gray-600">日期</h3>
            <p>{new Date(expense.date).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-gray-600">說明</h3>
            <p>{expense.description || '無說明'}</p>
          </div>

          {expense.images && expense.images.length > 0 && (
            <div>
              <h3 className="text-gray-600">附件</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {expense.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Receipt ${index + 1}`}
                    className="rounded-lg w-full object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 