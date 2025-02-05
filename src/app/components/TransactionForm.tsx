"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const expenseSchema = z.object({
  amount: z.number().positive("金額必須大於 0"),
  categoryId: z.string().min(1, "請選擇類別"),
  description: z.string().optional(),
  date: z.date(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface TransactionFormProps {
  categories: { id: string; name: string }[];
  type: "EXPENSE" | "INCOME";
}

export function TransactionForm({ categories, type }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/${type.toLowerCase()}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      reset();
      // TODO: Show success message
    } catch (error) {
      console.error("Transaction submission error:", error);
      // TODO: Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">金額</label>
        <input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">類別</label>
        <select
          {...register("categoryId")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">選擇類別</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">日期</label>
        <input
          type="date"
          {...register("date", { valueAsDate: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          備註
        </label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSubmitting ? "儲存中..." : "儲存"}
      </button>
    </form>
  );
} 