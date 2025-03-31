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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const transactionSchema = z.object({
  amount: z.number().positive("金額必須大於 0"),
  categoryId: z.string().min(1, "請選擇類別"),
  date: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  activityId: z.string().optional(),
  groupId: z.string().nullable().optional(),
  payments: z.array(
    z.object({
      payerId: z.string(),
      amount: z.number().positive(),
      paymentMethod: z.string().optional(),
      note: z.string().optional(),
    })
  ).optional(),
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

interface User {
  id: string;
  name: string;
  email?: string;
}

// 分帳方式枚舉
type SplitType = 'EQUAL' | 'PERCENTAGE' | 'FIXED';

interface Split {
  id: string;
  amount: number;
  description?: string;
  assignedToId: string;
  isIncluded?: boolean;
  splitType?: SplitType;
  splitValue?: number;
}

interface Payment {
  payerId: string;
  amount: number;
  paymentMethod?: string;
  note?: string;
}

interface SplitItem {
  id: string;
  name: string;
  amount: number;
  description?: string;
  splitType: SplitType;
  members: SplitItemMember[];
}

interface SplitItemMember {
  memberId: string;
  isIncluded: boolean;
  amount?: number;
}

interface TransactionFormProps {
  categories: Category[];
  activities: Activity[];
  groups?: Group[];
  users?: User[];
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
    payments?: Payment[];
  };
  transactionId?: string;
  canManagePayments?: boolean;
}

export function TransactionForm({ 
  categories, 
  activities,
  groups = [],
  users = [],
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
  const [payments, setPayments] = useState<Payment[]>(defaultValues?.payments || []);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [splitItems, setSplitItems] = useState<SplitItem[]>([]);
  const [showSplitItemModal, setShowSplitItemModal] = useState(false);
  const [currentSplitItem, setCurrentSplitItem] = useState<SplitItem | null>(null);

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
    date: typeof defaultValues.date === 'string' ? defaultValues.date : (defaultValues.date instanceof Date ? defaultValues.date.toISOString().split('T')[0] : today),
    payments: defaultValues.payments || []
  } : { 
    date: today,
    payments: []
  };

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

  // 新增：初始化 splitItems
  useEffect(() => {
    if (defaultValues?.splits && defaultValues.splits.length > 0) {
      console.log("Initializing splitItems from splits:", defaultValues.splits);
      
      // 將 splits 轉換為 splitItems 格式
      const groupedSplits = defaultValues.splits.reduce((acc, split) => {
        // 使用 splitItemType 或 description 作為分組鍵
        const key = split.description || 'default';
        
        if (!acc[key]) {
          acc[key] = {
            id: split.id, // 使用原始的 split ID
            name: split.description || 'default',
            amount: 0,
            splitType: split.splitType || 'EQUAL',
            members: []
          };
        }
        
        // 累加金額
        acc[key].amount += split.amount;
        
        // 添加成員
        acc[key].members.push({
          memberId: split.assignedToId,
          isIncluded: split.isIncluded !== false,
          amount: split.amount
        });
        
        return acc;
      }, {} as Record<string, SplitItem>);
      
      // 轉換為數組
      const initialSplitItems = Object.values(groupedSplits);
      console.log("Converted splitItems:", initialSplitItems);
      setSplitItems(initialSplitItems);
    }
  }, [defaultValues?.splits]);

  // 監聽金額變化
  const currentAmount = watch('amount') || 0;
  
  useEffect(() => {
    setTotalAmount(currentAmount);
  }, [currentAmount]);

  // 當選擇群組時，獲取群組成員
  const fetchGroupMembers = async (groupId: string) => {
    if (groupId) {
      const response = await fetch(`/api/groups/${groupId}/members`);
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

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupMembers(selectedGroupId);
    }
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

  // 新增：處理付款管理
  const handleAddPayment = () => {
    // 預設付款金額為當前未支付的金額
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = totalAmount - paidAmount;
    
    setPayments([
      ...payments, 
      { 
        payerId: users[0]?.id || '',
        amount: remainingAmount > 0 ? remainingAmount : 0,
        paymentMethod: '',
        note: '' 
      }
    ]);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof Payment, value: string | number) => {
    const newPayments = [...payments];
    if (field === 'amount') {
      newPayments[index] = { ...newPayments[index], [field]: Number(value) || 0 };
    } else {
      newPayments[index] = { ...newPayments[index], [field]: value };
    }
    setPayments(newPayments);
  };

  const getTotalPaymentAmount = () => {
    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };

  // 新增分帳項目方法
  const handleAddSplitItem = () => {
    setCurrentSplitItem({
      id: Date.now().toString(),
      name: '',
      amount: 0,
      splitType: 'EQUAL',
      members: groupMembers.map(member => ({
        memberId: member.id,
        isIncluded: true
      }))
    });
    setShowSplitItemModal(true);
  };

  // 保存分帳項目
  const handleSaveSplitItem = (item: SplitItem) => {
    if (!item.name || item.amount <= 0) {
      toast.error(t('invalid_split_item'));
      return;
    }

    // 計算當前所有分帳項目的總金額
    const currentTotal = splitItems.reduce((sum, i) => sum + i.amount, 0);
    
    // 如果是編輯現有項目，需要減去原項目的金額
    const existingItem = splitItems.find(i => i.id === item.id);
    const adjustedTotal = existingItem 
      ? currentTotal - existingItem.amount + item.amount
      : currentTotal + item.amount;

    // 驗證總金額不能超過交易金額
    if (adjustedTotal > totalAmount) {
      toast.error(t('split_amount_exceeds_total'));
      return;
    }

    console.log("Saving split item:", item);
    console.log("Current splitItems before update:", splitItems);
    console.log("Current total:", currentTotal);
    console.log("Adjusted total:", adjustedTotal);
    console.log("Transaction total:", totalAmount);

    // 確保 item 有正確的唯一 ID
    const itemToSave = {
      ...item,
      id: item.id || Date.now().toString()
    };

    // 先檢查是否已存在相同 ID 的項目
    setSplitItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === itemToSave.id);
      let newItems;
      
      if (existingIndex >= 0) {
        // 如果存在，更新該項目
        newItems = prevItems.map((i, index) => 
          index === existingIndex ? itemToSave : i
        );
        console.log("Updating existing item at index:", existingIndex);
      } else {
        // 如果不存在，新增項目
        newItems = [...prevItems, itemToSave];
        console.log("Adding new item");
      }
      
      console.log("Previous items:", prevItems);
      console.log("New items:", newItems);
      return newItems;
    });

    // 使用 setTimeout 來確保狀態更新完成後再關閉模態框
    setTimeout(() => {
      setShowSplitItemModal(false);
      setCurrentSplitItem(null);
      toast.success(t('split_item_saved'));
    }, 0);
  };

  // 計算每個成員應付總額
  const calculateMemberTotal = (memberId: string) => {
    return splitItems.reduce((total, item) => {
      const memberSplit = item.members.find(m => m.memberId === memberId);
      if (memberSplit?.isIncluded) {
        if (item.splitType === 'FIXED') {
          return total + (memberSplit.amount || 0);
        } else if (item.splitType === 'EQUAL') {
          const includedMembersCount = item.members.filter(m => m.isIncluded).length;
          return total + (includedMembersCount > 0 ? item.amount / includedMembersCount : 0);
        }
      }
      return total;
    }, 0);
  };

  const onSubmit = async (data: TransactionFormData) => {
    console.log("Form submitted with data:", JSON.stringify(data, null, 2));
    console.log("Current splitItems:", JSON.stringify(splitItems, null, 2));
    console.log("Current payments state:", JSON.stringify(payments, null, 2));
    
    setIsSubmitting(true);
    
    try {
      const url = transactionId 
        ? `/api/transactions/${transactionId}` 
        : '/api/transactions';
      
      const method = transactionId ? 'PUT' : 'POST';
      
      // 轉換 splitItems 為 API 所需格式
      const apiSplits = [];
      
      for (const item of splitItems) {
        console.log("Processing split item:", JSON.stringify(item, null, 2));
        const includedMembers = item.members.filter(m => m.isIncluded);
        const memberCount = includedMembers.length;
        
        if (memberCount === 0) continue;
        
        for (const member of includedMembers) {
          let splitAmount = 0;
          
          if (item.splitType === 'FIXED') {
            splitAmount = member.amount || 0;
          } else if (item.splitType === 'EQUAL') {
            splitAmount = item.amount / memberCount;
          }
          
          const splitData = {
            amount: splitAmount,
            description: item.name,
            assignedToId: member.memberId,
            splitType: item.splitType,
            isIncluded: true
          };
          console.log("Created split data:", JSON.stringify(splitData, null, 2));
          apiSplits.push(splitData);
        }
      }
      
      console.log("Final apiSplits:", JSON.stringify(apiSplits, null, 2));
      
      // 處理付款資料
      const processedPayments = payments.map(payment => ({
        payerId: payment.payerId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || null,
        note: payment.note || null
      }));
      
      console.log("Processed payments:", JSON.stringify(processedPayments, null, 2));
      
      const requestBody = {
        ...data,
        type,
        paymentStatus: isPaid ? 'PAID' : 'UNPAID',
        groupId: selectedGroupId || null,
        splits: apiSplits.length > 0 ? apiSplits : undefined,
        payments: processedPayments.length > 0 ? processedPayments : undefined,
      };
      
      console.log("Final request body:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return new Error('提交失敗');
      }

      const responseData = await response.json();
      console.log("API Response:", JSON.stringify(responseData, null, 2));

      toast.success(t('form.submit_success'));
      router.push('/transactions');
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t('form.submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 計算分帳和付款的金額差異
  const totalSplitAmount = getTotalSplitAmount();
  const totalPaymentAmount = getTotalPaymentAmount();
  const amountDifference = totalAmount - totalSplitAmount;
  const paymentDifference = totalAmount - totalPaymentAmount;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">{t('details')}</TabsTrigger>
          <TabsTrigger value="split">{t('split')}</TabsTrigger>
          <TabsTrigger value="payment">{t('payment')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="split" className="space-y-4">
          {selectedGroupId ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t('split_items')}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSplitItem}
                >
                  {t('add_split_item')}
                </Button>
              </div>
              
              {/* 分帳項目列表 */}
              {splitItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('no_split_items')}</p>
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddSplitItem();
                    }} 
                    className="mt-4"
                  >
                    {t('add_split_item')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {splitItems.map((item) => (
                    <Card key={`split-item-${item.id}`} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{item.name} {item.id}</h4>
                          <p className="text-sm text-gray-500">
                            {t('amount')}: ${item.amount.toFixed(2)} • 
                            {t(`split_type_${item.splitType.toLowerCase()}`)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentSplitItem(item);
                              setShowSplitItemModal(true);
                            }}
                          >
                            {t('edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSplitItems(prev => prev.filter(i => i.id !== item.id))}
                          >
                            {t('remove')}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">{t('participants')}</h5>
                        <div className="flex flex-wrap gap-2">
                          {item.members.map((member) => {
                            const groupMember = groupMembers.find(m => m.id === member.memberId);
                            return groupMember ? (
                              <Badge
                                key={`member-${member.memberId}`}
                                variant={member.isIncluded ? "default" : "outline"}
                                className="flex items-center gap-1"
                              >
                                {groupMember.name}
                                {member.isIncluded && item.splitType === 'FIXED' && (
                                  <span>: ${member.amount?.toFixed(2)}</span>
                                )}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {/* 成員付款摘要 */}
                  <Card key="member-totals" className="p-4 mt-6">
                    <h4 className="font-medium mb-4">{t('member_totals')}</h4>
                    <div className="space-y-2">
                      {groupMembers.map((member) => {
                        const total = calculateMemberTotal(member.id);
                        return (
                          <div key={`total-${member.id}`} className="flex justify-between items-center">
                            <span>{member.name}</span>
                            <span className="font-medium">${total.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('select_group_for_split')}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('payment_details')}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPayment}
            >
              {t('add_payment')}
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('no_payment_records')}</p>
              <Button onClick={handleAddPayment} className="mt-4" variant="outline">
                {t('add_payment')}
              </Button>
            </div>
          ) : (
            <>
              {payments.map((payment, index) => (
                <div key={index} className="space-y-2 border-b pb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{t('payment')} {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePayment(index)}
                    >
                      {t('remove')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('payer')}</Label>
                      <select
                        value={payment.payerId}
                        onChange={(e) => handlePaymentChange(index, 'payerId', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="">{t('select_payer')}</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                        {groupMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>{t('amount')}</Label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={payment.amount || 0}
                        onChange={(e) => handlePaymentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <Label>{t('payment_method_title')}</Label>
                      <select
                        value={payment.paymentMethod || ''}
                        onChange={(e) => handlePaymentChange(index, 'paymentMethod', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="">{t('select_method')}</option>
                        <option value="CASH">{t('payment_method.cash')}</option>
                        <option value="CREDIT_CARD">{t('payment_method.credit_card')}</option>
                        <option value="BANK_TRANSFER">{t('payment_method.bank_transfer')}</option>
                        <option value="OTHER">{t('payment_method.other')}</option>
                      </select>
                    </div>

                    <div>
                      <Label>{t('note')}</Label>
                      <input
                        type="text"
                        value={payment.note || ''}
                        onChange={(e) => handlePaymentChange(index, 'note', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('total_payment_amount')}:</span>
                  <span className="font-medium">${totalPaymentAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('total_amount')}:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('payment_difference')}:</span>
                  <span className={`font-medium ${Math.abs(paymentDifference) > 0.01 ? 'text-red-500' : 'text-green-500'}`}>
                    ${paymentDifference.toFixed(2)}
                  </span>
                </div>
                
                {Math.abs(paymentDifference) > 0.01 && (
                  <p className="text-sm text-red-500">
                    {paymentDifference > 0 
                      ? t('amount_not_fully_paid') 
                      : t('amount_over_paid')}
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

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

      {/* 分帳項目編輯模態框 */}
      {showSplitItemModal && currentSplitItem && (
        <SplitItemModal
          item={currentSplitItem}
          members={groupMembers}
          onClose={() => {
            setShowSplitItemModal(false);
            setCurrentSplitItem(null);
          }}
          onSave={handleSaveSplitItem}
        />
      )}
    </form>
  );
}

// 新增：分帳項目編輯模態框組件
function SplitItemModal({
  item,
  members,
  onClose,
  onSave
}: {
  item: SplitItem;
  members: GroupMember[];
  onClose: () => void;
  onSave: (item: SplitItem) => void;
}) {
  const [editItem, setEditItem] = useState<SplitItem>(item);
  const t = useTranslations('transactions');
  
  const handleMemberChange = (memberId: string, field: string, value: any) => {
    setEditItem(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.memberId === memberId ? { ...m, [field]: value } : m
      )
    }));
  };
  
  const calculateRemainingMembers = () => {
    return members.filter(member => 
      !editItem.members.some(m => m.memberId === member.id)
    );
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.id ? t('edit_split_item') : t('add_split_item')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <Label>{t('name')}</Label>
            <Input
              value={editItem.name}
              onChange={(e) => setEditItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('item_name_placeholder')}
            />
          </div>
          
          <div>
            <Label>{t('amount')}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editItem.amount}
              onChange={(e) => setEditItem(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div>
            <Label>{t('split_type')}</Label>
            <Select
              value={editItem.splitType}
              onValueChange={(value) => setEditItem(prev => ({ ...prev, splitType: value as SplitType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUAL">{t('split_type_equal')}</SelectItem>
                <SelectItem value="FIXED">{t('split_type_fixed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="mb-2 block">{t('participants')}</Label>
            
            <div className="space-y-3 max-h-60 overflow-y-auto p-2">
              {editItem.members.map((member) => {
                const groupMember = members.find(m => m.id === member.memberId);
                if (!groupMember) return null;
                
                return (
                  <div key={member.memberId} className="flex items-center gap-3 border-b pb-2">
                    <Checkbox
                      id={`include-${member.memberId}`}
                      checked={member.isIncluded}
                      onCheckedChange={(checked) => 
                        handleMemberChange(member.memberId, 'isIncluded', !!checked)
                      }
                    />
                    <Label htmlFor={`include-${member.memberId}`} className="flex-1">
                      {groupMember.name}
                    </Label>
                    
                    {member.isIncluded && editItem.splitType === 'FIXED' && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={member.amount || 0}
                        onChange={(e) => handleMemberChange(
                          member.memberId, 
                          'amount', 
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-24"
                      />
                    )}
                  </div>
                );
              })}
              
              {/* 新增成員 */}
              {calculateRemainingMembers().length > 0 && (
                <div className="mt-4">
                  <Label>{t('add_member')}</Label>
                  <Select
                    onValueChange={(value) => {
                      setEditItem(prev => ({
                        ...prev,
                        members: [
                          ...prev.members,
                          {
                            memberId: value,
                            isIncluded: true,
                            amount: 0
                          }
                        ]
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_member')} />
                    </SelectTrigger>
                    <SelectContent>
                      {calculateRemainingMembers().map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}>
            {t('cancel')}
          </Button>
          <Button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(editItem);
          }}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}