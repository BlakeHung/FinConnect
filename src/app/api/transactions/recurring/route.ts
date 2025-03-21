import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { 
      amount, 
      categoryId, 
      description, 
      type, 
      frequency, 
      startDate, 
      endDate, 
      occurrences 
    } = body;
    
    // 驗證必要的字段
    if (!amount || !categoryId || !frequency || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // 創建定期交易
    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        amount: amount,
        type: type,
        description: description || "",
        frequency: frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        occurrences: occurrences || null,
        lastProcessed: null,
        categoryId: categoryId,
        userId: session.user.id,
        active: true,
      }
    });
    
    // 創建第一筆實際交易
    const firstTransaction = await prisma.transaction.create({
      data: {
        amount: amount,
        type: type,
        date: new Date(startDate),
        description: description ? `${description} (定期)` : "(定期交易)",
        paymentStatus: "UNPAID",
        categoryId: categoryId,
        userId: session.user.id,
        createdById: session.user.id,
        recurringTransactionId: recurringTransaction.id,
      }
    });
    
    // 更新定期交易的 lastProcessed 欄位
    await prisma.recurringTransaction.update({
      where: { id: recurringTransaction.id },
      data: { lastProcessed: new Date() }
    });
    
    return NextResponse.json({ 
      recurringTransaction, 
      firstTransaction 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring transaction:", error);
    return NextResponse.json({ error: "Failed to create recurring transaction" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    return NextResponse.json(recurringTransactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    return NextResponse.json({ error: "Failed to fetch recurring transactions" }, { status: 500 });
  }
} 