"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

const transactionSchema = z.object({
  amount: z.number().positive("金額必須大於 0"),
  categoryId: z.string().min(1, "請選擇類別"),
  date: z.date(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
}

interface Activity {
  id: string;
  name: string;
}

interface TransactionFormProps {
  categories: Category[];
  activities: Activity[];
  type: 'EXPENSE' | 'INCOME';
  defaultValues?: {
    amount: number;
    categoryId: string;
    activityId?: string;
    date: Date;
    description?: string;
    images?: string[];
    paymentStatus?: string;
  };
  transactionId?: string;
  canManagePayments?: boolean;
}

export function TransactionForm({ 
  categories, 
  activities,
  type,
  defaultValues,
  transactionId,
  canManagePayments = false,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(
    defaultValues?.images || []
  );
  const [isPaid, setIsPaid] = useState(defaultValues?.paymentStatus === 'PAID');
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues || {
      date: today,
    }
  });

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "amis_management"); // 替換為你的 Cloudinary upload preset

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dfaittd9e/image/upload", // 替換為你的 Cloudinary cloud name
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = await Promise.all(files.map(handleImageUpload));
      setPreviewImages((prev) => [...prev, ...urls]);
      setValue("images", urls);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      
      const url = transactionId 
        ? `/api/transactions/${transactionId}` 
        : '/api/transactions';
      
      const method = transactionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type,
          paymentStatus: isPaid ? 'PAID' : 'UNPAID',
        }),
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      window.location.href = '/transactions';
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
          金額
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          onKeyDown={(e) => {
            if (!/[\d.]/.test(e.key) && 
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          {...register("amount", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          類別
        </label>
        <select
          {...register("categoryId")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">選擇類別</option>
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
          日期
        </label>
        <input
          type="date"
          {...register("date", { valueAsDate: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          圖片
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageChange}
          className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {previewImages.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={url}
                alt={`Preview ${index}`}
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityId">活動</Label>
        
        <Select
          value={watch('activityId') || 'none'}
          onValueChange={(value) => setValue('activityId', value === 'none' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="選擇活動" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">無活動</SelectItem>
            {activities?.map((activity) => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canManagePayments && (
        <div className="flex items-center space-x-2">
          <Switch
            id="payment-status"
            checked={isPaid}
            onCheckedChange={setIsPaid}
          />
          <Label htmlFor="payment-status">
            {isPaid ? '已付款' : '未付款'}
          </Label>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <LoadingButton
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          取消
        </LoadingButton>
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="儲存中..."
        >
          儲存
        </LoadingButton>
      </div>
    </form>
  );
}