import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Inter } from 'next/font/google'
import { LoadingProvider } from "@/components/providers/loading-provider"

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
  title: "AMIS Finance",
  description: "AMIS Finance Management System",
};

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
