"use client";

import { useState } from "react";
import { Transaction } from "@prisma/client";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

interface TransactionListProps {
  transactions: (Transaction & {
    category: {
      name: string;
    };
  })[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === "ALL") return true;
    return transaction.type === filterType;
  });

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterType("ALL")}
          className={twMerge(
            "px-4 py-2 rounded-md",
            filterType === "ALL" ? "bg-blue-500 text-white" : "bg-gray-200"
          )}
        >
          全部
        </button>
        <button
          onClick={() => setFilterType("INCOME")}
          className={twMerge(
            "px-4 py-2 rounded-md",
            filterType === "INCOME" ? "bg-green-500 text-white" : "bg-gray-200"
          )}
        >
          收入
        </button>
        <button
          onClick={() => setFilterType("EXPENSE")}
          className={twMerge(
            "px-4 py-2 rounded-md",
            filterType === "EXPENSE" ? "bg-red-500 text-white" : "bg-gray-200"
          )}
        >
          支出
        </button>
      </div>

      <div className="space-y-2">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={twMerge(
              "p-4 rounded-md shadow-sm",
              transaction.type === "INCOME" ? "bg-green-50" : "bg-red-50"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{transaction.category.name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.date), "yyyy/MM/dd HH:mm")}
                </p>
              </div>
              <p
                className={twMerge(
                  "font-semibold",
                  transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                )}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {transaction.amount.toLocaleString()}
              </p>
            </div>
            {transaction.description && (
              <p className="mt-2 text-sm text-gray-600">{transaction.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 