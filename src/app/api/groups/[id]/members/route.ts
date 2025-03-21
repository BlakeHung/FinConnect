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
    
    // 準備創建成員的數據
    const memberData: any = {
      name,
      group: {
        connect: { id: params.id }
      }
    };
    
    // 只有當userId存在且不為空時才添加用戶關聯
    if (userId && userId.trim() !== '') {
      // 檢查用戶是否存在
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (userExists) {
        memberData.user = {
          connect: { id: userId }
        };
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }
    
    // 創建新成員
    const newMember = await prisma.groupMember.create({
      data: memberData,
      include: {
        user: !!userId // 只有在有userId時才包含user數據
      }
    });
    
    return NextResponse.json(newMember);
  } catch (error) {
    console.error('Error creating group member:', error);
    return NextResponse.json({ error: 'Failed to create group member', details: (error as Error).message }, { status: 500 });
  }
} 