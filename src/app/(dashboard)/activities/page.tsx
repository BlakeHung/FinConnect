import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }

  const activities = await prisma.activity.findMany({
    include: {
      _count: {
        select: { expenses: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活動管理</h1>
        <Link
          href="/activities/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          新增活動
        </Link>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Link 
            key={activity.id}
            href={`/activities/${activity.id}`}
          >
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{activity.name}</h3>
                  <p className="text-sm text-gray-500">
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
              </div>
            </div>
          </Link>
        ))}
        {activities.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            還沒有任何活動
          </div>
        )}
      </div>
    </div>
  );
}