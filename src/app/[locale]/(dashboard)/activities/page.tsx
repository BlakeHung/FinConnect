import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ToggleSwitch } from "@/components/activities/ToggleSwitch";

// 活動狀態判斷函數
function getActivityStatus(startDate: Date, endDate: Date, enabled: boolean) {
  const now = new Date();
  
  if (!enabled) {
    return { status: '未啟用', className: 'bg-gray-100 text-gray-800' };
  }
  
  if (now < startDate) {
    return { status: '即將開始', className: 'bg-yellow-100 text-yellow-800' };
  }
  
  if (now > endDate) {
    return { status: '已結束', className: 'bg-gray-100 text-gray-800' };
  }
  
  return { status: '進行中', className: 'bg-green-100 text-green-800' };
}

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const activities = await prisma.activity.findMany({
    orderBy: [
      { updatedAt: 'desc' },  // 優先按更新時間排序
      { startDate: 'desc' },  // 其次按開始日期排序
    ],
  });

  const canManage = ['ADMIN', 'FINANCE_MANAGER'].includes(session.user.role);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">活動管理</h1>
        {canManage && (
          <Link
            href="/activities/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto text-center"
          >
            新增活動
          </Link>
        )}
      </div>

      {/* 桌面版表格 */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                活動名稱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                啟用
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最後更新
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
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
                    getActivityStatus(activity.startDate, activity.endDate, activity.enabled).className
                  }`}>
                    {getActivityStatus(activity.startDate, activity.endDate, activity.enabled).status}
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
                      編輯
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
                getActivityStatus(activity.startDate, activity.endDate, activity.enabled).className
              }`}>
                {getActivityStatus(activity.startDate, activity.endDate, activity.enabled).status}
              </span>
              
              {canManage && (
                <Link
                  href={`/activities/${activity.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  編輯
                </Link>
              )}
            </div>
            <div className="text-sm text-gray-500">
              最後更新：{format(activity.updatedAt, 'yyyy/MM/dd HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}