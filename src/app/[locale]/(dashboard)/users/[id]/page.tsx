import { prisma } from "@/lib/prisma"
import { UserForm } from "@/components/UserForm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { withServerLoading } from '@/lib/prisma-with-loading'

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // 解構並等待 params
  const { id } = await params

  // 獲取用戶詳情
  const user = await withServerLoading(async () => {
    return await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        transactions: true,
        activities: true,
        groups: true,
      },
    });
  });

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">編輯用戶</h1>
        <UserForm user={user} />
      </div>
    </div>
  )
} 