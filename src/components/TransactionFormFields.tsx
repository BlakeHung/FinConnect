'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTranslations } from 'next-intl';

export function TransactionFormFields({
  transaction,
  onChange,
  categories,
  activities
}) {
  const t = useTranslations('transactions');
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">{t('amount')}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={transaction.amount || ''}
          onChange={(e) => onChange('amount', parseFloat(e.target.value) || 0)}
          onKeyDown={(e) => {
            if (!/[\d.]/.test(e.key) && 
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </div>
      
      <div>
        <Label htmlFor="categoryId">{t('category')}</Label>
        <Select
          value={transaction.categoryId || ''}
          onValueChange={(value) => onChange('categoryId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select_category')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="date">{t('date')}</Label>
        <Input
          id="date"
          type="date"
          value={transaction.date || ''}
          onChange={(e) => onChange('date', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t('description')}</Label>
        <Input
          id="description"
          value={transaction.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={t('description_placeholder')}
        />
      </div>
      
      <div>
        <Label htmlFor="activityId">{t('activity')}</Label>
        <Select
          value={transaction.activityId || 'none'}
          onValueChange={(value) => onChange('activityId', value === 'none' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select_activity')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('no_activity')}</SelectItem>
            {activities?.map((activity) => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 