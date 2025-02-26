import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from 'next/font/google'
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://amis-management.vercel.app'
  ),
  openGraph: {
    title: '阿美族家族活動記帳系統',
    description: '專為阿美族家族活動設計的財務管理與記帳系統，輕鬆管理活動預算與支出',
    url: 'https://wchung.tw',
    siteName: '阿美族家族活動記帳系統',
    images: [
      {
        url: '/og-image-1200x630.svg',  // Facebook 推薦尺寸
        width: 1200,
        height: 630,
        alt: '阿美族家族活動記帳系統'
      },
      {
        url: '/og-image-800x800.svg',   // Line 推薦尺寸
        width: 800,
        height: 800,
        alt: '阿美族家族活動記帳系統'
      },
      {
        url: '/og-image-600x600.svg',   // Line 最小尺寸
        width: 600,
        height: 600,
        alt: '阿美族家族活動記帳系統'
      }
    ],
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '阿美族家族活動記帳系統',
    description: '專為阿美族家族活動設計的財務管理與記帳系統',
    images: ['/og-image-1200x630.svg'],
  },
  other: {
    'line-share': '阿美族家族活動記帳系統',
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
      </body>
    </html>
  );
}
