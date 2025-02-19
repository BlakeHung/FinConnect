'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: Date;
  description?: string;
  paymentStatus: string;
  category: {
    name: string;
  };
  user: {
    name: string;
  };
  activity?: {
    id: string;
    name: string;
  };
}

interface Activity {
  id: string;
  name: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  activities: Activity[];
  canManagePayments: boolean;
}

function formatDate(date: Date) {
  // 使用固定的日期格式，避免服務器端和客戶端的差異
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function TransactionTable({ transactions, activities = [], canManagePayments }: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    ids: string[];
    isBatch: boolean;
  }>({
    isOpen: false,
    ids: [],
    isBatch: false,
  });

  // 獲取當前排序狀態
  const currentSortBy = searchParams.get('sortBy') || 'date';
  const currentOrder = searchParams.get('order') || 'desc';

  // 獲取當前活動篩選
  const currentActivityId = searchParams.get('activityId') || 'all';

  // 處理排序
  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentSortBy === field) {
      // 如果點擊當前排序欄位，切換順序
      params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 如果點擊新欄位，設置為降序
      params.set('sortBy', field);
      params.set('order', 'desc');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // 處理活動篩選
  const handleActivityFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 如果選擇 'all'，移除 activityId 參數
    if (value === 'all') {
      params.delete('activityId');
    } else {
      params.set('activityId', value);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // 排序標題組件
  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => {
    const isActive = currentSortBy === field;
    
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          <ArrowUpDown className={`h-4 w-4 transition-opacity ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`} />
        </div>
      </th>
    );
  };

  const handleMarkAsPaid = async (ids: string[]) => {
    try {
      const results = await Promise.all(
        ids.map(id =>
          fetch(`/api/transactions/${id}/payment`, {
            method: 'PUT',
          })
        )
      );

      if (results.some(response => !response.ok)) {
        throw new Error('部分更新失敗');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const unpaidIds = transactions
        .filter(t => t.paymentStatus === 'UNPAID')
        .map(t => t.id);
      setSelectedIds(unpaidIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const openConfirmModal = (ids: string[], isBatch: boolean) => {
    setConfirmModal({
      isOpen: true,
      ids,
      isBatch,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      ids: [],
      isBatch: false,
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* 活動篩選 - 只在有活動時顯示 */}
      {activities && activities.length > 0 && (
        <div className="flex items-center space-x-2">
          <Label>活動篩選</Label>
          <Select
            value={currentActivityId}
            onValueChange={handleActivityFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="全部活動" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部活動</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 確認 Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={() => {
          handleMarkAsPaid(confirmModal.ids);
          closeConfirmModal();
        }}
        title="確認更新付款狀態"
        description={
          confirmModal.isBatch
            ? `確定要將選中的 ${confirmModal.ids.length} 筆交易標記為已付款嗎？`
            : "確定要將此筆交易標記為已付款嗎？"
        }
      />

      {/* 批量操作按鈕 */}
      {canManagePayments && selectedIds.length > 0 && (
        <div className="mb-4">
          <Button
            onClick={() => openConfirmModal(selectedIds, true)}
          >
            標記選中項目為已付款 ({selectedIds.length})
          </Button>
        </div>
      )}
      
      {/* 桌面版表格 */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {canManagePayments && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Checkbox
                    checked={selectedIds.length === transactions.filter(t => t.paymentStatus === 'UNPAID').length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              <SortableHeader field="date">日期</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類型</th>
              <SortableHeader field="amount">金額</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分類</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">說明</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建立者</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付款狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
              >
                {canManagePayments && (
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {transaction.paymentStatus === 'UNPAID' && (
                      <Checkbox
                        checked={selectedIds.includes(transaction.id)}
                        onCheckedChange={(checked) => 
                          handleSelectOne(transaction.id, checked as boolean)
                        }
                      />
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(transaction.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.type === 'EXPENSE' ? '支出' : '收入'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={transaction.paymentStatus === 'PAID' ? 'success' : 'warning'}
                  >
                    {transaction.paymentStatus === 'PAID' ? '已付款' : '未付款'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.activity?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {canManagePayments && transaction.paymentStatus === 'UNPAID' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmModal([transaction.id], false);
                      }}
                    >
                      標記為已付款
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 手機版卡片列表 */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg shadow p-4 space-y-2"
            onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                <div className="font-medium">
                  {transaction.type === 'EXPENSE' ? '支出' : '收入'}
                </div>
              </div>
              <div className="text-lg font-semibold">
                ${transaction.amount}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">{transaction.category.name}</div>
              <Badge
                variant={transaction.paymentStatus === 'PAID' ? 'success' : 'warning'}
              >
                {transaction.paymentStatus === 'PAID' ? '已付款' : '未付款'}
              </Badge>
            </div>

            {transaction.description && (
              <div className="text-sm text-gray-500">
                {transaction.description}
              </div>
            )}

            <div className="text-sm text-gray-500">
              建立者: {transaction.user.name}
            </div>

            {transaction.activity && (
              <div className="text-sm text-gray-500">
                活動: {transaction.activity.name}
              </div>
            )}

            {canManagePayments && transaction.paymentStatus === 'UNPAID' && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Checkbox
                  checked={selectedIds.includes(transaction.id)}
                  onCheckedChange={(checked) => {
                    handleSelectOne(transaction.id, checked as boolean);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmModal([transaction.id], false);
                  }}
                >
                  標記為已付款
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 