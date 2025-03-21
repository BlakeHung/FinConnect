'use client';

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";

export function TransactionFilters({ 
  categories, 
  activities 
}) {
  const t = useTranslations('transactions');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 從 URL 讀取初始篩選條件
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    activityId: searchParams.get('activityId') || '',
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : null,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : null,
    type: searchParams.get('type') || '',
    minAmount: searchParams.get('minAmount') || '',
    maxAmount: searchParams.get('maxAmount') || '',
  });
  
  // 當篩選器改變時更新 URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'startDate' || key === 'endDate') {
          params.set(key, format(value, 'yyyy-MM-dd'));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    router.replace(`${pathname}?${params.toString()}`);
  }, [filters, pathname, router]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      activityId: '',
      startDate: null,
      endDate: null,
      type: '',
      minAmount: '',
      maxAmount: '',
    });
  };
  
  const hasFilters = Object.values(filters).some(value => value);
  
  return (
    <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{t('filters')}</h3>
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            {t('clear_filters')}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search_description')}
            className="pl-8"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <select
          className="h-10 w-full rounded-md border border-input px-3 py-2"
          value={filters.categoryId}
          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
        >
          <option value="">{t('all_categories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <select
          className="h-10 w-full rounded-md border border-input px-3 py-2"
          value={filters.activityId}
          onChange={(e) => handleFilterChange('activityId', e.target.value)}
        >
          <option value="">{t('all_activities')}</option>
          <option value="none">{t('no_activity')}</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="h-10 w-full rounded-md border border-input px-3 py-2"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">{t('all_types')}</option>
          <option value="EXPENSE">{t('expenses')}</option>
          <option value="INCOME">{t('income')}</option>
        </select>
        
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder={t('min_amount')}
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
          <Input
            type="number"
            placeholder={t('max_amount')}
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? format(filters.startDate, "PPP") : t('start_date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => handleFilterChange('startDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate ? format(filters.endDate, "PPP") : t('end_date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => handleFilterChange('endDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 