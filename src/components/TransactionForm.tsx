"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { useTranslations } from 'next-intl';
import { useClientLocale } from '@/lib/i18n/utils';
import { Card, CardContent } from "@/components/ui/card";

const transactionSchema = z.object({
  amount: z.number().positive("金額必須大於 0"),
  categoryId: z.string().min(1, "請選擇類別"),
  date: z.date(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  activityId: z.string().optional(),
  groupId: z.string().optional(),
  splitEnabled: z.boolean().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
}

interface Activity {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  members?: GroupMember[];
}

interface GroupMember {
  id: string;
  name: string;
  user?: {
    id: string;
    name: string;
  };
}

interface SplitMemberState {
  memberId: string;
  name: string;
  userName?: string;
  isIncluded: boolean;
  value?: number;
}

interface TransactionFormProps {
  categories: Category[];
  activities: Activity[];
  groups?: Group[];
  type: 'EXPENSE' | 'INCOME';
  defaultValues?: {
    amount?: number;
    categoryId?: string;
    activityId?: string;
    groupId?: string;
    date?: string;
    description?: string;
    images?: string[];
    paymentStatus?: string;
    splitEnabled?: boolean;
  };
  transactionId?: string;
  canManagePayments?: boolean;
  splitData?: {
    splitEnabled: boolean;
    splitType: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
    splitMembers: {
      memberId: string;
      isIncluded: boolean;
      value?: number;
    }[];
  };
}

export function TransactionForm({ 
  categories, 
  activities,
  groups = [],
  type,
  defaultValues,
  transactionId,
  splitData,
}: TransactionFormProps) {
  const t = useTranslations('transactions');
  const locale = useClientLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(
    defaultValues?.images || []
  );
  const [splitEnabled, setSplitEnabled] = useState(defaultValues?.splitEnabled || false);
  const [splitType, setSplitType] = useState<'EQUAL' | 'PERCENTAGE' | 'FIXED'>('EQUAL');
  const [members, setMembers] = useState<SplitMemberState[]>([]);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<GroupMember[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: defaultValues?.amount || undefined,
      categoryId: defaultValues?.categoryId || '',
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      description: defaultValues?.description || '',
      images: defaultValues?.images || [],
      activityId: defaultValues?.activityId || undefined,
      groupId: defaultValues?.groupId || undefined,
      splitEnabled: defaultValues?.splitEnabled || false,
    }
  });

  // 監聽表單數據變化
  const watchedAmount = watch('amount') || 0;
  const watchedGroupId = watch('groupId');

  // 當選擇群組時加載該群組的成員
  useEffect(() => {
    if (watchedGroupId && watchedGroupId !== 'none') {
      const selectedGroup = groups.find(g => g.id === watchedGroupId);
      if (selectedGroup && selectedGroup.members) {
        setSelectedGroupMembers(selectedGroup.members);
        // 初始化所有成員為已包含並平均分配
        setMembers(selectedGroup.members.map(member => ({
          memberId: member.id,
          name: member.name,
          userName: member.user?.name,
          isIncluded: true,
          value: undefined
        })));
      } else {
        // 如果需要，這裡可以添加API調用來獲取群組成員
        fetchGroupMembers(watchedGroupId);
      }
    } else {
      setSelectedGroupMembers([]);
      setMembers([]);
      if (splitEnabled) {
        setSplitEnabled(false);
      }
    }
  }, [watchedGroupId]);

  // 獲取群組成員的函數
  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGroupMembers(data);
        setMembers(data.map(member => ({
          memberId: member.id,
          name: member.name,
          userName: member.user?.name,
          isIncluded: true,
          value: undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error(t('error_loading_members'));
    }
  };

  // 當分帳類型改變時，重置成員值
  useEffect(() => {
    if (splitType === 'EQUAL') {
      setMembers(prev => prev.map(m => ({
        ...m,
        value: undefined
      })));
    } else if (splitType === 'PERCENTAGE' && members.length > 0) {
      const includedMembers = members.filter(m => m.isIncluded);
      if (includedMembers.length > 0) {
        const percentage = 100 / includedMembers.length;
        setMembers(prev => prev.map(m => ({
          ...m,
          value: m.isIncluded ? parseFloat(percentage.toFixed(2)) : 0
        })));
      }
    } else if (splitType === 'FIXED' && members.length > 0) {
      const includedMembers = members.filter(m => m.isIncluded);
      if (includedMembers.length > 0) {
        const amount = watchedAmount / includedMembers.length;
        setMembers(prev => prev.map(m => ({
          ...m,
          value: m.isIncluded ? parseFloat(amount.toFixed(2)) : 0
        })));
      }
    }
  }, [splitType, members.length]);

  // 處理分帳開關
  const handleSplitToggle = (enabled: boolean) => {
    if (enabled && (!watchedGroupId || watchedGroupId === 'none')) {
      toast.error(t('split_requires_group'));
      return;
    }
    setSplitEnabled(enabled);
    setValue('splitEnabled', enabled);
  };

  // 處理成員包含狀態變化
  const handleMemberIncludeChange = (memberId: string, included: boolean) => {
    setMembers(prev => prev.map(m => 
      m.memberId === memberId 
        ? { ...m, isIncluded: included } 
        : m
    ));
  };

  // 處理成員分配值變化
  const handleMemberValueChange = (memberId: string, value: number) => {
    setMembers(prev => prev.map(m => 
      m.memberId === memberId 
        ? { ...m, value } 
        : m
    ));
  };

  // 平均分配
  const distributeEqually = () => {
    const includedMembers = members.filter(m => m.isIncluded);
    if (includedMembers.length === 0) return;

    if (splitType === 'PERCENTAGE') {
      const percentage = 100 / includedMembers.length;
      setMembers(prev => prev.map(m => ({
        ...m,
        value: m.isIncluded ? parseFloat(percentage.toFixed(2)) : 0
      })));
    } else if (splitType === 'FIXED') {
      const amount = watchedAmount / includedMembers.length;
      setMembers(prev => prev.map(m => ({
        ...m,
        value: m.isIncluded ? parseFloat(amount.toFixed(2)) : 0
      })));
    }
  };

  // 計算分配總和
  const calculateTotal = () => {
    return members
      .filter(m => m.isIncluded)
      .reduce((sum, m) => sum + (m.value || 0), 0);
  };

  // 檢查分配是否有效
  const isValidDistribution = () => {
    if (!splitEnabled) return true;
    
    const includedMembers = members.filter(m => m.isIncluded);
    if (includedMembers.length === 0) return false;
    
    if (splitType === 'EQUAL') return true;
    
    if (splitType === 'PERCENTAGE') {
      const total = calculateTotal();
      return Math.abs(total - 100) < 0.01;
    }
    
    if (splitType === 'FIXED') {
      const total = calculateTotal();
      return Math.abs(total - watchedAmount) < 0.01;
    }
    
    return false;
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "amis_management"); 

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dfaittd9e/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = await Promise.all(files.map(handleImageUpload));
      setPreviewImages((prev) => [...prev, ...urls]);
      setValue("images", [...previewImages, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (splitEnabled && !isValidDistribution()) {
      if (splitType === 'PERCENTAGE') {
        toast.error(t('percentage_error'));
      } else if (splitType === 'FIXED') {
        toast.error(t('fixed_error'));
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 準備分帳數據
      const splitData = splitEnabled && data.groupId && data.groupId !== 'none'
        ? {
            splitType,
            splitMembers: members.map(m => ({
              memberId: m.memberId,
              isIncluded: m.isIncluded,
              value: m.value,
            }))
          }
        : {};
      
      const url = transactionId 
        ? `/api/transactions/${transactionId}` 
        : '/api/transactions';
      
      const method = transactionId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type,
          ...splitData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('submit_error'));
      }

      toast.success(transactionId ? t('update_success') : t('create_success'));
      router.push(`/${locale}/transactions`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || t('submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 計算分帳摘要資訊
  const includedMembersCount = members.filter(m => m.isIncluded).length;
  const equalAmount = includedMembersCount > 0 ? watchedAmount / includedMembersCount : 0;
  const totalPercentage = members.reduce((sum, m) => m.isIncluded ? sum + (m.value || 0) : sum, 0);
  const totalFixed = members.reduce((sum, m) => m.isIncluded ? sum + (m.value || 0) : sum, 0);

  useEffect(() => {
    // 如果提供了 splitData，使用它初始化分帳狀態
    if (splitData && splitData.splitEnabled) {
      setSplitEnabled(true);
      setSplitType(splitData.splitType);
      
      if (splitData.splitMembers.length > 0) {
        const memberData = splitData.splitMembers.map(sm => {
          const memberInfo = selectedGroupMembers.find(m => m.id === sm.memberId);
          return {
            memberId: sm.memberId,
            name: memberInfo?.name || '成員',
            userName: memberInfo?.user?.name,
            isIncluded: sm.isIncluded,
            value: sm.value,
          };
        });
        
        if (memberData.length > 0) {
          setMembers(memberData);
        }
      }
    }
  }, [splitData, selectedGroupMembers]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基本交易資訊區 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('amount')}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            onKeyDown={(e) => {
              if (!/[\d.]/.test(e.key) && 
                  !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            {...register("amount", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{t('amount_required')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('category')}
          </label>
          <select
            {...register("categoryId")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">{t('select_category')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{t('category_required')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('date')}
          </label>
          <input
            type="date"
            {...register("date", { valueAsDate: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{t('date_required')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('description')}
          </label>
          <textarea
            {...register("description")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{t('description_error')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('images')}
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {previewImages.map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <Image
                  src={url}
                  alt={t('image_preview', { index: index + 1 })}
                  fill
                  className="object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityId">{t('activity')}</Label>
          
          <Select
            value={watch('activityId') || 'none'}
            onValueChange={(value) => setValue('activityId', value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('select_activity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('no_activity')}</SelectItem>
              {activities?.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupId">{t('group')}</Label>
          
          <Select
            value={watch('groupId') || 'none'}
            onValueChange={(value) => setValue('groupId', value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('select_group')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('no_group')}</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 分帳開關 - 只有在類型為支出且已選擇群組時顯示 */}
        {type === 'EXPENSE' && watchedGroupId && watchedGroupId !== 'none' && (
          <div className="flex items-center space-x-2">
            <Switch
              id="split-enabled"
              checked={splitEnabled}
              onCheckedChange={handleSplitToggle}
            />
            <Label htmlFor="split-enabled">
              {t('split_expense')}
            </Label>
          </div>
        )}
      </div>

      {/* 分帳設置區 - 只有在啟用分帳時顯示 */}
      {splitEnabled && selectedGroupMembers.length > 0 && (
        <div className="border border-gray-200 rounded-md p-4 space-y-4">
          <h3 className="font-medium text-lg">{t('split_settings')}</h3>
          
          <div>
            <Label className="mb-2">{t('split_method')}</Label>
            <RadioGroup
              value={splitType}
              onValueChange={(value) => setSplitType(value as 'EQUAL' | 'PERCENTAGE' | 'FIXED')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EQUAL" id="equal" />
                <Label htmlFor="equal">{t('split_methods.equal')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PERCENTAGE" id="percentage" />
                <Label htmlFor="percentage">{t('split_methods.percentage')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FIXED" id="fixed" />
                <Label htmlFor="fixed">{t('split_methods.fixed')}</Label>
              </div>
            </RadioGroup>
          </div>
          
          {splitType !== 'EQUAL' && (
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={distributeEqually}
                size="sm"
              >
                {t('distribute_equally')}
              </Button>
            </div>
          )}
          
          <div>
            <Label className="mb-2">{t('split_members')}</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
              {members.map((member) => (
                <div key={member.memberId} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id={`member-${member.memberId}`}
                      checked={member.isIncluded}
                      onCheckedChange={(checked) => handleMemberIncludeChange(member.memberId, checked)}
                    />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      {member.userName && <p className="text-xs text-gray-500">{member.userName}</p>}
                    </div>
                  </div>
                  
                  {splitType !== 'EQUAL' && member.isIncluded && (
                    <div className="w-28">
                      <input
                        type="number"
                        min="0"
                        step={splitType === 'PERCENTAGE' ? '0.01' : '0.01'}
                        value={member.value || ''}
                        onChange={(e) => handleMemberValueChange(member.memberId, parseFloat(e.target.value) || 0)}
                        className="w-full border rounded-md px-2 py-1 text-right"
                        placeholder={splitType === 'PERCENTAGE' ? '%' : '$'}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {includedMembersCount === 0 && (
              <p className="mt-2 text-sm text-red-500">{t('no_members_selected')}</p>
            )}
          </div>
          
          {/* 分帳摘要 */}
          {includedMembersCount > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">{t('split_summary')}</h4>
                
                {splitType === 'EQUAL' && (
                  <p>{t('split_equally_among', { count: includedMembersCount })}: {t('each_pays', { amount: equalAmount.toFixed(2) })}</p>
                )}
                
                {splitType === 'PERCENTAGE' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('total_percentage')}</span>
                      <span className={Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                        {totalPercentage.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2 space-y-1">
                      {members
                        .filter(m => m.isIncluded)
                        .map(member => (
                          <div key={member.memberId} className="flex justify-between text-sm">
                            <span>{member.name}</span>
                            <span>
                              {member.value || 0}% = {((member.value || 0) / 100 * watchedAmount).toFixed(2)}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
                
                {splitType === 'FIXED' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('total_amount')}</span>
                      <span className={Math.abs(totalFixed - watchedAmount) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                        {totalFixed.toFixed(2)} / {watchedAmount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2 space-y-1">
                      {members
                        .filter(m => m.isIncluded)
                        .map(member => (
                          <div key={member.memberId} className="flex justify-between text-sm">
                            <span>{member.name}</span>
                            <span>{member.value?.toFixed(2) || 0}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </Button>
        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText={t('saving')}
          disabled={splitEnabled && !isValidDistribution() || isSubmitting}
        >
          {transactionId ? t('update') : t('save')}
        </LoadingButton>
      </div>
    </form>
  );
}