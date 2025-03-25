import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "未授權" }), {
      status: 401,
    });
  }

  try {
    const { id } = params;
    const body = await request.json();
    
    console.log("PUT transaction request body:", JSON.stringify(body, null, 2));
    console.log("Transaction ID for update:", id);
    
    // 檢查事務是否存在
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      console.log("Transaction not found for ID:", id);
      return new Response(JSON.stringify({ message: "無此交易記錄" }), {
        status: 404,
      });
    }

    // 檢查權限
    const isOwner = existingTransaction.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      console.log("Permission denied. User is not owner or admin.");
      return new Response(JSON.stringify({ message: "無權修改此交易" }), {
        status: 403,
      });
    }

    // 準備要更新的數據
    const {
      amount,
      categoryId,
      description,
      date,
      images,
      activityId,
      paymentStatus,
      groupId,
      splits,
    } = body;

    console.log("Processing splits:", JSON.stringify(splits, null, 2));
    console.log("Number of splits submitted:", splits?.length || 0);

    // 更新交易記錄
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        categoryId,
        description,
        date: new Date(date),
        images: images || [],
        activityId: activityId === 'none' ? null : activityId,
        paymentStatus,
        groupId: groupId || null,
      },
    });
    
    console.log("Updated transaction:", JSON.stringify(updatedTransaction, null, 2));

    // 處理分帳數據
    if (splits && splits.length > 0) {
      console.log("Processing split updates...");
      
      // 先刪除舊的分帳數據
      await prisma.transactionSplit.deleteMany({
        where: { transactionId: id },
      });
      
      console.log("Old splits deleted, creating new splits...");
      
      // 篩選出要包含的分帳項目
      const includedSplits = splits.filter((split: any) => split.isIncluded !== false);
      console.log("Included splits:", JSON.stringify(includedSplits, null, 2));
      
      // 創建新的分帳數據
      for (const split of includedSplits) {
        console.log("Creating split:", JSON.stringify(split, null, 2));
        try {
          const createdSplit = await prisma.transactionSplit.create({
            data: {
              transactionId: id,
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

    return new Response(
      JSON.stringify({ message: "更新成功", transaction: updatedTransaction }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating transaction:", error);
    return new Response(JSON.stringify({ message: "更新失敗", error }), {
      status: 500,
    });
  }
} 