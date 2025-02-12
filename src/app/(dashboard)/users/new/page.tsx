import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserForm } from "@/components/UserForm";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">新增使用者</h1>
        <UserForm />
      </div>
    </div>
  );
} 