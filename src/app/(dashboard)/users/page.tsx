import { prisma } from "@/lib/prisma";
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">使用者管理</h1>
        <Link
          href="/users/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          新增使用者
        </Link>
      </div>
      <div className="grid gap-4">
        {users.map((user) => (
          <div 
            key={user.id}
            className="p-4 bg-white rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">
                  角色: {user.role === 'ADMIN' ? '管理員' : '一般使用者'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                建立時間: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 