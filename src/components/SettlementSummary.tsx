"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

type SummaryProps = {
  totalTransactions: number;
  paidTransactions: number;
  totalAmount: number;
  paidAmount: number;
};

export default function SettlementSummary({
  totalTransactions,
  paidTransactions,
  totalAmount,
  paidAmount,
}: SummaryProps) {
  const t = useTranslations('settlements');

  const paidPercentage = totalTransactions > 0
    ? Math.round((paidTransactions / totalTransactions) * 100)
    : 0;
  
  const amountPercentage = totalAmount > 0
    ? Math.round((paidAmount / totalAmount) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t("transaction_status")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {paidTransactions} / {totalTransactions} ({paidPercentage}%)
          </div>
          <p className="text-xs text-muted-foreground">
            {t("transactions_paid")}
          </p>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${paidPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t("amount_status")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${paidAmount.toFixed(2)} / ${totalAmount.toFixed(2)} ({amountPercentage}%)
          </div>
          <p className="text-xs text-muted-foreground">
            {t("amount_paid")}
          </p>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${amountPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 