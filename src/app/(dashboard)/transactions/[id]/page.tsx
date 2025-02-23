import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TransactionPage({
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
    include: {
      category: true,
      activity: true,
      user: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  // 檢查權限
  const isOwner = transaction.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    redirect('/transactions');
  }

  // 檢查使用者權限
  const canEdit = isOwner || isAdmin;

  console.log({
    transactionUserId: transaction.userId,
    sessionUserId: session.user.id,
    userRole: session.user.role,
    canEdit: isOwner || isAdmin
  });

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">支出詳情</h1>
          <div className="space-x-2 flex items-center">
            <ShareButton id={id} type="transaction" />
            <Link
              href="/transactions"
              className="text-gray-600 hover:text-gray-800"
            >
              返回列表
            </Link>
            {canEdit && (
              <Link
                href={`/transactions/${id}/edit`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                編輯
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-gray-600">金額</h3>
            <p className="text-2xl font-bold">${transaction.amount.toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-gray-600">類別</h3>
            <p>{transaction.category.name}</p>
          </div>

          <div>
            <h3 className="text-gray-600">日期</h3>
            <p>{new Date(transaction.date).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-gray-600">說明</h3>
            <p>{transaction.description || '無說明'}</p>
          </div>

          <div>
            <h3 className="text-gray-600">建立者</h3>
            <p>{transaction.user.name}</p>
          </div>

          {transaction.images && transaction.images.length > 0 && (
            <div>
              <h3 className="text-gray-600">附件</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {transaction.images.map((image, index) => (
                  <img
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