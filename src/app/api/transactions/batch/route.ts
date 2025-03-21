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
    const { transactions } = body;
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "No transactions provided" }, { status: 400 });
    }
    
    // 批量創建交易
    const createdTransactions = await prisma.$transaction(
      transactions.map(transaction => 
        prisma.transaction.create({
          data: {
            amount: transaction.amount,
            type: transaction.type,
            date: new Date(transaction.date),
            description: transaction.description || "",
            paymentStatus: transaction.paymentStatus || "UNPAID",
            categoryId: transaction.categoryId,
            activityId: transaction.activityId,
            userId: session.user.id,
            createdById: session.user.id,
          }
        })
      )
    );
    
    return NextResponse.json(createdTransactions, { status: 201 });
  } catch (error) {
    console.error("Error creating batch transactions:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
} 