import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
    });
    // 移除密碼後再返回
    const { ...userWithoutPassword } = user;    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USER_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 