import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "分類名稱為必填"),
  type: z.enum(["EXPENSE", "INCOME"]),
  isDefault: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: validatedData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
} 