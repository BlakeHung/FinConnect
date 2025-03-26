import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 只有管理員和財務可以更新付款狀態
    if (!['ADMIN', 'FINANCE_MANAGER'].includes(session.user.role)) {
      return new Response("Forbidden", { status: 403 });
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    return new Response(JSON.stringify(transaction));
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const { payerId, amount, paymentMethod, note, splitId } = data;

    if (!payerId || !amount) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Verify the transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        splits: true,
      },
    });

    if (!transaction) {
      return new Response("Transaction not found", { status: 404 });
    }

    // Verify the split exists and belongs to this transaction
    if (splitId) {
      const splitExists = transaction.splits.some(s => s.id === splitId);
      if (!splitExists) {
        return new Response("Split not found for this transaction", { status: 404 });
      }
    }

    // Create the payment record
    const payment = await prisma.transactionPayment.create({
      data: {
        transactionId: params.id,
        payerId,
        amount,
        paymentMethod: paymentMethod || "未指定",
        note,
      },
    });

    // Check if all splits have corresponding payments
    const allSplits = await prisma.transactionSplit.findMany({
      where: { 
        transactionId: params.id,
        isIncluded: true 
      },
      include: {
        assignedTo: true
      }
    });
    
    const payments = await prisma.transactionPayment.findMany({
      where: { transactionId: params.id }
    });
    
    // Check if every split has a corresponding payment
    const allSplitsPaid = allSplits.every(split => {
      if (!split.assignedTo?.userId) return false;
      
      return payments.some(payment => 
        payment.payerId === split.assignedTo?.userId && 
        payment.amount === split.splitAmount
      );
    });

    // If all splits have been paid, mark the transaction as PAID
    if (allSplitsPaid) {
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          paymentStatus: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    return new Response(JSON.stringify(payment));
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response("Error creating payment", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Extract payment ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const paymentId = pathParts[pathParts.length - 1];

    if (!paymentId) {
      return new Response("Payment ID is required", { status: 400 });
    }

    // Verify the payment exists and belongs to this transaction
    const payment = await prisma.transactionPayment.findUnique({
      where: { 
        id: paymentId,
        transactionId: params.id 
      },
    });

    if (!payment) {
      return new Response("Payment not found", { status: 404 });
    }

    // Delete the payment
    await prisma.transactionPayment.delete({
      where: { id: paymentId },
    });

    // Update transaction payment status to UNPAID
    await prisma.transaction.update({
      where: { id: params.id },
      data: {
        paymentStatus: 'UNPAID',
        paidAt: null,
      },
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Error deleting payment:", error);
    return new Response("Error deleting payment", { status: 500 });
  }
} 