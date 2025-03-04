import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ToggleSwitch } from "@/components/activities/ToggleSwitch";
// 使用 next-intl 的官方 API
import { getTranslations as getNextIntlTranslations, setRequestLocale } from 'next-intl/server';

// 活動狀態判斷函數 - 使用翻譯對象
function getActivityStatus(startDate: Date, endDate: Date, enabled: boolean, statusTranslations: any) {
  const now = new Date();
  
  // 默認文字，當沒有提供翻譯時使用
  const defaultTexts = {
    disabled: '未啟用',
    upcoming: '即將開始',
    ongoing: '進行中',
    ended: '已結束'
  };
  
  // 確保 statusTranslations 存在，如果不存在則使用默認文字
  const texts = statusTranslations || defaultTexts;
  
  if (!enabled) {
    return { status: texts.disabled || defaultTexts.disabled, className: 'bg-gray-100 text-gray-800' };
  }
  
  if (now < startDate) {
    return { status: texts.upcoming || defaultTexts.upcoming, className: 'bg-yellow-100 text-yellow-800' };
  }
  
  if (now > endDate) {
    return { status: texts.ended || defaultTexts.ended, className: 'bg-gray-100 text-gray-800' };
  }
  
  return { status: texts.ongoing || defaultTexts.ongoing, className: 'bg-green-100 text-green-800' };
}

export default async function ActivitiesPage({ params }: { params: { locale: string } }) {
  // 設置請求語言，啟用靜態渲染
  setRequestLocale(params.locale);
  
  const session = await getServerSession(authOptions);
  
  // 使用 next-intl 的官方 API
  const t = await getNextIntlTranslations({ locale: params.locale, namespace: 'activities' });
  
  if (!session) {
    redirect('/login');
  }

  const activities = await prisma.activity.findMany({
    orderBy: [
      { updatedAt: 'desc' },
      { startDate: 'desc' },
    ],
  });

  const canManage = ['ADMIN', 'FINANCE_MANAGER'].includes(session.user.role);

  // 創建一個翻譯對象，模擬原來的 translations 結構
  const translations = {
    title: t('title'),
    new: t('new'),
    name: t('name'),
    date: t('date'),
    status: t('status'),
    enabled: t('enabled'),
    updated_at: t('updated_at'),
    actions: t('actions'),
    edit: t('edit'),
    status_types: {
      disabled: t('status_types.disabled'),
      upcoming: t('status_types.upcoming'),
      ongoing: t('status_types.ongoing'),
      ended: t('status_types.ended')
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{translations.title}</h1>
        {canManage && (
          <Link
            href="/activities/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto text-center"
          >
            {translations.new}
          </Link>
        )}
      </div>

      {/* 桌面版表格 */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.name}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.date}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.status}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.enabled}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.updated_at}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translations.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/activities/${activity.id}`} className="text-blue-600 hover:underline">
                    {activity.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(activity.startDate, 'yyyy/MM/dd')} - {format(activity.endDate, 'yyyy/MM/dd')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm rounded ${
                    getActivityStatus(activity.startDate, activity.endDate, activity.enabled, translations.status_types).className
                  }`}>
                    {getActivityStatus(activity.startDate, activity.endDate, activity.enabled, translations.status_types).status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ToggleSwitch 
                    id={activity.id}
                    enabled={activity.enabled}
                    canManage={canManage}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(activity.updatedAt, 'yyyy/MM/dd HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {canManage && (
                    <Link
                      href={`/activities/${activity.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      {translations.edit}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 手機版卡片列表 */}
      <div className="sm:hidden space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <Link href={`/activities/${activity.id}`} className="text-lg font-medium text-blue-600">
                {activity.name}
              </Link>
              <ToggleSwitch 
                id={activity.id}
                enabled={activity.enabled}
                canManage={canManage}
              />
            </div>
            
            <div className="text-sm text-gray-600">
              {format(activity.startDate, 'yyyy/MM/dd')} - {format(activity.endDate, 'yyyy/MM/dd')}
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 text-sm rounded ${
                getActivityStatus(activity.startDate, activity.endDate, activity.enabled, translations.status_types).className
              }`}>
                {getActivityStatus(activity.startDate, activity.endDate, activity.enabled, translations.status_types).status}
              </span>
              
              {canManage && (
                <Link
                  href={`/activities/${activity.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  {translations.edit}
                </Link>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {translations.updated_at}: {format(activity.updatedAt, 'yyyy/MM/dd HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}