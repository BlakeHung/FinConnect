import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EdmContent } from "./EdmContent";
import { withServerLoading } from '@/lib/prisma-with-loading';

export default async function EdmPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // 獲取活動詳情
  const activity = await withServerLoading(async () => {
    return await prisma.activity.findUnique({
      where: {
        id: params.id,
      },
      include: {
        transactions: true,
        group: true,
      },
    });
  });

  if (!activity || !activity.edm) {
    notFound();
  }

  return <EdmContent activity={activity} />;
} 