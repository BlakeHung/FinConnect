"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const activitySchema = z.object({
  name: z.string().min(1, "請輸入活動名稱"),
  startDate: z.string().min(1, "請選擇開始日期"),
  endDate: z.string().min(1, "請選擇結束日期"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  defaultValues?: {
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    status: "ACTIVE" | "INACTIVE";
  };
  activityId?: string;
}

export function ActivityForm({ defaultValues, activityId }: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      startDate: defaultValues.startDate.toISOString().split('T')[0],
      endDate: defaultValues.endDate.toISOString().split('T')[0],
    } : undefined,
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      setIsSubmitting(true);
      
      const url = activityId 
        ? `/api/activities/${activityId}`
        : '/api/activities';
      
      const response = await fetch(url, {
        method: activityId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      router.push('/activities');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          活動名稱
        </label>
        <input
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          開始日期
        </label>
        <input
          type="date"
          {...register("startDate")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          結束日期
        </label>
        <input
          type="date"
          {...register("endDate")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          狀態
        </label>
        <select
          {...register("status")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="ACTIVE">進行中</option>
          <option value="INACTIVE">已結束</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        {isSubmitting ? '處理中...' : activityId ? '更新活動' : '新增活動'}
      </button>
    </form>
  );
} 