'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Payment = {
  id: string;
  payerId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod?: string | null;
  note?: string | null;
  payer: {
    id: string;
    name: string;
  };
};

type Split = {
  id: string;
  assignedToId: string;
  splitAmount: number;
  assignedTo: {
    id: string;
    name: string;
    userId: string | null;
  };
};

type PaymentSummaryProps = {
  splits: Split[];
  payments: Payment[];
  transactionId: string;
  locale: string;
};

export default function PaymentSummary({
  splits,
  payments,
  transactionId,
  locale,
}: PaymentSummaryProps) {
  const t = useTranslations("Settlements");

  // Calculate total amount from splits that should be paid
  const totalSplitAmount = splits
    .filter((split) => split.assignedTo?.userId && split.assignedTo?.userId !== '')
    .reduce((sum, split) => sum + split.splitAmount, 0);

  // Calculate total amount that has been paid
  const totalPaidAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  // Calculate percentage paid
  const percentagePaid = totalSplitAmount > 0
    ? Math.min(100, Math.round((totalPaidAmount / totalSplitAmount) * 100))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("payment_status")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>{t("payment_progress")}</span>
            <span>
              {percentagePaid}% ({totalPaidAmount.toFixed(2)} / {totalSplitAmount.toFixed(2)})
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${percentagePaid}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">{t("splits")}</h3>
          <div className="space-y-2">
            {splits.map((split) => {
              const isPaid = payments.some(
                (p) =>
                  p.payerId === split.assignedTo?.userId &&
                  p.amount === split.splitAmount
              );

              return (
                <div
                  key={split.id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div>
                    <div className="font-medium">{split.assignedTo.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${split.splitAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isPaid ? t("paid") : t("unpaid")}
                    </span>
                    {split.assignedTo?.userId && (
                      <Link
                        href={`/${locale}/settlements/${transactionId}/payment/${split.id}`}
                        passHref
                      >
                        <Button variant="outline" size="sm">
                          {isPaid ? t("view_payment") : t("record_payment")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {payments.length > 0 && (
            <>
              <h3 className="font-medium mt-6">{t("payment_history")}</h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <div className="font-medium">{payment.payer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${payment.amount.toFixed(2)}
                        {payment.paymentMethod && (
                          <span className="ml-2">
                            via {payment.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 