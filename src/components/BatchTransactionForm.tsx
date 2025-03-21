'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { TransactionFormFields } from "@/components/TransactionFormFields";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BatchTransactionForm({ 
  categories, 
  activities,
  type = 'EXPENSE'
}) {
  const t = useTranslations('transactions');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([
    { 
      amount: 0, 
      categoryId: '', 
      date: new Date().toISOString().split('T')[0],
      description: '',
      activityId: 'none'
    }
  ]);

  const addTransaction = () => {
    setTransactions([
      ...transactions, 
      { 
        amount: 0, 
        categoryId: transactions[0].categoryId, // 複製上一個交易的類別
        date: transactions[0].date, // 複製上一個交易的日期
        description: '',
        activityId: transactions[0].activityId // 複製上一個交易的活動
      }
    ]);
  };

  const removeTransaction = (index) => {
    if (transactions.length > 1) {
      const updated = [...transactions];
      updated.splice(index, 1);
      setTransactions(updated);
    }
  };

  const updateTransaction = (index, field, value) => {
    const updated = [...transactions];
    updated[index] = { ...updated[index], [field]: value };
    setTransactions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 驗證
    const hasErrors = transactions.some(
      t => !t.amount || t.amount <= 0 || !t.categoryId || t.categoryId === ''
    );
    
    if (hasErrors) {
      toast.error(t('validation_error'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/transactions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: transactions.map(t => ({
            ...t,
            type,
            activityId: t.activityId === 'none' ? null : t.activityId,
            paymentStatus: 'UNPAID'
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success(t('batch_created_success'));
      router.push('/transactions');
    } catch (error) {
      console.error('Error creating batch transactions:', error);
      toast.error(t('batch_created_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('batch_transactions')}</h2>
        <Button 
          type="button" 
          onClick={addTransaction}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('add_transaction')}
        </Button>
      </div>
      
      {transactions.map((transaction, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{t('transaction')} #{index + 1}</h3>
            {transactions.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeTransaction(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          
          <TransactionFormFields 
            transaction={transaction}
            onChange={(field, value) => updateTransaction(index, field, value)}
            categories={categories}
            activities={activities}
          />
        </div>
      ))}
      
      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </Button>
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText={t('saving')}
        >
          {t('save_all')}
        </LoadingButton>
      </div>
    </form>
  );
} 