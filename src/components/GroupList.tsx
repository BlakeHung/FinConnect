'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { useTranslations } from 'next-intl';

interface GroupListProps {
  groups: any[];
}

export function GroupList({ groups }: GroupListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const t = useTranslations('groups');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">{t('your_groups')}</h2>
          <p className="text-sm text-gray-500">{t('group_count', { count: groups.length })}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('create_group')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      <CreateGroupDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}