import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify the payment exists and belongs to this transaction
    const payment = await prisma.transactionPayment.findUnique({
      where: { 
        id: params.paymentId,
        transactionId: params.id 
      },
    });

    if (!payment) {
      return new Response("Payment not found", { status: 404 });
    }

    // Delete the payment
    await prisma.transactionPayment.delete({
      where: { id: params.paymentId },
    });

    // Update transaction payment status
    // Check if any payments are left for this transaction
    const remainingPayments = await prisma.transactionPayment.count({
      where: { transactionId: params.id }
    });

    // If no payments left, set transaction to UNPAID
    if (remainingPayments === 0) {
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          paymentStatus: 'UNPAID',
          paidAt: null,
        },
      });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Error deleting payment:", error);
    return new Response("Error deleting payment", { status: 500 });
  }
} 