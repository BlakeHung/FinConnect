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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, userId } = await request.json();
    
    // 檢查群組是否存在且當前用戶有權限
    const group = await prisma.group.findUnique({
      where: {
        id: params.id,
        createdById: session.user.id
      }
    });
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found or not authorized' }, { status: 404 });
    }
    
    // 創建新成員
    const newMember = await prisma.groupMember.create({
      data: {
        name,
        userId: userId || undefined, // 如果沒有提供 userId，則設為 undefined
        group: {
          connect: { id: params.id }
        }
      },
      include: {
        user: true // 包含用戶數據
      }
    });
    
    return NextResponse.json(newMember);
  } catch (error) {
    console.error('Error creating group member:', error);
    return NextResponse.json({ error: 'Failed to create group member' }, { status: 500 });
  }
} 