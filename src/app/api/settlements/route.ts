import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fromId, toId, amount, groupId, paymentMethod = 'CASH', note } = body;

    // 驗證輸入
    if (!fromId || !toId || !amount || !groupId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 驗證付款人和收款人是否屬於同一個群組
    const [payer, payee] = await Promise.all([
      prisma.groupMember.findUnique({
        where: { id: fromId },
        include: { group: true }
      }),
      prisma.groupMember.findUnique({
        where: { id: toId },
        include: { group: true }
      })
    ]);

    if (!payer || !payee || payer.groupId !== payee.groupId || payer.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Invalid payer or payee' },
        { status: 400 }
      );
    }

    // 確保 SETTLEMENT 類別存在
    let settlementCategory = await prisma.category.findFirst({
      where: { name: 'SETTLEMENT' }
    });

    if (!settlementCategory) {
      settlementCategory = await prisma.category.create({
        data: {
          name: 'SETTLEMENT',
          type: 'EXPENSE',
          isDefault: true
        }
      });
    }

    // 創建一個新的交易來記錄這個結帳付款
    const transaction = await prisma.transaction.create({
      data: {
        description: `Settlement payment from ${payer.name} to ${payee.name}`,
        amount: amount,
        type: 'EXPENSE',
        date: new Date(),
        categoryId: settlementCategory.id,
        userId: session.user.id, // 使用當前登入用戶的 ID
        groupId: groupId,
        paymentStatus: 'PAID',
        status: 'APPROVED',
        splits: {
          create: {
            assignedToId: toId,
            splitAmount: amount,
            status: 'FIXED',
            isIncluded: true
          }
        },
        payments: {
          create: {
            payerId: fromId,
            amount: amount,
            paymentMethod,
            note
          }
        }
      },
      include: {
        category: true,
        splits: {
          include: {
            assignedTo: true
          }
        },
        payments: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Settlement recorded successfully',
      transaction 
    });
  } catch (error) {
    console.error('Error processing settlement:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process settlement'
      },
      { status: 500 }
    );
  }
} 