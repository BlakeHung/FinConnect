import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GroupDetail } from "@/components/GroupDetail";
import { getTranslations } from 'next-intl/server';

interface GroupPageProps {
  params: {
    id: string;
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('groups');
  
  if (!session?.user) {
    redirect('/login');
  }

  const group = await prisma.group.findUnique({
    where: {
      id: params.id
    },
    include: {
      members: true,
      activities: {
        include: {
          activity: true
        }
      }
    }
  });

  if (!group) {
    notFound();
  }

  // 檢查是否為群組創建者
  if (group.createdById !== session.user.id) {
    redirect('/groups');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <GroupDetail group={group} />
      </div>
    </div>
  );
} 