import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentForm from "@/components/PaymentForm";
import { notFound } from "next/navigation";

export default async function RecordPaymentPage({
  params: { id, splitId, locale },
}: {
  params: { id: string; splitId: string; locale: string };
}) {
  const t = await getTranslations('settlements');
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t("unauthorized")}</p>
      </div>
    );
  }

  // Fetch transaction and split details
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      group: true,
      category: true,
      user: true,
      splits: {
        include: {
          assignedTo: true,
        },
      },
      payments: true,
    },
  });

  if (!transaction) {
    return notFound();
  }

  // Find the specific split
  const split = transaction.splits.find(s => s.id === splitId);
  
  if (!split) {
    return notFound();
  }

  // Check if a payment already exists for this split
  const existingPayment = transaction.payments.find(
    p => p.payerId === split.assignedTo?.userId && p.amount === split.splitAmount
  );

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("record_payment")}</h1>
        <Link href="/settlements" passHref>
          <Button variant="outline">{t("back")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("payment_details")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {transaction.description || t("no_description")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("assigned_to")}</span>
              <span>{split.assignedTo?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("split_amount")}</span>
              <span>${split.splitAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("status")}</span>
              <span
                className={
                  existingPayment ? "text-green-600" : "text-yellow-600"
                }
              >
                {existingPayment ? t("paid") : t("unpaid")}
              </span>
            </div>
            {existingPayment && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("payment_date")}
                </span>
                <span>
                  {new Date(existingPayment.paymentDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {!existingPayment && (
            <PaymentForm 
              transactionId={transaction.id} 
              splitId={splitId} 
              amount={split.splitAmount} 
              payerId={split.assignedTo?.userId} 
              locale={locale} 
            />
          )}

          {existingPayment && (
            <div className="flex justify-center">
              <form action={`/api/transactions/${id}/payment/${existingPayment.id}`} method="DELETE">
                <Button type="submit" variant="destructive">
                  {t("remove_payment")}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 