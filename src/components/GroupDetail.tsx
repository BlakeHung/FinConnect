'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Trash, Users, Calendar } from "lucide-react";
import { AddMemberDialog } from "./AddMemberDialog";
import { useTranslations } from 'next-intl';

interface GroupMember {
  id: string;
  name: string;
}

interface ActivityGroup {
  id: string;
  memberCount: number;
  activity: {
    id: string;
    name: string;
    startDate: string;
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  activities: ActivityGroup[];
}

interface GroupDetailProps {
  group: Group;
}

export function GroupDetail({ group }: GroupDetailProps) {
  const router = useRouter();
  const t = useTranslations('groups');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-500 mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/groups/${group.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('edit')}
          </Button>
          <Button 
            variant="destructive"
          >
            <Trash className="w-4 h-4 mr-2" />
            {t('delete')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            {t('members')}
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Calendar className="w-4 h-4 mr-2" />
            {t('activities')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{t('members')}</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => setIsAddMemberDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_member')}
                </Button>
              </div>
              <CardDescription>
                {t('total_members', { count: group.members.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {group.members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
                  >
                    <span>{member.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {group.members.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    {t('no_members')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{t('activities')}</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => router.push(`/activities/new?groupId=${group.id}`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_to_activity')}
                </Button>
              </div>
              <CardDescription>
                {t('total_activities', { count: group.activities.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {group.activities.map((activityGroup) => (
                  <div 
                    key={activityGroup.id} 
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{activityGroup.activity.name}</div>
                      <div className="text-sm text-gray-500">
                        {t('participating_members', { count: activityGroup.memberCount })}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/activities/${activityGroup.activity.id}`)}
                    >
                      {t('view')}
                    </Button>
                  </div>
                ))}
                {group.activities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    {t('no_activities')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMemberDialog 
        groupId={group.id}
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
      />
    </div>
  );
} 