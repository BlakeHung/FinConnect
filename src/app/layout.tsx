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
  title: 'FinConnect | Amis Family Event Financial Management',
  description: 'Financial management system designed for Amis family events, offering budget planning, expense tracking, and financial reporting',
  icons: {
    icon: '/favicon-32.png',
    shortcut: '/favicon-16.png',
    apple: '/apple-touch-icon.png'
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://finconnect.vercel.app'
  ),
  openGraph: {
    title: 'FinConnect | Amis Family Event Financial Management',
    description: 'Financial management system designed for Amis family events, easily manage event budgets and expenses',
    url: 'https://finconnect.tw',
    siteName: 'FinConnect',
    images: [
      {
        url: '/og-image-1200x630.png',  // Facebook recommended size
        width: 1200,
        height: 630,
        alt: 'FinConnect - Amis Family Event Financial Management'
      },
      {
        url: '/og-image-800x800.png',   // Line recommended size
        width: 800,
        height: 800,
        alt: 'FinConnect - Amis Family Event Financial Management'
      },
      {
        url: '/og-image-600x600.png',   // Line minimum size
        width: 600,
        height: 600,
        alt: 'FinConnect - Amis Family Event Financial Management'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinConnect | Amis Family Event Financial Management',
    description: 'Financial management system designed for Amis family events',
    images: ['/og-image-1200x630.png'],
  },
  other: {
    'line-share': 'FinConnect - Amis Family Event Financial Management',
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
              <p>Powered by BlakeLabs</p>
              <a 
                href="https://wchung.tw" 
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