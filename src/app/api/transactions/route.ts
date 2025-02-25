import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      title,
      amount,
      type,
      date,
      activityId,  // 從請求中獲取 activityId
      description 
    } = body;

    // 驗證必要欄位
    if (!title || !amount || !type || !date || !activityId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 檢查活動是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return new NextResponse("Activity not found", { status: 404 });
    }

    // 創建交易記錄
    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount,
        type,
        date: new Date(date),
        description,
        activityId,  // 使用請求中提供的 activityId
        status: "PENDING",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sortBy = searchParams.get('sortBy') || 'date';
    const order = searchParams.get('order') || 'desc';

    // 檢查是否有權限查看所有記錄
    const canViewAll = session.user.role === 'ADMIN' || session.user.role === 'FINANCE';

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: canViewAll 
          ? userId || undefined
          : session.user.id,
      },
      include: {
        category: true,
        user: true,
        activity: true,
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    return NextResponse.json({ data: transactions });
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
} 