"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { getActivityStatus } from "@/lib/utils";
import { useTranslations } from 'next-intl';

const activitySchema = z.object({
  name: z.string().min(1, "請輸入活動名稱"),
  startDate: z.string().min(1, "請選擇開始日期"),
  endDate: z.string().min(1, "請選擇結束日期"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  defaultValues?: {
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    enabled: boolean;
  };
  activityId?: string;
}

export function ActivityForm({ defaultValues, activityId }: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations('activity_form');
  const statusT = useTranslations('activities.status_types');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      startDate: defaultValues.startDate.toISOString().split('T')[0],
      endDate: defaultValues.endDate.toISOString().split('T')[0],
      enabled: defaultValues.enabled,
    } : {
      enabled: true,
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      setIsSubmitting(true);
      
      const url = activityId 
        ? `/api/activities/${activityId}`
        : '/api/activities';
      console.log(data)
      const response = await fetch(url, {
        method: activityId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return new Error(t('submit_failed'));
      }

      router.push('/activities');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(t('submit_error_message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = getActivityStatus(
    new Date(watch('startDate')),
    new Date(watch('endDate')),
    watch('enabled'),
    {
      disabled: statusT('disabled'),
      upcoming: statusT('upcoming'),
      ongoing: statusT('ongoing'),
      ended: statusT('ended')
    }
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('activity_name')}
        </label>
        <input
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{t('name_required')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('start_date')}
        </label>
        <input
          type="date"
          {...register("startDate")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">{t('start_date_required')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('end_date')}
        </label>
        <input
          type="date"
          {...register("endDate")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-red-600">{t('end_date_required')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('description')}
        </label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('enabled_status')}
          </label>
          <p className="text-sm text-gray-500">
            {watch('enabled') ? t('activity_enabled') : t('activity_disabled')}
          </p>
        </div>
        <Switch
          checked={watch('enabled')}
          onCheckedChange={(checked) => setValue('enabled', checked)}
        />
      </div>

      <div className="p-4 border rounded-md">
        <span className="text-sm font-medium text-gray-700">{t('current_status')}：</span>
        <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {status.status}
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        {isSubmitting ? t('processing') : activityId ? t('update_activity') : t('add_activity')}
      </button>
    </form>
  );
} 