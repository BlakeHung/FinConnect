import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "未授權" }, { status: 401 });
    }

    const data = await req.json();
    const { 
      amount, 
      categoryId, 
      date, 
      description, 
      type, 
      activityId, 
      images, 
      paymentStatus,
      groupId,
      splitEnabled,
      splitType,
      splitMembers
    } = data;

    // 創建基本交易
    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        type,
        date: new Date(date),
        description,
        images: images || [],
        categoryId,
        activityId: activityId === "none" || !activityId ? null : activityId,
        userId: session.user.id,
        paymentStatus: paymentStatus || "UNPAID",
        groupId: groupId === "none" || !groupId ? null : groupId,
      },
    });

    // 如果啟用了分帳，並且有群組和成員
    if (splitEnabled && groupId && groupId !== "none" && splitMembers?.length > 0) {
      // 過濾出要包含的成員
      const includedMembers = splitMembers.filter(m => m.isIncluded);
      
      // 沒有包含的成員，不進行分帳
      if (includedMembers.length === 0) {
        return NextResponse.json({ transaction }, { status: 201 });
      }
      
      // 創建分帳記錄
      const splits = includedMembers.map(member => ({
        transactionId: transaction.id,
        groupId,
        memberId: member.memberId,
        isIncluded: true,
        splitType,
        splitValue: splitType === 'EQUAL' ? null : member.value,
      }));
      
      // 創建所有分帳記錄
      await prisma.transactionMemberSplit.createMany({
        data: splits,
      });
    }

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { message: "創建交易失敗", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "未授權" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const activityId = searchParams.get("activityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupId = searchParams.get("groupId");

    // 構建查詢條件
    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (activityId) {
      where.activityId = activityId;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        // 設置結束日期為當天的23:59:59，以包含整天
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        activity: true,
        group: true,
        memberSplits: {
          include: {
            member: true,
          }
        }
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "獲取交易失敗", error: error.message },
      { status: 500 }
    );
  }
} 