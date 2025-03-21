import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/TransactionForm";
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: { locale: string; id: string };
};

export default async function EditTransactionPage({
  params: { locale, id },
}: PageProps) {
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // 獲取交易詳情，包括分帳數據
  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      memberSplits: true, // 包含分帳記錄
    },
  });

  if (!transaction) {
    redirect(`/${locale}/transactions`);
  }

  // 如果不是創建者，則無法編輯
  if (transaction.userId !== session.user.id) {
    redirect(`/${locale}/transactions`);
  }

  // 獲取分類列表
  const categories = await prisma.category.findMany({
    where: {
      type: transaction.type,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // 獲取活動列表
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

  // 獲取用戶的群組，包含成員數據
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { createdById: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      members: {
        select: {
          id: true,
          name: true,
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    },
  });

  // 如果有分帳記錄，獲取分帳詳情
  let splitData = null;
  if (transaction.memberSplits && transaction.memberSplits.length > 0) {
    // 確定分帳類型
    const splitType = transaction.memberSplits[0].splitType;
    
    // 如果群組有變更，需要重新獲取成員
    if (transaction.groupId) {
      const groupMembers = await prisma.groupMember.findMany({
        where: {
          groupId: transaction.groupId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });
      
      splitData = {
        splitEnabled: true,
        splitType,
        splitMembers: groupMembers.map(member => {
          const split = transaction.memberSplits.find(s => s.memberId === member.id);
          return {
            memberId: member.id,
            isIncluded: split ? true : false,
            value: split ? split.splitValue : undefined,
          };
        })
      };
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {t('edit_transaction')}
        </h1>
        <TransactionForm 
          type={transaction.type} 
          categories={categories}
          activities={activities}
          groups={groups}
          defaultValues={{
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            date: transaction.date.toISOString().split('T')[0],
            description: transaction.description || '',
            images: transaction.images || [],
            activityId: transaction.activityId || 'none',
            groupId: transaction.groupId || 'none',
            paymentStatus: transaction.paymentStatus,
            splitEnabled: splitData ? true : false,
          }}
          splitData={splitData}
          transactionId={transaction.id}
          canManagePayments={true}
        />
      </div>
    </div>
  );
} 