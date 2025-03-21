import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: "未授權" }), {
        status: 401,
      });
    }

    const transactionId = params.id;
    const { splitType, members } = await request.json();

    // 檢查交易是否存在
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ message: "交易不存在" }, { status: 404 });
    }

    // 檢查是否為交易創建者
    if (transaction.userId !== session.user.id) {
      return NextResponse.json({ message: "沒有權限修改此交易" }, { status: 403 });
    }

    // 刪除現有的分帳記錄
    await prisma.transactionMemberSplit.deleteMany({
      where: { transactionId },
    });

    // 過濾出要包含的成員
    const includedMembers = members.filter(m => m.isIncluded);

    if (includedMembers.length === 0) {
      return NextResponse.json({ message: "至少需要選擇一個成員進行分帳" }, { status: 400 });
    }

    // 創建新的分帳記錄
    const splits = includedMembers.map(member => ({
      transactionId,
      groupId: transaction.groupId,
      memberId: member.memberId,
      isIncluded: true,
      splitType,
      splitValue: splitType === 'EQUAL' ? null : member.value,
    }));

    await prisma.transactionMemberSplit.createMany({
      data: splits,
    });

    return NextResponse.json({ message: "分帳成功" });
  } catch (error) {
    console.error("Error splitting transaction:", error);
    return NextResponse.json(
      { message: "處理請求時發生錯誤", error: error.message },
      { status: 500 }
    );
  }
} 