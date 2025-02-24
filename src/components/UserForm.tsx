"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";

export function UserForm({ user }: { user?: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@wchung.tw';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '', // 編輯時可選
    role: user?.role || 'USER',
    image: user?.image || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isDemo) {
      toast.error("Demo 帳號無法修改用戶");
      return;
    }

    try {
      setIsLoading(true);
      
      // 構建請求數據
      const data = {
        ...formData,
        // 只有在有輸入密碼時才發送密碼
        ...(formData.password ? { password: formData.password } : {}),
      };

      // 根據是否有 user 來決定是新增還是更新
      const url = user ? `/api/users/${user.id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success(user ? '更新成功' : '創建成功');
      router.push('/users');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : '操作失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">名稱</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">
          密碼 {user && <span className="text-sm text-gray-500">(留空表示不修改)</span>}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          {...(!user && { required: true })} // 新建用戶時必填
        />
      </div>

      <div>
        <Label htmlFor="role">角色</Label>
        <select
          id="role"
          className="w-full rounded-md border border-gray-300 p-2"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        >
          <option value="USER">一般用戶</option>
          <option value="FINANCE_MANAGER">財務主記帳</option>
          <option value="ADMIN">管理員</option>
        </select>
      </div>

      <div>
        <Label>頭像</Label>
        {isDemo && (
          <p className="text-sm text-amber-600 mb-2">
            Demo 帳號無法上傳圖片，請使用其他帳號進行測試。
          </p>
        )}
        <ImageUpload
          value={formData.image ? [formData.image] : []}
          onChange={(urls) => setFormData({ ...formData, image: urls[0] || '' })}
          onRemove={() => setFormData({ ...formData, image: '' })}
        />
      </div>

      <Button type="submit" disabled={isLoading || isDemo}>
        {isLoading ? '處理中...' : (user ? '更新' : '創建')}
      </Button>
    </form>
  );
} 