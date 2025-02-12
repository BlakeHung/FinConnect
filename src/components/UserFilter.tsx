"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserFilterProps {
  users: User[];
}

export function UserFilter({ users }: UserFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        篩選使用者：
      </label>
      <select
        className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2"
        value={searchParams.get('userId') || ''}
        onChange={(e) => {
          const value = e.target.value;
          const queryString = createQueryString('userId', value);
          router.push(`/transactions${queryString ? `?${queryString}` : ''}`);
        }}
      >
        <option value="">所有使用者</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
} 