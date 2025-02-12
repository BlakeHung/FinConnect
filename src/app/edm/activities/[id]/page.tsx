import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function EdmPage({
  params,
}: {
  params: { id: string };
}) {
  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: {
      edm: true,
    },
  });

  if (!activity || !activity.edm) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="prose lg:prose-xl mx-auto">
        <h1>{activity.edm.title}</h1>
        
        {activity.edm.images && activity.edm.images.length > 0 && (
          <div className="my-6">
            {activity.edm.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`活動圖片 ${index + 1}`}
                width={800}
                height={400}
                className="rounded-lg shadow-lg"
              />
            ))}
          </div>
        )}

        <div className="whitespace-pre-wrap">
          {activity.edm.content}
        </div>

        {activity.edm.registrationLink && (
          <div className="my-8 text-center">
            <a
              href={activity.edm.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              立即報名
            </a>
          </div>
        )}

        {activity.edm.contactInfo && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2>聯絡資訊</h2>
            <p className="whitespace-pre-wrap">{activity.edm.contactInfo}</p>
          </div>
        )}
      </article>
    </div>
  );
} 