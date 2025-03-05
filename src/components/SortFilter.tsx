"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from 'next-intl';

export function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('filters');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        const [field, order] = value.split(':');
        params.set('sortBy', field);
        params.set('order', order);
      } else {
        params.delete('sortBy');
        params.delete('order');
      }
      return params.toString();
    },
    [searchParams]
  );

  const currentSort = `${searchParams.get('sortBy') || 'date'}:${searchParams.get('order') || 'desc'}`;

  const sortOptions = [
    { label: t("sort.date_desc"), value: "date:desc" },
    { label: t("sort.date_asc"), value: "date:asc" },
    { label: t("sort.amount_desc"), value: "amount:desc" },
    { label: t("sort.amount_asc"), value: "amount:asc" },
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        {t("sort_label")}
      </label>
      <select
        className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2"
        value={currentSort}
        onChange={(e) => {
          const queryString = createQueryString('sort', e.target.value);
          router.push(`/transactions${queryString ? `?${queryString}` : ''}`);
        }}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
} 