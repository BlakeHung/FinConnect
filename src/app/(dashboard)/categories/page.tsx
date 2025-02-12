"use client";

import { useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/CategoryForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  isDefault: boolean;
}

interface CategoriesPageProps {
  categories: Category[];
}

function CategoriesPageClient({ categories }: CategoriesPageProps) {
  const [selectedType, setSelectedType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const filteredCategories = categories.filter(
    category => category.type === selectedType
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold">分類管理</h2>
      </div>

      {/* 新增分類表單 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold mb-4">新增分類</h3>
        <CategoryForm defaultType={selectedType} />
      </div>

      {/* 分類列表 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base sm:text-lg font-semibold">現有分類</h3>
          <div className="flex items-center gap-3">
            <Label htmlFor="type-switch" className="text-sm text-gray-600">
              {selectedType === 'EXPENSE' ? '支出' : '收入'}
            </Label>
            <Switch
              id="type-switch"
              checked={selectedType === 'INCOME'}
              onCheckedChange={(checked) => 
                setSelectedType(checked ? 'INCOME' : 'EXPENSE')
              }
            />
          </div>
        </div>
        <div className="divide-y">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  category.type === 'EXPENSE' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {category.type === 'EXPENSE' ? '支出' : '收入'}
                </span>
                {category.isDefault && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                    預設
                  </span>
                )}
              </div>
              <CategoryForm category={category} />
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="py-4 text-gray-500 text-center text-sm">
              尚無{selectedType === 'EXPENSE' ? '支出' : '收入'}分類
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Server Component
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

  return <CategoriesPageClient categories={categories} />;
} 