'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import { useTranslations } from 'next-intl';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const router = useRouter();
  const t = useTranslations('groups');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [{ name: '' }]
  });

  const handleAddMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: '' }]
    });
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };

  const handleMemberNameChange = (index: number, value: string) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index].name = value;
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證表單
    if (!formData.name.trim()) {
      toast.error(t('name_required'));
      return;
    }

    // 過濾掉空的成員名稱
    const validMembers = formData.members.filter(member => member.name.trim() !== '');
    
    if (validMembers.length === 0) {
      toast.error(t('at_least_one_member'));
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          members: validMembers
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success(t('group_created'));
      onOpenChange(false);
      router.refresh();
      
      // 重置表單
      setFormData({
        name: '',
        description: '',
        members: [{ name: '' }]
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(t('create_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('create_new_group')}</DialogTitle>
            <DialogDescription>
              {t('create_group_description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('group_name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('group_name_placeholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('description_placeholder')}
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>{t('members')}</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddMember}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('add_member')}
                </Button>
              </div>
              
              {formData.members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={member.name}
                    onChange={(e) => handleMemberNameChange(index, e.target.value)}
                    placeholder={t('member_name_placeholder')}
                  />
                  {formData.members.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleRemoveMember(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 