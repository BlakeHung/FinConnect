import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";

export default async function ActivityPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { transactions: true }
      },
      transactions: {
        include: {
          category: true,
          user: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!activity) {
    notFound();
  }

  // 生成 EDM 分享連結
  const edmLink = `${process.env.NEXT_PUBLIC_APP_URL}/edm/activities/${activity.id}`;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{activity.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant={activity.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {activity.status === 'ACTIVE' ? '進行中' : '已結束'}
              </Badge>
              <Badge variant="outline">
                {activity._count.expenses} 筆支出
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <ShareButton id={activity.id} type="activity" />
            {session.user.role === 'ADMIN' && (
              <>
                <Link
                  href={`/activities/${activity.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  編輯活動
                </Link>
                <Link
                  href={`/activities/${activity.id}/edm`}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  EDM 管理
                </Link>
              </>
            )}
          </div>
        </div>

        {activity.description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">活動說明</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
          </div>
        )}

        {/* 如果有 EDM，顯示預覽 */}
        {activity.edm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">EDM 預覽</h2>
              <ShareButton id={activity.id} type="activity" />
            </div>
            <div className="prose max-w-none">
              <h3>{activity.edm.title}</h3>
              <p className="whitespace-pre-wrap">{activity.edm.content}</p>
              {activity.edm.registrationLink && (
                <a 
                  href={activity.edm.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  立即報名
                </a>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">支出記錄</h2>
          </div>
          <div className="divide-y">
            {activity.transactions.map((transaction) => (
              <div key={transaction.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{transaction.description || '無說明'}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category.name} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      記錄者: {transaction.user.name}
                    </p>
                  </div>
                  <p className="font-medium text-lg">
                    ${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {activity.transactions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                還沒有任何支出記錄
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 