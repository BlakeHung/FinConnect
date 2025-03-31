"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

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
  const { data: session } = useSession();
  const t = useTranslations('edm_form');

  // 創建帶有翻譯錯誤消息的 schema
  const localizedEdmSchema = z.object({
    title: z.string().min(1, t('title_required')),
    content: z.string().min(1, t('content_required')),
    images: z.array(z.string()).optional(),
    contactInfo: z.string().optional(),
    registrationLink: z.string().url(t('valid_url_required')).optional().or(z.literal("")),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EdmFormData>({
    resolver: zodResolver(localizedEdmSchema),
    defaultValues,
  });

  const images = watch("images") || [];

  const onSubmit = async (data: EdmFormData) => {
    if (session?.user?.email === 'demo@wchung.tw' && data.images?.length > 0) {
      toast.error(t('demo_account_image_error'));
      return;
    }

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
        return new Error(t('submission_failed'));
      }

      router.push(`/activities/${activityId}`);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('submission_error_message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDemo = session?.user?.email === 'demo@wchung.tw';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('edm_title')}
        </label>
        <input
          type="text"
          {...register("title")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder={t('title_placeholder')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('activity_content')}
        </label>
        <textarea
          {...register("content")}
          rows={10}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder={t('content_placeholder')}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('activity_images')}
        </label>
        {isDemo && (
          <p className="text-sm text-amber-600 mb-2">
            {t('demo_account_warning')}
          </p>
        )}
        <ImageUpload
          value={images}
          onChange={(urls) => setValue("images", urls)}
          onRemove={(url) => setValue("images", images.filter((i) => i !== url))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('contact_info')}
        </label>
        <textarea
          {...register("contactInfo")}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder={t('contact_info_placeholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('registration_link')}
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
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? t('saving') : t('save_edm')}
        </button>
      </div>
    </form>
  );
} 