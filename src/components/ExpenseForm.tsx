"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
}

interface ExpenseFormProps {
  expense?: {
    id: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    date: Date;
    description?: string;
    categoryId: string;
  };
}

export function ExpenseForm({ expense }: ExpenseFormProps) {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(expense?.type || 'EXPENSE');
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [date, setDate] = useState<Date>(expense?.date || new Date());
  const [description, setDescription] = useState(expense?.description || "");
  const [categoryId, setCategoryId] = useState(expense?.categoryId || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 載入分類
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error loading categories:", error));
  }, []);

  // 根據類型過濾分類
  const filteredCategories = categories.filter(
    category => category.type === type
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    setIsSubmitting(true);
    fetch("/api/transactions" + (expense ? `/${expense.id}` : ""), {
      method: expense ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        type,
        date,
        description,
        categoryId,
      }),
    })
      .then((response) => {
        if (!response.ok) return new Error("提交失敗");
        router.push("/dashboard");
        router.refresh();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("提交失敗，請稍後再試");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 收支類型選擇 */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-700">類型</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="EXPENSE"
              checked={type === 'EXPENSE'}
              onChange={(e) => {
                setType(e.target.value as 'EXPENSE' | 'INCOME');
                setCategoryId(''); // 重置分類選擇
              }}
              className="text-blue-600"
            />
            <span className="text-sm">支出</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="INCOME"
              checked={type === 'INCOME'}
              onChange={(e) => {
                setType(e.target.value as 'EXPENSE' | 'INCOME');
                setCategoryId(''); // 重置分類選擇
              }}
              className="text-blue-600"
            />
            <span className="text-sm">收入</span>
          </label>
        </div>
      </div>

      {/* 原有的表單欄位 */}
      <div>
        <label className="block text-sm text-gray-700 mb-1">
          金額
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          日期
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: zhTW }) : "選擇日期"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          分類
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">選擇分類</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          備註
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "處理中..." : (expense ? "更新" : "新增")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          取消
        </button>
      </div>
    </form>
  );
} 