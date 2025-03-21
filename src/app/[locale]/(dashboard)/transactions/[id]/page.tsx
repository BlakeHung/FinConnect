import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { TransactionDetail } from "@/components/TransactionDetail";
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function TransactionDetailPage({
  params: { id, locale },
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      category: true,
      activity: true,
      payments: {
        include: {
          payer: true,
        }
      },
      splits: {
        include: {
          member: {
            include: {
              user: true,
            }
          }
        }
      },
      createdBy: true,
    },
  });

  if (!transaction) {
    notFound();
  }
  
  // 確保當前用戶是交易的創建者
  const isCreator = transaction.createdById === session.user.id;
  
  // 獲取分類列表（用於編輯）
  const categories = await prisma.category.findMany({
    where: {
      type: transaction.type,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  // 獲取活動列表（用於編輯）
  const activities = await prisma.activity.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      startDate: 'desc',
    },
    select: {
      id: true,
      name: true,
    },
  });
  
  // 獲取群組和成員（用於分攤）
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { createdById: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <TransactionDetail 
          transaction={JSON.parse(JSON.stringify(transaction))}
          categories={categories}
          activities={activities}
          groups={groups}
          isCreator={isCreator}
          locale={locale}
        />
      </div>
    </div>
  );
} 