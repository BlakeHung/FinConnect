import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense) {
      return new NextResponse("Not found", { status: 404 });
    }

    // 檢查權限
    const isOwner = expense.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();

    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        amount: body.amount,
        categoryId: body.categoryId,
        date: new Date(body.date),
        description: body.description,
        images: body.images,
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("[EXPENSE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 