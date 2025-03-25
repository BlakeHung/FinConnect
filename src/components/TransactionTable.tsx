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
import { useTranslations } from 'next-intl';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: Date;
  description?: string;
  updatedAt: Date;
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
}

function formatDate(date: Date) {
  // 使用固定的日期格式，避免服務器端和客戶端的差異
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function TransactionTable({ transactions, activities = [] }: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('transactions');

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

  return (
    <div className="w-full space-y-4">
      {/* 活動篩選 - 只在有活動時顯示 */}
      {activities && activities.length > 0 && (
        <div className="flex items-center space-x-2">
          <Label>{t("activity_filter")}</Label>
          <Select
            value={currentActivityId}
            onValueChange={handleActivityFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("all_activities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_activities")}</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 桌面版表格 */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="date">{t('table.date')}</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.type')}</th>
              <SortableHeader field="amount">{t('table.amount')}</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.description')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.creator')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.activity')}</th>
              <SortableHeader field="updatedAt">{t('table.last_updated')}</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(transaction.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.type === 'EXPENSE' ? t('expense') : t('income')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.category?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.user?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.activity?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(transaction.updatedAt)}
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
                  {transaction.type === 'EXPENSE' ? t('expense') : t('income')}
                </div>
              </div>
              <div className="text-lg font-semibold">
                ${transaction.amount}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {transaction.category?.name || '-'}
            </div>

            {transaction.description && (
              <div className="text-sm text-gray-500">
                {transaction.description}
              </div>
            )}

            <div className="text-sm text-gray-500">
              {t('table.creator')}: {transaction.user.name}
            </div>

            {transaction.activity && (
              <div className="text-sm text-gray-500">
                {t('table.activity')}: {transaction.activity.name}
              </div>
            )}

            <div className="text-sm text-gray-500">
              {t('table.last_updated')}: {formatDate(transaction.updatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 