"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export function MonthlyComparison({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `$${value/1000}k`} />
        <Tooltip 
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Legend />
        <Bar dataKey="income" name="收入" fill="#22c55e" />
        <Bar dataKey="expense" name="支出" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
} 