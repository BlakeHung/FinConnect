import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EdmContent } from "./EdmContent";

export default async function EdmPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: { edm: true },
  });

  if (!activity || !activity.edm) {
    notFound();
  }

  return <EdmContent activity={activity} />;
} 