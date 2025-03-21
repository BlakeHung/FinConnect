'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F06292', '#4DB6AC'];

export function TransactionSummary({ 
  data, 
  period = 'month',
  startDate,
  endDate 
}) {
  const t = useTranslations('transactions');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [dateRange, setDateRange] = useState({
    start: startDate ? new Date(startDate) : new Date(new Date().setDate(1)),
    end: endDate ? new Date(endDate) : new Date(),
  });
  
  const updateParams = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    router.replace(`${pathname}?${newParams.toString()}`);
  };
  
  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    
    if (value === 'custom') {
      updateParams({
        period: value,
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd'),
      });
    } else {
      updateParams({
        period: value,
        startDate: null,
        endDate: null,
      });
    }
  };
  
  const handleDateRangeChange = (range) => {
    if (range.from && range.to) {
      setDateRange({ start: range.from, end: range.to });
      updateParams({
        period: 'custom',
        startDate: format(range.from, 'yyyy-MM-dd'),
        endDate: format(range.to, 'yyyy-MM-dd'),
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-lg font-medium">{t('financial_summary')}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedPeriod === 'custom' 
              ? `${format(dateRange.start, 'PP')} - ${format(dateRange.end, 'PP')}` 
              : t(`period_${selectedPeriod}`)}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('select_period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('this_month')}</SelectItem>
              <SelectItem value="quarter">{t('this_quarter')}</SelectItem>
              <SelectItem value="year">{t('this_year')}</SelectItem>
              <SelectItem value="custom">{t('custom_range')}</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedPeriod === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.start, 'PP')} - {format(dateRange.end, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.start,
                    to: dateRange.end,
                  }}
                  onSelect={handleDateRangeChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('total_income')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.income.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('total_expenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.expense.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('balance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.totals.balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="expenses">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">{t('expenses')}</TabsTrigger>
          <TabsTrigger value="income">{t('income')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('expenses_by_category')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.expensesByCategory.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toFixed(2)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {t('no_expenses_data')}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('expense_trend')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.expensesTrend.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.expensesTrend}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => value.toFixed(2)} />
                      <Bar dataKey="amount" fill="#ff6384" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {t('no_expense_trend_data')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('income_by_category')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.incomesByCategory.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.incomesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.incomesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toFixed(2)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {t('no_income_data')}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('income_trend')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.incomesTrend.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.incomesTrend}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => value.toFixed(2)} />
                      <Bar dataKey="amount" fill="#36a2eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {t('no_income_trend_data')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 