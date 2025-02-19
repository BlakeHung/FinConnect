import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 只有管理員和財務可以更新付款狀態
    if (!['ADMIN', 'FINANCE_MANAGER'].includes(session.user.role)) {
      return new Response("Forbidden", { status: 403 });
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    return new Response(JSON.stringify(transaction));
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
} 