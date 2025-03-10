import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const edmSchema = z.object({
  title: z.string().min(1, "請輸入標題"),
  content: z.string().min(1, "請輸入內容"),
  images: z.array(z.string()).optional(),
  contactInfo: z.string().optional(),
  registrationLink: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = edmSchema.parse(body);

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: { edm: true },
    });

    if (!activity) {
      return new NextResponse("Activity not found", { status: 404 });
    }

    const edm = await prisma.eDM.upsert({
      where: {
        activityId: params.id,
      },
      update: {
        ...validatedData,
      },
      create: {
        ...validatedData,
        activityId: params.id,
      },
    });

    return NextResponse.json(edm);
  } catch (error) {
    console.error("[EDM_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        edm: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity.edm);
  } catch (error) {
    console.error("Error fetching EDM:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const edm = await prisma.eDM.delete({
      where: {
        activityId: params.id,
      },
    });

    return NextResponse.json(edm);
  } catch (error) {
    console.error("[EDM_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 