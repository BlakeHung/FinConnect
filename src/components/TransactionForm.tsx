"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { useTranslations } from 'next-intl';
import { Checkbox } from "@/components/ui/checkbox";
import { useLocale } from 'use-intl';
import { toast } from 'sonner';

const transactionSchema = z.object({
  amount: z.number().positive("金額必須大於 0"),
  categoryId: z.string().min(1, "請選擇類別"),
  date: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  activityId: z.string().optional(),
  groupId: z.string().nullable().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Activity {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface GroupMember {
  id: string;
  name: string;
  userId?: string;
}

// 分帳方式枚舉
type SplitType = 'EQUAL' | 'PERCENTAGE' | 'FIXED';

interface Split {
  amount: number;
  description?: string;
  assignedToId: string;
  isIncluded?: boolean;
  splitType?: SplitType;
}

interface TransactionFormProps {
  categories: Category[];
  activities: Activity[];
  groups?: Group[];
  type: 'EXPENSE' | 'INCOME';
  defaultValues?: {
    amount: number;
    categoryId: string;
    activityId?: string;
    date: Date;
    description?: string;
    images?: string[];
    paymentStatus?: string;
    groupId?: string;
    splits?: Split[];
  };
  transactionId?: string;
  canManagePayments?: boolean;
}

export function TransactionForm({ 
  categories, 
  activities,
  groups = [],
  type,
  defaultValues,
  transactionId,
  canManagePayments = false,
}: TransactionFormProps) {
  const t = useTranslations('transactions');
  const router = useRouter();
  const { locale } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(
    defaultValues?.images || []
  );
  const [isPaid, setIsPaid] = useState(defaultValues?.paymentStatus === 'PAID');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(defaultValues?.groupId || null);
  const [splits, setSplits] = useState<Split[]>(defaultValues?.splits || []);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [totalAmount, setTotalAmount] = useState<number>(defaultValues?.amount || 0);

  // 新增日誌
  console.log("TransactionForm initialized with props:", {
    type,
    defaultValues: JSON.stringify(defaultValues, null, 2),
    transactionId,
    categoryCount: categories?.length,
    activityCount: activities?.length,
    groupCount: groups?.length,
    canManagePayments
  });

  // 檢查是否有預設的分帳資料
  if (defaultValues?.splits) {
    console.log("Default splits found:", JSON.stringify(defaultValues.splits, null, 2));
  }

  const today = new Date().toISOString().split('T')[0];

  // 處理日期格式
  const formattedDefaultValues = defaultValues ? {
    ...defaultValues,
    date: typeof defaultValues.date === 'string' ? defaultValues.date : (defaultValues.date instanceof Date ? defaultValues.date.toISOString().split('T')[0] : today)
  } : { date: today };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    control,
    getValues,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: formattedDefaultValues
  });

  // useEffect 添加日誌檢視分帳值的初始狀態
  useEffect(() => {
    console.log("Form initialized with values:", getValues());
    console.log("Initial splits:", getValues("splits"));
    
    // 設置預覽圖片
    if (defaultValues?.images && defaultValues.images.length > 0) {
      setPreviewImages(defaultValues.images);
      console.log("Initial preview images set:", defaultValues.images);
    }
  }, [defaultValues, getValues]);

  // 監聽金額變化
  const currentAmount = watch('amount') || 0;
  
  useEffect(() => {
    setTotalAmount(currentAmount);
  }, [currentAmount]);

  // 當選擇群組時，獲取群組成員
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (selectedGroupId) {
        const response = await fetch(`/api/groups/${selectedGroupId}/members`);
        const data = await response.json();
        setGroupMembers(data);
        
        // 如果沒有已存在的分帳，則創建默認的平均分帳
        if (splits.length === 0 && data.length > 0) {
          const defaultSplits = data.map((member: GroupMember) => ({
            amount: 0,
            assignedToId: member.id,
            splitType: 'EQUAL' as SplitType,
            isIncluded: true
          }));
          setSplits(defaultSplits);
          updateSplitAmounts(defaultSplits, currentAmount, 'EQUAL');
        }
      } else {
        setGroupMembers([]);
        setSplits([]);
      }
    };
    fetchGroupMembers();
  }, [selectedGroupId]);

  // 更新分帳金額
  const updateSplitAmounts = (currentSplits: Split[], amount: number, type: SplitType) => {
    const includedSplits = currentSplits.filter(split => split.isIncluded !== false);
    const count = includedSplits.length;
    
    if (count === 0) return;
    
    let newSplits = [...currentSplits];
    
    if (type === 'EQUAL') {
      const equalAmount = amount / count;
      newSplits = currentSplits.map(split => ({
        ...split,
        amount: split.isIncluded !== false ? parseFloat(equalAmount.toFixed(2)) : 0
      }));
    } else if (type === 'PERCENTAGE') {
      const equalPercentage = 100 / count;
      newSplits = currentSplits.map(split => ({
        ...split,
        amount: split.isIncluded !== false ? parseFloat((amount * equalPercentage / 100).toFixed(2)) : 0
      }));
    }
    
    setSplits(newSplits);
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "amis_management"); // 替換為你的 Cloudinary upload preset

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dfaittd9e/image/upload", // 替換為你的 Cloudinary cloud name
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
      setValue("images", urls);
    }
  };

  const handleAddSplit = () => {
    if (groupMembers.length === 0) return;
    
    // 找出還沒被分配的成員
    const assignedIds = splits.map(split => split.assignedToId);
    const unassignedMember = groupMembers.find(member => !assignedIds.includes(member.id));
    
    if (unassignedMember) {
      const newSplits = [...splits, { 
        amount: 0, 
        assignedToId: unassignedMember.id,
        splitType: splitType,
        isIncluded: true
      }];
      setSplits(newSplits);
      updateSplitAmounts(newSplits, totalAmount, splitType);
    }
  };

  const handleRemoveSplit = (index: number) => {
    const newSplits = splits.filter((_, i) => i !== index);
    setSplits(newSplits);
    updateSplitAmounts(newSplits, totalAmount, splitType);
  };

  const handleSplitChange = (index: number, field: string, value: string | number | boolean) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    
    // 如果更改了金額，需要檢查總和
    if (field === 'amount') {
      setSplits(newSplits);
    } else if (field === 'isIncluded') {
      setSplits(newSplits);
      updateSplitAmounts(newSplits, totalAmount, splitType);
    } else {
      setSplits(newSplits);
    }
  };

  const handleSplitTypeChange = (type: SplitType) => {
    setSplitType(type);
    updateSplitAmounts(splits, totalAmount, type);
  };

  const getTotalSplitAmount = () => {
    return splits.reduce((sum, split) => sum + (split.amount || 0), 0);
  };

  const onSubmit = async (data: TransactionFormData) => {
    console.log("Form submitted with data:", JSON.stringify(data, null, 2));
    
    if (data.splits && data.splits.length > 0) {
      console.log("Submitting splits:", JSON.stringify(data.splits, null, 2));
    }
    
    setIsSubmitting(true);
    
    try {
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
          paymentStatus: isPaid ? 'PAID' : 'UNPAID',
          groupId: selectedGroupId || undefined,
          splits: selectedGroupId && splits.length > 0 ? splits : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      window.location.href = '/transactions';
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t('form.submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 計算總分帳金額
  const totalSplitAmount = getTotalSplitAmount();
  // 計算差額
  const amountDifference = totalAmount - totalSplitAmount;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          {...register("date")}
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
        <input
          type="text"
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
        <div className="mt-2 grid grid-cols-2 gap-4">
          {previewImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={t('image_preview', { index: index + 1 })}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  const newImages = previewImages.filter((_, i) => i !== index);
                  setPreviewImages(newImages);
                  setValue('images', newImages);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                ×
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
          value={selectedGroupId || 'none'}
          onValueChange={(value) => setSelectedGroupId(value === 'none' ? null : value)}
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

      {selectedGroupId && groupMembers.length > 0 && (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('split_details')}</h3>
            <div className="flex space-x-2">
              <Select
                value={splitType}
                onValueChange={(value) => handleSplitTypeChange(value as SplitType)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('split_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUAL">{t('split_type_equal')}</SelectItem>
                  <SelectItem value="PERCENTAGE">{t('split_type_percentage')}</SelectItem>
                  <SelectItem value="FIXED">{t('split_type_fixed')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSplit}
              >
                {t('add_split')}
              </Button>
            </div>
          </div>

          {splits.map((split, index) => (
            <div key={index} className="space-y-2 border-b pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`split-included-${index}`}
                    checked={split.isIncluded !== false}
                    onCheckedChange={(checked) => 
                      handleSplitChange(index, 'isIncluded', !!checked)
                    }
                  />
                  <label 
                    htmlFor={`split-included-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('split')} {index + 1}
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSplit(index)}
                >
                  {t('remove')}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('amount')}</Label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={split.isIncluded === false || splitType !== 'FIXED'}
                    value={split.amount || 0}
                    onChange={(e) => handleSplitChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <Label>{t('assigned_to')}</Label>
                  <select
                    value={split.assignedToId}
                    onChange={(e) => handleSplitChange(index, 'assignedToId', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">{t('select_member')}</option>
                    {groupMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <Label>{t('description')}</Label>
                  <input
                    type="text"
                    value={split.description || ''}
                    onChange={(e) => handleSplitChange(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('total_split_amount')}:</span>
              <span className="font-medium">${totalSplitAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('total_amount')}:</span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('amount_difference')}:</span>
              <span className={`font-medium ${Math.abs(amountDifference) > 0.01 ? 'text-red-500' : 'text-green-500'}`}>
                ${amountDifference.toFixed(2)}
              </span>
            </div>
            
            {Math.abs(amountDifference) > 0.01 && (
              <p className="text-sm text-red-500">
                {amountDifference > 0 
                  ? t('amount_not_fully_split') 
                  : t('amount_over_split')}
              </p>
            )}
          </div>
        </div>
      )}

      {canManagePayments && (
        <div className="flex items-center space-x-2">
          <Switch
            id="payment-status"
            checked={isPaid}
            onCheckedChange={setIsPaid}
          />
          <Label htmlFor="payment-status">
            {isPaid ? t('payment_status.paid') : t('payment_status.unpaid')}
          </Label>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </Button>
        <LoadingButton
          isLoading={isSubmitting}
          loadingText={t('saving')}
        >
          {t('save')}
        </LoadingButton>
      </div>
    </form>
  );
}