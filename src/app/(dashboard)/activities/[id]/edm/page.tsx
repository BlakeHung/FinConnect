import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EdmForm } from "@/components/EdmForm";

interface EdmPageProps {
  params: {
    id: string;
  };
}

export default async function ActivityEdmPage({
  params,
}: EdmPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }

  const { id } = params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      edm: true,
    },
  });

  if (!activity) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">編輯活動 EDM</h1>
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">{activity.name}</h2>
          <p className="text-sm text-gray-500">
            {new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}
          </p>
        </div>
        <EdmForm 
          activityId={activity.id}
          defaultValues={activity.edm || undefined}
        />
      </div>
    </div>
  );
} 