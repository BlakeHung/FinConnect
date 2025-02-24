import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/table";
import { columns } from "./columns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedUsers = users.map(user => ({
    ...user,
    href: `/users/${user.id}`,
    createdAt: user.createdAt.toLocaleDateString(),
  }));

  const isDemo = session.user.email === 'demo@wchung.tw';

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">使用者管理</h1>
        {!isDemo && (
          <Link
            href="/users/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            新增使用者
          </Link>
        )}
      </div>
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-md">
          Demo 帳號無法新增使用者，請使用其他管理員帳號進行操作。
        </div>
      )}
      <DataTable columns={columns} data={formattedUsers} />
    </div>
  );
} 