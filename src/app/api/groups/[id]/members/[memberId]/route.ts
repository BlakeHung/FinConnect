import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 更新群組成員
export async function PUT(
  request: Request,
  { params }: { params: { id: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, userId } = await request.json();
    
    // 檢查成員是否存在且屬於當前用戶的群組
    const member = await prisma.groupMember.findFirst({
      where: {
        id: params.memberId,
        group: {
          id: params.id,
          createdById: session.user.id
        }
      }
    });
    
    if (!member) {
      return NextResponse.json({ error: 'Member not found or not authorized' }, { status: 404 });
    }
    
    // 更新成員
    const updatedMember = await prisma.groupMember.update({
      where: {
        id: params.memberId
      },
      data: {
        name,
        userId: userId || null // 允許清除用戶關聯
      },
      include: {
        user: true // 包含用戶數據
      }
    });
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating group member:', error);
    return NextResponse.json({ error: 'Failed to update group member' }, { status: 500 });
  }
}

// 刪除群組成員
export async function DELETE(
  request: Request,
  { params }: { params: { id: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 檢查成員是否存在且屬於當前用戶的群組
    const member = await prisma.groupMember.findFirst({
      where: {
        id: params.memberId,
        group: {
          id: params.id,
          createdById: session.user.id
        }
      }
    });
    
    if (!member) {
      return NextResponse.json({ error: 'Member not found or not authorized' }, { status: 404 });
    }
    
    // 刪除成員
    await prisma.groupMember.delete({
      where: {
        id: params.memberId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group member:', error);
    return NextResponse.json({ error: 'Failed to delete group member' }, { status: 500 });
  }
} 