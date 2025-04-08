import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { EdmForm } from "@/components/EdmForm";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { withServerLoading } from '@/lib/prisma-with-loading';

// 動態生成 metadata
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'activity_edm' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

type PageProps = {
  params: { id: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EdmPage({
  params,
  searchParams,
}: PageProps) {
  // 設置請求語言，啟用靜態渲染
  setRequestLocale(params.locale);
  
  const { id } = params;
  const session = await getServerSession(authOptions);
  
  // 獲取翻譯
  const t = await getTranslations({ locale: params.locale, namespace: 'activity_edm' });
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/activities');
  }

  const activity = await withServerLoading(async () => {
    return await prisma.activity.findUnique({
      where: { id },
      include: {
        edm: true,
      },
    });
  });

  if (!activity) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('edit_activity_edm')}</h1>
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">{activity.name}</h2>
          <p className="text-sm text-gray-500">
            {new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}
          </p>
        </div>
        <EdmForm 
          activityId={activity.id}
          defaultValues={activity.edm || undefined}
        />
      </div>
    </div>
  );
} 