import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { withServerLoading } from '@/lib/prisma-with-loading';

type PageProps = {
  params: { id: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ActivityPage({
  params,
  searchParams,
}: PageProps) {
  // 設置請求語言，啟用靜態渲染
  setRequestLocale(params.locale);
  
  const { id } = params;
  const session = await getServerSession(authOptions);
  
  // 獲取翻譯
  const t = await getTranslations({ locale: params.locale, namespace: 'activity_detail' });
  
  if (!session) {
    redirect('/login');
  }

  const activity = await withServerLoading(async () => {
    return await prisma.activity.findUnique({
      where: { id },
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
                {activity.status === 'ACTIVE' ? t('ongoing') : t('ended')}
              </Badge>
              <Badge variant="outline">
                {activity._count.transactions} {t('expense_count')}
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
                  {t('edit_activity')}
                </Link>
                <Link
                  href={`/activities/${activity.id}/edm`}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  {t('edm_management')}
                </Link>
              </>
            )}
          </div>
        </div>

        {activity.description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">{t('activity_description')}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
          </div>
        )}

        {/* 如果有 EDM，顯示預覽 */}
        {activity.edm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t('edm_preview')}</h2>
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
                  {t('register_now')}
                </a>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">{t('expense_records')}</h2>
          </div>
          <div className="divide-y">
            {activity.transactions.map((transaction) => (
              <div key={transaction.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{transaction.description || t('no_description')}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category.name} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('recorder')}: {transaction.user.name}
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
                {t('no_expense_records')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 