import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersContent } from "./UsersContent"
import { prisma } from "@/lib/prisma"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // 在服務器端獲取用戶數據
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 格式化日期為字符串，以便可以序列化
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));

  return <UsersContent initialUsers={serializedUsers} />
} 