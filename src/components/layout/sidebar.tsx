"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/store/use-sidebar"
import { useSession } from "next-auth/react"
import { useClientTranslation, useClientLocale } from '@/lib/i18n/utils'
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Tag,
  Users,
  CalendarDays,
  Calendar,
  LogOut
} from "lucide-react"
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const { data: session } = useSession()
  const t = useClientTranslation('sidebar')
  const pathname = usePathname()
  const locale = useClientLocale()
  
  const commonRoutes = [
    {
      label: t('dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      label: t('transactions'),
      icon: <Receipt className="w-5 h-5" />,
      href: "/transactions",
    },
    {
      label: t('categories'),
      icon: <PieChart className="w-5 h-5" />,
      href: "/categories",
    },
    {
      label: t('settings'),
      icon: <Settings className="w-5 h-5" />,
      href: "/settings",
    },
  ]

  const adminRoutes = [
    {
      label: t('users'),
      icon: <Users className="w-5 h-5" />,
      href: "/users",
    },
    {
      label: t('activities'),
      icon: <CalendarDays className="w-5 h-5" />,
      href: "/activities",
    },
  ]

  // 根據使用者角色決定要顯示的路由
  const routes = session?.user?.role === 'ADMIN' 
    ? [...commonRoutes, ...adminRoutes]
    : commonRoutes;

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  // 生成包含當前語言的完整路徑
  const getLocalizedHref = (href: string) => {
    return `/${locale}${href}`;
  };

  return (
    <>
      {/* 行動版遮罩層 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggle}
        />
      )}

      {/* 側邊欄 */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 w-72 h-full bg-gray-100",
        "md:static md:z-0",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* 行動版頂部空間 */}
          <div className="h-16 md:hidden" /> {/* 為 Navbar 預留空間 */}
          
          <div className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={getLocalizedHref(route.href)}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggle()
                    }
                  }}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer",
                    "hover:text-primary hover:bg-primary/10 rounded-lg transition",
                    isActive(route.href) ? 'bg-gray-100 font-medium' : ''
                  )}
                >
                  <div className="flex items-center flex-1 gap-3">
                    {route.icon}
                    <span>{route.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 