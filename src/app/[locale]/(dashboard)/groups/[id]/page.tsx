import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { GroupDetail } from "@/components/GroupDetail";
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GroupPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  // 設置請求的語言環境
  unstable_setRequestLocale(params.locale);
  
  const session = await getServerSession(authOptions);
  const t = await getTranslations('groups');
  
  if (!session?.user) {
    redirect(`/${params.locale}/login`);
  }

  try {
    // 獲取群組詳情，包括成員和他們關聯的用戶
    const group = await prisma.group.findUnique({
      where: {
        id: params.id
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        activities: true,
        createdBy: true,
        transactions: {
          take: 5,  // 只獲取最新的5條交易
          orderBy: {
            date: 'desc'
          },
          include: {
            category: true
          }
        }
      }
    });

    // 如果群組不存在，導向404頁面
    if (!group) {
      notFound();
    }

    // 檢查用戶權限：用戶是群組創建者或成員
    const isCreator = group.createdById === session.user.id;
    const isMember = group.members.some(member => member.userId === session.user.id);
    
    if (!isCreator && !isMember) {
      // 如果既不是創建者也不是成員，則重定向回群組列表
      redirect(`/${params.locale}/groups`);
    }

    // 獲取系統用戶列表，用於關聯到群組成員
    const systemUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href={`/${params.locale}/groups`}>
              <Button variant="ghost" size="sm" className="mr-2">
                ← {t('backToGroups')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{group.name}</h1>
          </div>
          
          <GroupDetail 
            group={JSON.parse(JSON.stringify(group))} 
            systemUsers={JSON.parse(JSON.stringify(systemUsers))}
            isCreator={isCreator}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching group details:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href={`/${params.locale}/groups`}>
              <Button variant="ghost" size="sm" className="mr-2">
                ← {t('backToGroups')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{t('groupDetails')}</h1>
          </div>
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-destructive">{t('errorLoadingGroupDetails')}</p>
          </div>
        </div>
      </div>
    );
  }
} 