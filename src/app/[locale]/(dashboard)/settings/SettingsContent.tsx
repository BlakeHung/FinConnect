"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

const profileSchema = z.object({
  name: z.string().min(1, "請輸入姓名"),
  email: z.string().email("請輸入有效的電子郵件"),
  image: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function SettingContent({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useSession();
  const t = useTranslations('settings');

  // 創建帶有翻譯錯誤消息的 schema
  const localizedProfileSchema = z.object({
    name: z.string().min(1, t('name_required')),
    email: z.string().email(t('valid_email_required')),
    image: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(localizedProfileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t('update_failed'));
      }

      // 更新 session 資料
      await update({
        name: data.name,
        image: data.image,
      });

      toast.success(t('profile_updated'));
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('update_error_message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDemo = user.email === 'demo@wchung.tw';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('account_settings')}</h1>
      
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
          <p className="text-amber-800">
            {t('demo_account_message')}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('name')}
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
            {t('email')}
          </label>
          <input
            type="email"
            {...register("email")}
            disabled={true}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('email_cannot_change')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('profile_image')}
          </label>
          <input
            type="url"
            {...register("image")}
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('image_url_hint')}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isDemo}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? t('updating') : t('update_profile')}
        </button>
      </form>
    </div>
  );
}