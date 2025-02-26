"use client";

import { CalendarDays, Receipt, PieChart } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";

// Activity status helper function
function getActivityStatus(startDate: Date, endDate: Date) {
  const now = new Date();
  const { t } = useLanguage();
  
  if (now < startDate) {
    return { 
      status: t.dashboard__status_upcoming, 
      className: 'bg-yellow-100 text-yellow-800' 
    };
  }
  
  if (now > endDate) {
    return { 
      status: t.dashboard__status_ended, 
      className: 'bg-gray-100 text-gray-800' 
    };
  }
  
  return { 
    status: t.dashboard__status_ongoing, 
    className: 'bg-green-100 text-green-800' 
  };
}

export function DashboardContent({ stats }: { stats: any }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.dashboard__title}</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CalendarDays className="h-5 w-5" />
            <h3 className="font-semibold">{t.dashboard__active_activities}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.activeActivities.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Receipt className="h-5 w-5" />
            <h3 className="font-semibold">{t.dashboard__monthly_transactions}</h3>
          </div>
          <p className="text-2xl font-bold">{stats.recentTransactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">{t.dashboard__monthly_expenses}</h3>
          </div>
          <div className="space-y-4">
            {stats.categoryStats.map((stat: any) => (
              <div key={stat.categoryId} className="space-y-2">
                {/* ... Category stats content remains the same ... */}
              </div>
            ))}
            {stats.categoryStats.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {t.dashboard__no_expenses}
              </p>
            )}
          </div>
        </div>

        {/* Active Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">{t.dashboard__active_activities}</h3>
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
                      {t.dashboard__view_edm}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {stats.activeActivities.length === 0 && (
              <p className="py-4 text-gray-500 text-center">{t.dashboard__no_activities}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">{t.dashboard__recent_transactions}</h3>
        </div>
        <div className="divide-y">
          {stats.recentTransactions.map((transaction: any) => (
            <div key={transaction.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {transaction.description || t.dashboard__no_description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.category.name} • 
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.dashboard__recorder} {transaction.user.name}
                  </p>
                </div>
                <p className="font-medium text-lg">
                  ${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {stats.recentTransactions.length === 0 && (
            <p className="py-4 text-gray-500 text-center">{t.dashboard__no_transactions}</p>
          )}
        </div>
      </div>

      {/* All Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">{t.activities__title}</h3>
          </div>
          <Link 
            href="/activities" 
            className="text-sm text-blue-600 hover:underline"
          >
            {t.dashboard__view_all}
          </Link>
        </div>
        {/* ... All activities content remains similar but using t.dashboard__no_activities for empty state ... */}
      </div>
    </div>
  );
} 