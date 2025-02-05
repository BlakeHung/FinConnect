import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const expense = await prisma.expense.create({
      data: {
        ...data,
        images: data.images || [],
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
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