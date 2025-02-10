import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log("Received data:", data);  // 檢查接收到的數據
    console.log("User session:", session);  // 檢查用戶 session

    // 驗證必要欄位
    if (!data.amount || !data.categoryId || !data.date) {
      return NextResponse.json(
        { error: "Missing required fields", data },
        { status: 400 }
      );
    }

    // 獲取預設活動或第一個活動
    const defaultActivity = await prisma.activity.findFirst({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!defaultActivity) {
      return NextResponse.json(
        { error: "No active activity found" },
        { status: 400 }
      );
    }

    // 創建新的支出記錄
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(data.amount),
        description: data.description || "",
        date: new Date(data.date),
        categoryId: data.categoryId,
        userId: session.user.id,
        activityId: defaultActivity.id, // 使用預設活動
        status: "PENDING",
        images: data.images || [], // 預設空陣列
      },
    });

    console.log("Created expense:", expense);  // 檢查創建的結果

    return NextResponse.json({ data: expense });
    
  } catch (error) {
    // 輸出詳細的錯誤信息
    console.error("Create expense error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        type: "EXPENSE",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
} 