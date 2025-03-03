import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n-config';
import { ClientSessionProvider } from "@/components/providers/client-session-provider";
import { Toaster } from "sonner";
import "@/app/globals.css";

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 驗證語言是否支持
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 加載翻譯
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientSessionProvider>
              {children}
              <Toaster />
          </ClientSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 