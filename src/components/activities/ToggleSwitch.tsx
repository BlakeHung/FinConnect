'use client';

import { Switch } from "@/components/ui/switch";

interface ToggleSwitchProps {
  id: string;
  enabled: boolean;
  canManage: boolean;
}

export function ToggleSwitch({ id, enabled, canManage }: ToggleSwitchProps) {
  if (!canManage) {
    return (
      <span className={enabled ? 'text-green-600' : 'text-red-600'}>
        {enabled ? '已啟用' : '已停用'}
      </span>
    );
  }

  return (
    <Switch
      checked={enabled}
      onCheckedChange={async (checked) => {
        try {
          const response = await fetch(`/api/activities/${id}/toggle`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ enabled: checked }),
          });

          if (!response.ok) {
            throw new Error('更新失敗');
          }

          window.location.reload();
        } catch (error) {
          console.error("[TOGGLE_SWITCH]", error);
          alert('更新失敗，請稍後再試');
        }
      }}
    />
  );
} 