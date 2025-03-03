"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import Link from "next/link"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "名稱",
    cell: ({ row }) => {
      const user = row.original
      return (
        <Link 
          href={`/users/${user.id}`}
          className="flex items-center gap-2 hover:underline"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </Link>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "角色",
    cell: ({ row }) => {
      const roleMap = {
        ADMIN: "管理員",
        FINANCE_MANAGER: "財務主記帳",
        USER: "一般用戶",
      }
      return roleMap[row.getValue("role") as keyof typeof roleMap] || row.getValue("role")
    },
  },
  {
    accessorKey: "createdAt",
    header: "建立時間",
  },
] 