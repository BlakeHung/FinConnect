'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientTranslation } from '@/lib/i18n/utils';

export function AddMemberDialog({ 
  isOpen, 
  onClose, 
  onSave,
  existingMember = null,
  systemUsers = [] // 系統用戶列表
}) {
  const t = useClientTranslation('groups');
  const [name, setName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('none');

  useEffect(() => {
    if (existingMember) {
      setName(existingMember.name);
      setSelectedUserId(existingMember.userId || 'none');
    } else {
      setName('');
      setSelectedUserId('none');
    }
  }, [existingMember, isOpen]);

  const handleSave = () => {
    onSave({
      name,
      userId: selectedUserId === 'none' ? null : selectedUserId
    });
    setName('');
    setSelectedUserId('none');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingMember ? t('editMember') : t('addMember')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">{t('memberName')}</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterMemberName')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="member-user">{t('linkToUser')}</Label>
            <Select value={selectedUserId || undefined} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectUserOptional')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('noUser')}</SelectItem>
                {systemUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{t('linkToUserHelp')}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {existingMember ? t('save') : t('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 