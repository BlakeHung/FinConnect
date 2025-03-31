"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { useTranslations } from 'next-intl';

export function UserForm({ user }: { user?: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@wchung.tw';
  const t = useTranslations('users');

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
      toast.error(t('demo_error'));
      return;
    }

    try {
      setIsLoading(true);
      
      const data = {
        ...formData,
        ...(formData.password ? { password: formData.password } : {}),
      };

      const url = user ? `/api/users/${user.id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        return new Error(error);
      }

      toast.success(user ? t('update_success') : t('create_success'));
      router.push('/users');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : t('operation_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">{t('email')}</Label>
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
          {t('password')} {user && <span className="text-sm text-gray-500">({t('password_hint')})</span>}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          {...(!user && { required: true })}
        />
      </div>

      <div>
        <Label htmlFor="role">{t('role')}</Label>
        <select
          id="role"
          className="w-full rounded-md border border-gray-300 p-2"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        >
          <option value="USER">{t('roles.user')}</option>
          <option value="FINANCE_MANAGER">{t('roles.finance_manager')}</option>
          <option value="ADMIN">{t('roles.admin')}</option>
        </select>
      </div>

      <div>
        <Label>{t('profile_image')}</Label>
        {isDemo && (
          <p className="text-sm text-amber-600 mb-2">
            {t('demo_image_error')}
          </p>
        )}
        <ImageUpload
          value={formData.image ? [formData.image] : []}
          onChange={(urls) => setFormData({ ...formData, image: urls[0] || '' })}
          onRemove={() => setFormData({ ...formData, image: '' })}
        />
      </div>

      <Button type="submit" disabled={isLoading || isDemo}>
        {isLoading ? t('processing') : (user ? t('update') : t('create'))}
      </Button>
    </form>
  );
} 