import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'FINANCE_MANAGER'].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { enabled } = await request.json();

    const activity = await prisma.activity.update({
      where: {
        id: params.id,
      },
      data: {
        enabled,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 