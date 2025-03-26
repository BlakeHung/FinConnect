import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { getTranslations } from 'next-intl/server';
import PaymentSummary from "@/components/PaymentSummary";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TransactionPage({
  params,
  searchParams,
}: PageProps) {
  const { id, locale } = await params;
  const queryParams = await searchParams;
  console.log(queryParams);
  const session = await getServerSession(authOptions);
  const t = await getTranslations('transactions');
  
  if (!session) {
    redirect('/login');
  }

  try {
    // 查詢交易資料
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        activity: true,
        user: true,
        splits: {
          include: {
            assignedTo: true
          }
        },
        payments: {
          include: {
            payer: true
          }
        }
      },
    });

    if (!transaction) {
      notFound();
    }

    // 檢查權限
    const isOwner = transaction.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      redirect('/transactions');
    }

    // 檢查使用者權限
    const canEdit = isOwner || isAdmin;
    const hasSplits = transaction.splits.length > 0;

    console.log({
      transactionUserId: transaction.userId,
      sessionUserId: session.user.id,
      userRole: session.user.role,
      canEdit: isOwner || isAdmin
    });

    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t('details')}</h1>
            <div className="space-x-2 flex items-center">
              <ShareButton id={id} type="transaction" />
              <Link
                href="/transactions"
                className="text-gray-600 hover:text-gray-800"
              >
                {t('back')}
              </Link>
              {canEdit && (
                <Link
                  href={`/transactions/${id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {t('edit')}
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-gray-600">{t('amount')}</h3>
              <p className="text-2xl font-bold">${transaction.amount.toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-gray-600">{t('category')}</h3>
              <p>{transaction.category.name}</p>
            </div>

            <div>
              <h3 className="text-gray-600">{t('date')}</h3>
              <p>{new Date(transaction.date).toLocaleDateString()}</p>
            </div>

            <div>
              <h3 className="text-gray-600">{t('description')}</h3>
              <p>{transaction.description || t('no_description')}</p>
            </div>

            <div>
              <h3 className="text-gray-600">{t('recorder')}</h3>
              <p>{transaction.user.name}</p>
            </div>

            {hasSplits && (
              <div className="border-t pt-4">
                <h3 className="text-gray-600 mb-2">{t('split_details')}</h3>
                <div className="space-y-2">
                  {transaction.splits.map((split, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">${split.splitAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{split.description || t('no_description')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{t('assigned_to')}</p>
                          <p className="font-medium">{split.assignedTo.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transaction.images && transaction.images.length > 0 && (
              <div>
                <h3 className="text-gray-600">{t('images')}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {transaction.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Receipt ${index + 1}`}
                      className="rounded-lg w-full object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {transaction.groupId && transaction.splits && transaction.splits.length > 0 && (
              <div className="mt-6">
                <PaymentSummary
                  splits={transaction.splits}
                  payments={transaction.payments}
                  transactionId={transaction.id}
                  locale={locale}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading transaction data:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6 text-red-500">{t('error_loading')}</h1>
          <p>{t('please_try_again')}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }
} 