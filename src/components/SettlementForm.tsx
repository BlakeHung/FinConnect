'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SettlementFormProps {
  fromId: string;
  toId: string;
  amount: number;
  groupId: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  transaction?: any;
}

export default function SettlementForm({ fromId, toId, amount, groupId }: SettlementFormProps) {
  const t = useTranslations('settlements');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      fromId: formData.get('fromId'),
      toId: formData.get('toId'),
      amount: Number(formData.get('amount')),
      groupId: formData.get('groupId'),
      paymentMethod: formData.get('paymentMethod'),
      note: formData.get('note')
    };

    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process settlement');
      }

      if (result.success) {
        setSuccess(true);
        // 延遲重新載入，讓用戶看到成功訊息
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to process settlement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-green-600 text-sm">
        {t('payment_success')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-4">
      <input type="hidden" name="fromId" value={fromId} />
      <input type="hidden" name="toId" value={toId} />
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="groupId" value={groupId} />
      
      {/* 付款方式選擇 */}
      <select 
        name="paymentMethod" 
        className="border rounded-md px-3 py-2 text-sm"
        required
      >
        <option value="CASH">{t('payment_method_types.cash')}</option>
        <option value="BANK_TRANSFER">{t('payment_method_types.bank_transfer')}</option>
        <option value="CREDIT_CARD">{t('payment_method_types.credit_card')}</option>
        <option value="MOBILE_PAYMENT">{t('payment_method_types.mobile_payment')}</option>
        <option value="OTHER">{t('payment_method_types.other')}</option>
      </select>

      {/* 備註欄位 */}
      <input
        type="text"
        name="note"
        placeholder={t('note_placeholder')}
        className="border rounded-md px-3 py-2 text-sm"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? t('processing') : t('mark_as_paid')}
      </button>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </form>
  );
} 