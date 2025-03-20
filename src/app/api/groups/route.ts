import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 獲取所有群組
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 獲取用戶創建的群組
    const createdGroups = await prisma.group.findMany({
      where: {
        createdById: session.user.id
      },
      include: {
        members: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 獲取用戶作為成員參與的群組
    const memberGroups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        },
        NOT: {
          createdById: session.user.id
        }
      },
      include: {
        members: true,
        createdBy: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 合併並標記群組
    const allGroups = [
      ...createdGroups.map(group => ({
        ...group,
        isOwner: true
      })),
      ...memberGroups.map(group => ({
        ...group,
        isOwner: false
      }))
    ];
    
    return NextResponse.json(allGroups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

// 創建新群組
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, description } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }
    
    // 創建新群組
    const newGroup = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: {
          connect: { id: session.user.id }
        }
      }
    });
    
    return NextResponse.json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
} 