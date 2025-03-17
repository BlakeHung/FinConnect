import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GroupList } from "@/components/GroupList";
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function GroupsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // 設置請求的語言環境
  unstable_setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  const t = await getTranslations('groups');
  
  if (!session?.user) {
    redirect('/login');
  }

  try {
    const groups = await prisma.group.findMany({
      where: {
        createdById: session.user.id as string
      },
      include: {
        members: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
          <GroupList groups={groups} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
          <p className="text-red-500">Error loading groups. Please try again later.</p>
        </div>
      </div>
    );
  }
} 