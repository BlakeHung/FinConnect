"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

const edmSchema = z.object({
  title: z.string().min(1, "請輸入標題"),
  content: z.string().min(1, "請輸入內容"),
  images: z.array(z.string()).optional(),
  contactInfo: z.string().optional(),
  registrationLink: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
});

type EdmFormData = z.infer<typeof edmSchema>;

interface EdmFormProps {
  activityId: string;
  defaultValues?: {
    title: string;
    content: string;
    images?: string[];
    contactInfo?: string;
    registrationLink?: string;
  };
}

export function EdmForm({ activityId, defaultValues }: EdmFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EdmFormData>({
    resolver: zodResolver(edmSchema),
    defaultValues,
  });

  const images = watch("images") || [];

  const onSubmit = async (data: EdmFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/activities/${activityId}/edm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("提交失敗");
      }

      router.push(`/activities/${activityId}`);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("提交失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          EDM 標題
        </label>
        <input
          type="text"
          {...register("title")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="輸入吸引人的標題"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          活動內容
        </label>
        <textarea
          {...register("content")}
          rows={10}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="詳細描述活動內容、特色和重要資訊"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          活動圖片
        </label>
        <ImageUpload
          value={images}
          onChange={(urls) => setValue("images", urls)}
          onRemove={(url) => setValue("images", images.filter((i) => i !== url))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          聯絡資訊
        </label>
        <textarea
          {...register("contactInfo")}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="聯絡人、電話、Email 等資訊"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          報名連結
        </label>
        <input
          type="url"
          {...register("registrationLink")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="https://..."
        />
        {errors.registrationLink && (
          <p className="mt-1 text-sm text-red-600">{errors.registrationLink.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "儲存中..." : "儲存 EDM"}
        </button>
      </div>
    </form>
  );
} 