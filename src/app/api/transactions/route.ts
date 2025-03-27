import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 定義分帳類型
interface Split {
  amount: number;
  description?: string;
  assignedToId: string;
  isIncluded?: boolean;
  splitType?: string;
  splitItemType?: string;
}

// 定義付款記錄類型
interface Payment {
  payerId: string;
  amount: number;
  paymentMethod?: string;
  note?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("POST transaction request body:", JSON.stringify(body, null, 2));
    
    const {
      amount,
      type,
      categoryId,
      date,
      description,
      images,
      activityId,
      paymentStatus,
      groupId,
      splits,
      payments,
    } = body;

    console.log("Processing transaction with splits:", JSON.stringify(splits, null, 2));
    console.log("Number of splits:", splits?.length || 0);
    console.log("Processing transaction with payments:", JSON.stringify(payments, null, 2));
    console.log("Number of payments:", payments?.length || 0);

    // 創建主交易
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        categoryId,
        date: new Date(date),
        description: description || null,
        images: images || [],
        activityId: activityId === 'none' ? null : activityId,
        paymentStatus: paymentStatus || 'UNPAID',
        userId: session.user.id,
        groupId: groupId || null,
      },
    });
    
    console.log("Created transaction:", JSON.stringify(transaction, null, 2));

    // 處理分帳數據
    if (splits && splits.length > 0) {
      console.log("Processing splits for new transaction...");
      
      // 創建分帳記錄
      for (const split of splits) {
        console.log("Creating split:", JSON.stringify(split, null, 2));
        try {
          const createdSplit = await prisma.transactionSplit.create({
            data: {
              transactionId: transaction.id,
              splitAmount: parseFloat(split.amount),
              description: split.description || null,
              assignedToId: split.assignedToId,
              status: split.splitType || 'EQUAL',
              isIncluded: split.isIncluded !== false,
              splitItemType: split.splitItemType || null,
            },
          });
          console.log("Split created:", JSON.stringify(createdSplit, null, 2));
        } catch (error) {
          // 更詳細的錯誤日誌
          console.error(`Error creating split: ${error.message}`);
        }
      }
    } else {
      console.log("No splits to process for this transaction.");
    }

    // 處理付款記錄
    if (payments && payments.length > 0) {
      console.log("Processing payments for new transaction...");
      
      // 創建付款記錄
      for (const payment of payments) {
        console.log("Creating payment:", JSON.stringify(payment, null, 2));
        try {
          const createdPayment = await prisma.transactionPayment.create({
            data: {
              transactionId: transaction.id,
              payerId: payment.payerId,
              amount: parseFloat(payment.amount),
              paymentMethod: payment.paymentMethod || null,
              note: payment.note || null,
            },
          });
          console.log("Payment record created:", JSON.stringify(createdPayment, null, 2));
        } catch (error) {
          console.error(`Error creating payment record: ${error.message}`);
        }
      }
      
      // 如果有付款記錄且總額等於或超過交易金額，自動更新付款狀態為已付
      const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      if (totalPaid >= parseFloat(amount)) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            paymentStatus: 'PAID',
            paidAt: new Date()
          }
        });
        console.log("Transaction status updated to PAID automatically");
      }
    } else {
      console.log("No payment records to process for this transaction.");
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const activityId = searchParams.get("activityId");

    const where = {
      ...(userId && { userId }),
      ...(activityId && { activityId }),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        activity: true,
        user: true,
        splits: {
          include: {
            assignedTo: true,
          },
        },
        payments: {
          include: {
            payer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 