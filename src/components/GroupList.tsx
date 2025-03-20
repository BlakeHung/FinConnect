'use client';

import { useRouter } from "next/navigation";
import { useClientLocale } from '@/lib/i18n/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientTranslation } from '@/lib/i18n/utils';
import { Users, Calendar, ChevronRight } from "lucide-react";

export function GroupList({ groups = [] }) {
  const t = useClientTranslation('groups');
  const router = useRouter();
  const locale = useClientLocale();

  if (groups.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">{t('noGroups')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <Card key={group.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{group.name}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {group.description || t('noDescription')}
            </div>
            
            <div className="flex items-center mt-4 text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{t('total_members', { count: group._count.members })}</span>
            </div>
            
            {!group.isOwner && group.createdBy && (
              <div className="text-xs text-muted-foreground mt-2">
                {t('createdBy')}: {group.createdBy.name}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/${locale}/groups/${group.id}`)}
            >
              {t('viewDetails')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}