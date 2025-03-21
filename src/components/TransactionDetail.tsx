'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClientLocale } from '@/lib/i18n/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, ArrowLeft, Receipt, Users, Trash, DollarSign } from "lucide-react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionSplitForm } from "@/components/TransactionSplitForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useClientTranslation } from '@/lib/i18n/utils';
import { toast } from "sonner";
import Image from "next/image";

interface TransactionDetailProps {
  transaction: any;
  categories: any[];
  activities: any[];
  groups: any[];
  isCreator: boolean;
  locale: string;
}

export function TransactionDetail({ 
  transaction, 
  categories, 
  activities, 
  groups,
  isCreator,
  locale
}: TransactionDetailProps) {
  const router = useRouter();
  const t = useClientTranslation('transactions');
  const [isEditing, setIsEditing] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      
      toast.success(t('delete_success'));
      router.push(`/${locale}/transactions`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(t('delete_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitTransaction = () => {
    setIsSplitting(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/${locale}/transactions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Button>
        
        {isCreator && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSplitTransaction}
            >
              <Users className="h-4 w-4 mr-2" />
              {t('split_expense')}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteAlertOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              {t('delete')}
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {transaction.amount.toFixed(2)}
              </CardTitle>
              <CardDescription>
                {transaction.category.name} • {formatDate(transaction.date)}
              </CardDescription>
            </div>
            <Badge className={transaction.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              {transaction.type === 'EXPENSE' ? t('expense') : t('income')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('description')}</h3>
              <p>{transaction.description || t('no_description')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('recorder')}</h3>
              <p>{transaction.createdBy?.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('activity')}</h3>
              <p>{transaction.activity?.name || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('payment_status')}</h3>
              <Badge variant={transaction.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                {transaction.paymentStatus === 'PAID' ? t('payment_status.paid') : t('payment_status.unpaid')}
              </Badge>
            </div>
          </div>
          
          {transaction.images && transaction.images.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">{t('images')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {transaction.images.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md">
                    <Image
                      src={image}
                      alt={`Transaction image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {transaction.splits && transaction.splits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('split_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('group')}</h3>
                <p>{transaction.group?.name}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">{t('split_members')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.splits.map((split) => (
                    <div key={split.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{split.member.name}</p>
                        {split.member.user && (
                          <p className="text-xs text-gray-500">{split.member.user.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{split.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{(split.share * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 編輯對話框 */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            categories={categories}
            activities={activities}
            type={transaction.type}
            defaultValues={{
              amount: transaction.amount,
              categoryId: transaction.categoryId,
              date: transaction.date,
              description: transaction.description || '',
              images: transaction.images || [],
              activityId: transaction.activityId || '',
              paymentStatus: transaction.paymentStatus
            }}
            transactionId={transaction.id}
            canManagePayments={true}
          />
        </DialogContent>
      </Dialog>
      
      {/* 費用分攤對話框 */}
      <Dialog open={isSplitting} onOpenChange={setIsSplitting}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('split_expense')}</DialogTitle>
          </DialogHeader>
          <TransactionSplitForm 
            transaction={transaction}
            groups={groups}
            onClose={() => setIsSplitting(false)}
            locale={locale}
          />
        </DialogContent>
      </Dialog>
      
      {/* 刪除確認對話框 */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? t('deleting') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 