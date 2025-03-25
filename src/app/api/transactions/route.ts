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
    } = body;

    console.log("Processing transaction with splits:", JSON.stringify(splits, null, 2));
    console.log("Number of splits:", splits?.length || 0);

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
      
      // 篩選出要包含的分帳項目
      const includedSplits = splits.filter((split: any) => split.isIncluded !== false);
      console.log("Included splits:", JSON.stringify(includedSplits, null, 2));
      
      // 創建分帳記錄
      for (const split of includedSplits) {
        console.log("Creating split:", JSON.stringify(split, null, 2));
        try {
          const createdSplit = await prisma.transactionSplit.create({
            data: {
              transactionId: transaction.id,
              splitAmount: parseFloat(split.amount),
              description: split.description || null,
              assignedToId: split.assignedToId,
              status: split.splitType || 'EQUAL',
            },
          });
          console.log("Split created:", JSON.stringify(createdSplit, null, 2));
        } catch (error) {
          console.error("Error creating split:", error);
        }
      }
    } else {
      console.log("No splits to process for this transaction.");
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