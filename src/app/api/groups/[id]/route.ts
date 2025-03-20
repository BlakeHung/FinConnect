import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 獲取單個群組詳情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const group = await prisma.group.findUnique({
      where: {
        id: params.id
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        activities: {
          include: {
            activity: true
          }
        },
        createdBy: true
      }
    });
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    // 檢查用戶是否有權限訪問該群組
    const isCreator = group.createdById === session.user.id;
    const isMember = group.members.some(member => member.userId === session.user.id);
    
    if (!isCreator && !isMember) {
      return NextResponse.json({ error: 'Not authorized to view this group' }, { status: 403 });
    }
    
    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

// 更新群組信息
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 檢查是否為群組創建者
    const group = await prisma.group.findUnique({
      where: {
        id: params.id,
        createdById: session.user.id
      }
    });
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found or not authorized' }, { status: 404 });
    }
    
    const { name, description } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }
    
    // 更新群組信息
    const updatedGroup = await prisma.group.update({
      where: {
        id: params.id
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });
    
    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

// 刪除群組
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 檢查是否為群組創建者
    const group = await prisma.group.findUnique({
      where: {
        id: params.id,
        createdById: session.user.id
      }
    });
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found or not authorized' }, { status: 404 });
    }
    
    // 刪除群組（由於關係設置為 cascade，成員也會被自動刪除）
    await prisma.group.delete({
      where: {
        id: params.id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
} 