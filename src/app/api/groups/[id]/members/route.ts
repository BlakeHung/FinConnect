import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 獲取群組成員
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: params.id
      },
      include: {
        members: true
      }
    });

    if (!group) {
      return new NextResponse('Group not found', { status: 404 });
    }

    // 檢查是否為群組創建者
    if (group.createdById !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(group.members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 添加群組成員
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name } = await req.json();

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: {
        id: params.id
      }
    });

    if (!group) {
      return new NextResponse('Group not found', { status: 404 });
    }

    // 檢查是否為群組創建者
    if (group.createdById !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const member = await prisma.groupMember.create({
      data: {
        name,
        groupId: params.id
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error adding group member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 