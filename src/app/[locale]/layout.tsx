import { NextIntlClientProvider } from 'next-intl';
import { getMessages, locales, type Locale } from '@/lib/i18n';
import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';
import '../globals.css';

// 設置字體
const inter = Inter({ subsets: ['latin'] });

// 生成靜態參數
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

// 設置元數據
export const metadata = {
  title: 'FinConnect - Amis Family Event',
  description: 'Financial management for Amis Family events',
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // 獲取翻譯消息
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Taipei">
      <div className={inter.className}>
        {children}
        <Toaster />
      </div>
    </NextIntlClientProvider>
  );
} 