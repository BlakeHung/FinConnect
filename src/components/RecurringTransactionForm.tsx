'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslations } from 'next-intl';
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const recurringSchema = z.object({
  // 基本交易資訊
  amount: z.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  
  // 重複設置
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  occurrences: z.number().int().positive().optional(),
});

export function RecurringTransactionForm({ 
  categories, 
  activities,
  type = 'EXPENSE'
}) {
  const t = useTranslations('transactions');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      amount: 0,
      categoryId: '',
      description: '',
      frequency: 'monthly',
      startDate: new Date(),
    }
  });
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/transactions/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success(t('recurring_created_success'));
      router.push('/transactions/recurring');
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      toast.error(t('recurring_created_error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startDate = watch('startDate');
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 基本交易資訊 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('amount')}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register("amount", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('category')}
        </label>
        <select
          {...register("categoryId")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">{t('select_category')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('description')}
        </label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      
      {/* 重複設置 */}
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-4">{t('recurrence_settings')}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('frequency')}
            </label>
            <select
              {...register("frequency")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="daily">{t('daily')}</option>
              <option value="weekly">{t('weekly')}</option>
              <option value="monthly">{t('monthly')}</option>
              <option value="yearly">{t('yearly')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('start_date')}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : t('pick_date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setValue('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            {t('end_settings')}
          </label>
          <div className="flex items-center mt-2">
            <input
              type="radio"
              id="no-end"
              name="endType"
              value="never"
              className="mr-2"
              onChange={() => {
                setValue('endDate', undefined);
                setValue('occurrences', undefined);
              }}
            />
            <label htmlFor="no-end" className="mr-4">{t('never_ends')}</label>
            
            <input
              type="radio"
              id="end-date"
              name="endType"
              value="date"
              className="mr-2"
            />
            <label htmlFor="end-date" className="mr-2">{t('end_by_date')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className="ml-2"
                  onClick={() => document.getElementById('end-date').checked = true}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('endDate') ? format(watch('endDate'), "PPP") : t('pick_date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('endDate')}
                  onSelect={(date) => {
                    setValue('endDate', date);
                    setValue('occurrences', undefined);
                    document.getElementById('end-date').checked = true;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center mt-2">
            <input
              type="radio"
              id="end-occurrences"
              name="endType"
              value="occurrences"
              className="mr-2"
            />
            <label htmlFor="end-occurrences" className="mr-2">{t('end_after')}</label>
            <input
              type="number"
              min="1"
              className="w-16 px-2 py-1 border rounded"
              onChange={(e) => {
                document.getElementById('end-occurrences').checked = true;
                setValue('occurrences', parseInt(e.target.value));
                setValue('endDate', undefined);
              }}
            />
            <span className="ml-2">{t('occurrences')}</span>
          </div>
        </div>
      </div>
      
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
          {t('save')}
        </LoadingButton>
      </div>
    </form>
  );
} 