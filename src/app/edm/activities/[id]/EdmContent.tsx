"use client";

import Image from "next/image";
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function EdmContent({ 
  activity 
}: { 
  activity: any 
}) {
  const locale = useLocale();
  const t = useTranslations('edm');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  
  // 可用語言列表
  const availableLocales = ['en', 'zh'];
  
  // 切換語言
  const changeLanguage = (newLocale: string) => {
    // 獲取當前路徑並替換語言部分
    const currentPathWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
    const newPath = `/${newLocale}${currentPathWithoutLocale}`;
    
    startTransition(() => {
      router.push(newPath);
    });
  };

  // 根據當前語言獲取內容
  const title = activity.edm[`title_${locale}`] || activity.edm.title;
  const content = activity.edm[`content_${locale}`] || activity.edm.content;
  const contactInfo = activity.edm[`contactInfo_${locale}`] || activity.edm.contactInfo;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 語言切換器 */}
      <div className="flex justify-end gap-2 mb-6">
        {availableLocales.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            disabled={isPending}
            className={`px-3 py-1 rounded transition-colors ${
              locale === lang
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {lang === "en" ? "English" : "中文"}
          </button>
        ))}
      </div>

      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        
        {activity.edm.images && activity.edm.images.length > 0 && (
          <div className="my-6 space-y-4">
            {activity.edm.images.map((image: string, index: number) => (
              <Image
                key={index}
                src={image}
                alt={`${title} - ${index + 1}`}
                width={800}
                height={400}
                className="rounded-lg shadow-lg"
              />
            ))}
          </div>
        )}

        <div className="whitespace-pre-wrap my-6">
          {content}
        </div>

        {activity.edm.registrationLink && (
          <div className="my-8 text-center">
            <a
              href={activity.edm.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              {t('register')}
            </a>
          </div>
        )}

        {contactInfo && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">{t('contact_info')}</h2>
            <p className="whitespace-pre-wrap">{contactInfo}</p>
          </div>
        )}
      </article>
    </div>
  );
} 