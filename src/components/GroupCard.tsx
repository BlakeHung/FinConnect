'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

interface GroupMember {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  _count: {
    members: number;
  };
}

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter();
  const t = useTranslations('groups');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{group.name}</span>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{group._count.members}</span>
          </div>
        </CardTitle>
        {group.description && (
          <CardDescription>{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-2">{t('members')}:</div>
        <div className="flex flex-wrap gap-1">
          {group.members.slice(0, 5).map((member) => (
            <div key={member.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
              {member.name}
            </div>
          ))}
          {group._count.members > 5 && (
            <div className="bg-gray-100 px-2 py-1 rounded text-xs">
              +{group._count.members - 5} {t('more')}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/groups/${group.id}`)}
        >
          {t('view_details')}
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => router.push(`/groups/${group.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 