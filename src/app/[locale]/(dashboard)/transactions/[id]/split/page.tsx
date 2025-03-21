import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionSplitForm } from "@/components/TransactionSplitForm";
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: { locale: string; id: string };
};

export default async function TransactionSplitPage({
  params: { locale, id },
}: PageProps) {
  const t = await getTranslations('transactions');
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // 獲取交易詳情
  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      group: true,
      user: true,
    },
  });

  if (!transaction) {
    redirect(`/${locale}/transactions`);
  }

  // 只有支出才能分帳
  if (transaction.type !== 'EXPENSE') {
    redirect(`/${locale}/transactions`);
  }

  // 只有交易創建者可以分帳
  if (transaction.userId !== session.user.id) {
    redirect(`/${locale}/transactions`);
  }

  // 如果沒有關聯群組，無法分帳
  if (!transaction.groupId) {
    redirect(`/${locale}/transactions`);
  }

  // 獲取群組成員
  const groupMembers = await prisma.groupMember.findMany({
    where: {
      groupId: transaction.groupId,
    },
    include: {
      user: true,
    },
  });

  // 檢查是否已有分帳記錄
  const existingSplits = await prisma.transactionMemberSplit.findMany({
    where: {
      transactionId: transaction.id,
    },
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">
          {t('split_expense')}
        </h1>
        <p className="text-gray-500 mb-6">
          {transaction.description || t('no_description')} - {transaction.amount.toFixed(2)}
        </p>
        
        <TransactionSplitForm 
          transaction={transaction}
          groupMembers={groupMembers}
          existingSplits={existingSplits}
          locale={locale}
        />
      </div>
    </div>
  );
} 