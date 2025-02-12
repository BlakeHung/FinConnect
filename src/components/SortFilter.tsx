"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const sortOptions = [
  { label: "日期（新到舊）", value: "date:desc" },
  { label: "日期（舊到新）", value: "date:asc" },
  { label: "金額（大到小）", value: "amount:desc" },
  { label: "金額（小到大）", value: "amount:asc" },
];

export function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        排序方式：
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