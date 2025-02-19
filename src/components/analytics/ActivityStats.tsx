import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityStat {
  id: string;
  name: string;
  totalExpense: number;
  unpaidAmount: number;
  transactionCount: number;
}

export function ActivityStats({ activities }: { activities: ActivityStat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader>
            <CardTitle className="text-lg">{activity.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">總支出</dt>
                <dd className="text-sm font-medium">
                  ${activity.totalExpense.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">待付款</dt>
                <dd className="text-sm font-medium text-yellow-600">
                  ${activity.unpaidAmount.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">交易筆數</dt>
                <dd className="text-sm font-medium">
                  {activity.transactionCount}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 