import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoriesPageClient } from "./client";
import { setRequestLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { withServerLoading } from '@/lib/prisma-with-loading';

// 移除 'use client' 指令，這是一個伺服器組件
export default async function CategoriesPage({
  params: { locale }
}: {
  params: { locale: Locale }
}) {
  // 在頁面開始時設置 locale
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const categories = await withServerLoading(async () => {
    return await prisma.category.findMany({
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });
  });

  // 將資料傳遞給客戶端組件
  return <CategoriesPageClient categories={categories} />;
} 