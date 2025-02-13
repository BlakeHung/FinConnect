import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoriesPageClient } from "./client";

// 移除 'use client' 指令，這是一個伺服器組件
export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const categories = await prisma.category.findMany({
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });

  // 將資料傳遞給客戶端組件
  return <CategoriesPageClient categories={categories} />;
} 