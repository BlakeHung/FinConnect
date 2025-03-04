"use client"

import { useState, useEffect } from "react"
import { Link } from "@/lib/i18n/utils"
import { useClientTranslation } from "@/lib/i18n/utils"
import { DataTable } from "@/components/ui/data-table"
import { useUserColumns } from "./columns"
import { useSession } from "next-auth/react"

// 接收從服務器端傳來的用戶數據
export function UsersContent({ initialUsers }: { initialUsers: any[] }) {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const t = useClientTranslation('users')
  const columns = useUserColumns()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const formattedUsers = initialUsers.map(user => ({
    ...user,
    href: `/users/${user.id}`,
    // 確保 createdAt 是字符串
    createdAt: typeof user.createdAt === 'string' 
      ? user.createdAt 
      : new Date(user.createdAt).toLocaleDateString(),
  }));

  const isDemo = session?.user?.email === 'demo@wchung.tw';

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {!isDemo && (
          <Link
            href="/users/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {t('new')}
          </Link>
        )}
      </div>
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-md">
          {t('demo')}
        </div>
      )}
      <DataTable columns={columns} data={formattedUsers} searchKey="name" />
    </div>
  );
} 