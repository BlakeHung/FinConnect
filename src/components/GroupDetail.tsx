'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClientLocale } from '@/lib/i18n/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Trash, Users, Calendar, User, UserPlus, Trash2 } from "lucide-react";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GroupMember {
  id: string;
  name: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
  };
}

interface Activity {
  id: string;
  name: string;
  startDate: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  activities: Activity[];
}

interface GroupDetailProps {
  group: Group;
  systemUsers?: { id: string; name: string; email: string }[];
  isCreator?: boolean;
  currentUserId?: string;
}

export function GroupDetail({ 
  group, 
  systemUsers = [], 
  isCreator = true,
  currentUserId 
}: GroupDetailProps) {
  const router = useRouter();
  const locale = useClientLocale();
  const t = useTranslations('groups');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [members, setMembers] = useState<GroupMember[]>(group.members || []);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditGroup = () => {
    toast.info(t('editGroupNotAvailable'));
    
    router.push(`/${locale}/dashboard`);
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        return new Error('Failed to delete group');
      }
      
      toast.success(t('groupDeleted'));
      router.push(`/${locale}/groups`);
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error(t('errorDeletingGroup'));
    }
  };

  const handleSaveMember = async (memberData: { name: string; userId?: string }) => {
    console.log("Current editingMember:", editingMember);
    
    try {
      const url = editingMember 
        ? `/api/groups/${group.id}/members/${editingMember.id}` 
        : `/api/groups/${group.id}/members`;
      
      const method = editingMember ? 'PUT' : 'POST';
      
      console.log("Request URL:", url);
      console.log("Request Method:", method);
      console.log("Request Data:", memberData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });
      
      if (!response.ok) {
        return new Error('Failed to save member');
      }
      
      const savedMember = await response.json();
      
      if (editingMember) {
        setMembers(members.map(m => m.id === editingMember.id ? savedMember : m));
      } else {
        setMembers([...members, savedMember]);
      }
      
      setIsAddMemberOpen(false);
      setEditingMember(null);
      toast.success(editingMember ? t('memberUpdated') : t('memberAdded'));
      router.refresh();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error(t('errorSavingMember'));
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${group.id}/members/${memberId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        return new Error('Failed to delete member');
      }
      
      setMembers(members.filter(m => m.id !== memberId));
      toast.success(t('memberDeleted'));
      router.refresh();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error(t('errorDeletingMember'));
    }
  };

  const openEditMember = (member: GroupMember) => {
    setEditingMember(member);
    setIsAddMemberOpen(true);
  };

  const handleAddToActivity = () => {
    router.push(`/${locale}/activities?selectGroup=${group.id}`);
  };

  const handleViewActivity = (activityId: string) => {
    router.push(`/${locale}/activities/${activityId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-500 mt-1">{group.description}</p>
          )}
        </div>
        {isCreator && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleEditGroup}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('edit')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="w-4 h-4 mr-2" />
              {t('delete')}
            </Button>
          </div>
        )}
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
                {isCreator && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      setEditingMember(null);
                      setIsAddMemberOpen(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('addMember')}
                  </Button>
                )}
              </div>
              <CardDescription>
                {t('total_members', { count: members.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.userId && member.user && (
                          <p className="text-xs text-muted-foreground">
                            {t('linkedToUser')}: {member.user.name}
                          </p>
                        )}
                        {member.userId === currentUserId && (
                          <p className="text-xs text-primary">
                            {t('thisIsYou')}
                          </p>
                        )}
                      </div>
                    </div>
                    {isCreator && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
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
                  onClick={handleAddToActivity}
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
                {group.activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{activity.name}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewActivity(activity.id)}
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
        isOpen={isAddMemberOpen} 
        onClose={() => {
          setIsAddMemberOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        existingMember={editingMember}
        systemUsers={systemUsers}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteGroup')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteGroupConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isAddMemberOpen && (
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogContent>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t('selectUser')} />
              </SelectTrigger>
              <SelectContent>
                {systemUsers.map(user => (
                  <SelectItem key={user.id} value={user.id || "none"}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 