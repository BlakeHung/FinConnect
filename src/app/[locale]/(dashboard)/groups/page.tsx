import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { GroupList } from "@/components/GroupList";
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from '@/lib/i18n';
import { CreateGroupButton } from "@/components/CreateGroupButton";
import type { Locale } from '@/lib/i18n';
import { withServerLoading } from '@/lib/prisma-with-loading';

export default async function GroupsPage({
  params: { locale }
}: {
  params: { locale: Locale }
}) {
  // 設置請求的語言環境
  // 在頁面開始時設置 locale
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  const t = await getTranslations('groups');
  
  if (!session?.user) {
    redirect('/login');
  }

  try {
    // 獲取用戶創建的群組
    const createdGroups = await withServerLoading(async () => {
      return await prisma.group.findMany({
        where: {
          createdById: session.user.id
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
    });
    
    // 獲取用戶作為成員參與的群組（基於新增的關聯）
    const memberGroups = await withServerLoading(async () => {
      return await prisma.group.findMany({
        where: {
          members: {
            some: {
              userId: session.user.id
            }
          },
          // 排除用戶創建的群組（避免重複）
          NOT: {
            createdById: session.user.id
          }
        },
        include: {
          members: true,
          createdBy: true,
          _count: {
            select: { members: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    // 合併用戶的所有群組
    const allGroups = [
      ...createdGroups.map(group => ({
        ...group,
        isOwner: true
      })),
      ...memberGroups.map(group => ({
        ...group,
        isOwner: false
      }))
    ];

    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <CreateGroupButton />
          </div>
          
          <GroupList groups={allGroups} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
          <p className="text-red-500">{t('errorLoadingGroups')}</p>
        </div>
      </div>
    );
  }
} 