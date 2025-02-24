import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Inter } from 'next/font/google'
import { LoadingProvider } from "@/components/providers/loading-provider"
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '阿美族家族活動記帳系統',
  description: '專為阿美族家族活動設計的財務管理與記帳系統，提供完整的預算規劃、收支記錄、結算報表等功能',
  icons: {
    icon: '/favicon-32.svg',
    shortcut: '/favicon-16.svg',
    apple: '/apple-touch.svg'
  },
  openGraph: {
    title: '阿美族家族活動記帳系統',
    description: '專為阿美族家族活動設計的財務管理與記帳系統，輕鬆管理活動預算與支出',
    url: 'https://wchung.tw',
    siteName: '阿美族家族活動記帳系統',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'zh_TW',
    type: 'website',
  },
  other: {
    'line-share': '阿美族家族活動記帳系統', // Line 特定的標籤
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LoadingProvider>
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
            <footer className="py-4 text-center text-sm text-gray-500 safe-area-bottom">
              Powered by{' '}
              <a 
                href="https://blakelabs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                Blake Labs
              </a>
            </footer>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
