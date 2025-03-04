"use client";

import { useState } from "react";
import { CategoryForm } from "@/components/CategoryForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useClientTranslation } from "@/lib/i18n/utils";

interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  isDefault: boolean;
}

interface CategoriesPageProps {
  categories: Category[];
}

export function CategoriesPageClient({ categories }: CategoriesPageProps) {
  const [selectedType, setSelectedType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const t = useClientTranslation('categories');



  const filteredCategories = categories.filter(
    category => category.type === selectedType
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold">{t('title')}</h2>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          {t('new')}
        </h3>
        <CategoryForm defaultType={selectedType} />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base sm:text-lg font-semibold">
            {t('existing')}
          </h3>
          <div className="flex items-center gap-3">
            <Label htmlFor="type-switch" className="text-sm text-gray-600">
              {selectedType === 'EXPENSE' 
                ? t('expense')
                : t('income')}
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
                  {category.type === 'EXPENSE' 
                    ? t('expense')
                    : t('income')}
                </span>
                {category.isDefault && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                    {t('default')}
                  </span>
                )}
              </div>
              <CategoryForm category={category} />
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="py-4 text-gray-500 text-center text-sm">
              {selectedType === 'EXPENSE' 
                ? t('no_expense')
                : t('no_income')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 