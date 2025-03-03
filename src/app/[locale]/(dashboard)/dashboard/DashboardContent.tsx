"use client";

import { CalendarDays, Receipt, PieChart } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useClientTranslation, Link } from "@/lib/i18n/utils";

// Activity status helper function
function getActivityStatus(startDate: Date, endDate: Date, t: any) {
  const now = new Date();

  if (now < startDate) {
    return { 
      status: t('dashboard__status_upcoming'), 
      className: 'bg-yellow-100 text-yellow-800' 
    };
  }
  
  if (now > endDate) {
    return { 
      status: t('dashboard__status_ended'), 
      className: 'bg-gray-100 text-gray-800' 
    };
  }
  
  return { 
    status: t('dashboard__status_ongoing'), 
    className: 'bg-green-100 text-green-800' 
  };
}

export function DashboardContent({ stats }: { stats: any }) {
  const [mounted, setMounted] = useState(false);
  const t_dashboard = useClientTranslation('dashboard');
  const t_activities = useClientTranslation('activities');
  const t_transactions = useClientTranslation('transactions');
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{mounted ? t_dashboard('title') : "儀表板"}</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CalendarDays className="h-5 w-5" />
            <h3 className="font-semibold">{mounted ? t_activities('active_activities') : "活動中"}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.activeActivities.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Receipt className="h-5 w-5" />
            <h3 className="font-semibold">{mounted ? t_transactions('monthly_transactions') : "本月交易"}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.recentTransactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">{mounted ? t_transactions('monthly_expenses') : "本月支出"}</h3>
          </div>
          <div className="space-y-4">
            {stats.categoryStats.map((stat: any) => (
              <div key={stat.categoryId} className="space-y-2">
                {/* ... Category stats content remains the same ... */}
              </div>
            ))}
            {stats.categoryStats.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {mounted ? t_transactions('no_expenses') : "本月支出為0"}
              </p>
            )}
          </div>
        </div>

        {/* Active Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">{mounted ? t_activities('active_activities') : "活動中"}</h3>
          </div>
          <div className="divide-y">
            {stats.activeActivities.map((activity: any) => (
              <div key={activity.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link 
                      href={`/activities/${activity.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {activity.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {format(activity.startDate, 'yyyy/MM/dd')} - 
                      {format(activity.endDate, 'yyyy/MM/dd')}
                    </p>
                  </div>
                  {activity.edm && (
                    <Link
                      href={`/edm/activities/${activity.id}/`}
                      className="text-sm text-green-600 hover:underline"
                    >
                      {mounted ? t_activities('view_edm') : "查看 EDM"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {stats.activeActivities.length === 0 && (
              <p className="py-4 text-gray-500 text-center">{mounted ? t_activities('no_activities') : "活動為0"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">{mounted ? t_transactions('title') : "最近交易"}</h3>
        </div>
        <div className="divide-y">
          {stats.recentTransactions.map((transaction: any) => (
            <div key={transaction.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {mounted ? t_transactions('no_description') : "無描述"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.category.name} • 
                    {format(new Date(transaction.date).toLocaleDateString(), 'yyyy/MM/dd')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {mounted ? t_transactions('recorder') : "記錄者"} {transaction.user.name}
                  </p>
                </div>
                <p className="font-medium text-lg">
                  ${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {stats.recentTransactions.length === 0 && (
            <p className="py-4 text-gray-500 text-center">{mounted ? t_transactions('no_transactions') : "交易為0"}</p>
          )}
        </div>
      </div>

      {/* All Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">{mounted ? t_activities('title') : "活動"}</h3>
          </div>
          <Link 
            href="/activities" 
            className="text-sm text-blue-600 hover:underline"
          >
            {mounted ? t_activities('view_all') : "查看所有活動"}
          </Link>
        </div>
        {/* ... All activities content remains similar but using t('dashboard__no_activities') for empty state ... */}
      </div>
    </div>
  );
} 