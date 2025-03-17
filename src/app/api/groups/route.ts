import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 獲取所有群組
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const groups = await prisma.group.findMany({
      where: {
        createdById: session.user.id as string
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

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 創建新群組
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name, description, members } = await req.json();

    // 驗證必要欄位
    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 創建群組和成員
    const group = await prisma.group.create({
      data: {
        name,
        description,
        createdById: session.user.id as string,
        members: {
          create: members.map((member: { name: string }) => ({
            name: member.name
          }))
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 