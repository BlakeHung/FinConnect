"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check } from "lucide-react";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    type: 'EXPENSE' | 'INCOME';
    isDefault: boolean;
  };
  defaultType?: 'EXPENSE' | 'INCOME';
}

export function CategoryForm({ category, defaultType = 'EXPENSE' }: CategoryFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(category?.type || defaultType);
  const [isDefault, setIsDefault] = useState(category?.isDefault || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    fetch("/api/categories" + (category ? `/${category.id}` : ""), {
      method: category ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        name: name.trim(),
        type,
        isDefault,
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error("提交失敗");
        router.refresh();
        if (!category) {
          setName("");
          setType(defaultType);
          setIsDefault(false);
        }
        setIsEditing(false);
      })
      .catch(error => {
        console.error("Error:", error);
        alert("操作失敗，請稍後再試");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = () => {
    if (!category || !confirm("確定要刪除此分類嗎？")) return;

    setIsSubmitting(true);
    fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    })
      .then(response => {
        if (!response.ok) throw new Error("刪除失敗");
        router.refresh();
      })
      .catch(error => {
        console.error("Error:", error);
        alert("刪除失敗，請稍後再試");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (category && !isEditing) {
    return (
      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
          disabled={isSubmitting}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50"
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full sm:w-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="輸入分類名稱"
          className="px-3 py-1.5 border rounded-md text-sm w-full sm:w-auto"
          disabled={isSubmitting}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
          className="px-3 py-1.5 border rounded-md text-sm bg-white"
          disabled={isSubmitting}
        >
          <option value="EXPENSE">支出</option>
          <option value="INCOME">收入</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`default-${category?.id || 'new'}`}
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="rounded text-blue-600 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label 
          htmlFor={`default-${category?.id || 'new'}`}
          className="text-sm text-gray-700"
        >
          設為預設分類
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "處理中..." : (category ? "更新" : "新增")}
        </button>
        {category && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-1.5 border text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
} 