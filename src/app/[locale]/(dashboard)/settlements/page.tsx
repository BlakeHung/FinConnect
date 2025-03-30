import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { Activity, Transaction, TransactionSplit, TransactionPayment, Category, GroupMember } from "@prisma/client";

export default async function SettlementsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('settlements');
  
  if (!session) {
    redirect('/login');
  }

  // 檢查是否有權限訪問結帳中心
  const canAccessSettlements = session.user.role === 'ADMIN' || session.user.role === 'FINANCE_MANAGER';
  if (!canAccessSettlements) {
    redirect('/dashboard');
  }

  // 獲取所有交易資料及其關聯
  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
      splits: {
        include: {
          assignedTo: true
        }
      },
      payments: true,
      activity: true,
      group: true
    }
  });

  // 根據交易資料組織群組和活動
  const groupMap = new Map();
  
  transactions.forEach(transaction => {
    if (!transaction.group || !transaction.activity) return;

    const groupId = transaction.group.id;
    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        id: groupId,
        name: transaction.group.name,
        members: new Map(),
        activities: new Map()
      });
    }

    const group = groupMap.get(groupId);
    
    // 處理群組成員
    transaction.splits.forEach(split => {
      if (!split.isIncluded) return;
      const memberId = split.assignedToId;
      if (!group.members.has(memberId)) {
        group.members.set(memberId, {
          id: memberId,
          name: split.assignedTo.name,
          totalOwed: 0,
          totalPaid: 0,
          byActivity: new Map()
        });
      }
    });

    // 處理活動
    const activityId = transaction.activity.id;
    if (!group.activities.has(activityId)) {
      group.activities.set(activityId, {
        id: activityId,
        name: transaction.activity.name,
        transactions: []
      });
    }

    // 添加交易到活動中
    group.activities.get(activityId).transactions.push(transaction);
  });

  // 轉換 Map 為陣列並計算餘額
  const groupSettlements = Array.from(groupMap.values()).map(group => {
    // 計算每個成員的餘額
    group.members.forEach(member => {
      // 計算每個活動的餘額
      group.activities.forEach(activity => {
        member.byActivity.set(activity.id, {
          activityName: activity.name,
          owed: 0,
          paid: 0
        });

        // 計算交易金額
        activity.transactions.forEach(transaction => {
          // 計算應付金額
          transaction.splits.forEach(split => {
            if (split.assignedToId === member.id && split.isIncluded) {
              member.totalOwed += split.splitAmount;
              const activityBalance = member.byActivity.get(activity.id);
              if (activityBalance) {
                activityBalance.owed += split.splitAmount;
              }
            }
          });

          // 計算已付金額
          transaction.payments.forEach(payment => {
            if (payment.payerId === member.id) {
              member.totalPaid += payment.amount;
              const activityBalance = member.byActivity.get(activity.id);
              if (activityBalance) {
                activityBalance.paid += payment.amount;
              }
            }
          });
        });
      });
    });

    // 計算成員間的債務關係
    const members = Array.from(group.members.values());
    const settlements = [];
    
    // 找出需要付錢和收錢的成員，並按照金額排序
    const debtors = members
      .filter(m => m.totalPaid - m.totalOwed < 0)
      .sort((a, b) => (a.totalPaid - a.totalOwed) - (b.totalPaid - b.totalOwed)); // 由小到大（欠最多的排前面）

    const creditors = members
      .filter(m => m.totalPaid - m.totalOwed > 0)
      .sort((a, b) => (b.totalPaid - b.totalOwed) - (a.totalPaid - a.totalOwed)); // 由大到小（應收最多的排前面）

    // 處理每個債務人
    debtors.forEach(debtor => {
      let remainingDebt = Math.abs(debtor.totalPaid - debtor.totalOwed); // 這個人總共要付多少
      let creditorIndex = 0;

      // 依序分配給債權人，直到還清債務
      while (remainingDebt > 0 && creditorIndex < creditors.length) {
        const creditor = creditors[creditorIndex];
        const creditorRemaining = creditor.totalPaid - creditor.totalOwed; // 這個人還能收多少

        if (creditorRemaining > 0) {
          const amount = Math.min(remainingDebt, creditorRemaining);
          settlements.push({
            from: debtor,
            to: creditor,
            amount: amount,
            status: 'PENDING' as const
          });

          // 更新剩餘金額
          remainingDebt -= amount;
          creditors[creditorIndex] = {
            ...creditor,
            totalPaid: creditor.totalPaid - amount // 減少可收金額
          };
        }

        creditorIndex++;
      }
    });

    return {
      id: group.id,
      name: group.name,
      members: members,
      activities: Array.from(group.activities.values()),
      settlements
    };
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      
      {/* 群體列表 */}
      <div className="space-y-8">
        {groupSettlements.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">{group.name}</h2>
            
            {/* 結帳建議 */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">{t('settlement_suggestions')}</h3>
              <div className="space-y-4">
                {group.settlements.map((settlement, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-red-600">{settlement.from.name}</span>
                      <span>→</span>
                      <span className="font-medium text-green-600">{settlement.to.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">${settlement.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 群體成員總結餘 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t('total_balances')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.members.map(member => (
                  <div key={member.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className={`font-bold ${
                        member.totalPaid - member.totalOwed >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${(member.totalPaid - member.totalOwed).toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{t('total_owed')}: ${member.totalOwed.toFixed(2)}</p>
                      <p>{t('total_paid')}: ${member.totalPaid.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 詳細資訊折疊面板 */}
            <div className="border-t pt-6">
              <details className="group">
                <summary className="cursor-pointer flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('detailed_info')}</h3>
                  <svg className="w-5 h-5 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 space-y-8">
                  {group.members.map(member => (
                    <div key={member.id} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-lg mb-4">{member.name}</h4>
                      
                      {/* 活動總覽 */}
                      <div className="mb-6">
                        <h5 className="font-medium mb-2">{t('activity_summary')}</h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                              <tr>
                                <th className="px-4 py-2 text-left">{t('activity')}</th>
                                <th className="px-4 py-2 text-right">{t('owed')}</th>
                                <th className="px-4 py-2 text-right">{t('paid_amount')}</th>
                                <th className="px-4 py-2 text-right">{t('balance')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {Array.from(member.byActivity.values()).map((activityBalance, index) => (
                                <tr key={index} className="hover:bg-white">
                                  <td className="px-4 py-2">{activityBalance.activityName}</td>
                                  <td className="px-4 py-2 text-right">${activityBalance.owed.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-right">${activityBalance.paid.toFixed(2)}</td>
                                  <td className={`px-4 py-2 text-right font-medium ${
                                    activityBalance.paid - activityBalance.owed >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ${(activityBalance.paid - activityBalance.owed).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 交易明細 */}
                      <div>
                        <h5 className="font-medium mb-2">{t('transaction_details')}</h5>
                        <div className="space-y-4">
                          {group.activities.map(activity => (
                            activity.transactions.map(transaction => {
                              const splits = transaction.splits.filter(split => split.assignedToId === member.id);
                              const payments = transaction.payments.filter(payment => payment.payerId === member.id);
                              
                              if (splits.length === 0 && payments.length === 0) return null;

                              return (
                                <div key={transaction.id} className="bg-white p-4 rounded-md shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-medium">{transaction.description || t('no_description')}</p>
                                      <p className="text-sm text-gray-600">
                                        {activity.name} - {transaction.category.name}
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </p>
                                  </div>

                                  {splits.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium text-gray-600">{t('split_details')}:</p>
                                      {splits.map(split => (
                                        <div key={split.id} className="ml-4 text-sm">
                                          <p>
                                            {t('amount')}: ${split.splitAmount.toFixed(2)} 
                                            ({t(`split_types.${split.status}`)})
                                            {split.description && ` - ${split.description}`}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {payments.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium text-gray-600">{t('payment_details')}:</p>
                                      {payments.map(payment => (
                                        <div key={payment.id} className="ml-4 text-sm">
                                          <p>
                                            {t('paid_amount')}: ${payment.amount.toFixed(2)}
                                            {payment.paymentMethod && ` (${t(`payment_method_types.${payment.paymentMethod}`)})`}
                                            {payment.note && ` - ${payment.note}`}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 