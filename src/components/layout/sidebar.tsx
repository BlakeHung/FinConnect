"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/store/use-sidebar"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Tag,
  Users,
  CalendarDays
} from "lucide-react"

const commonRoutes = [
  {
    label: "總覽",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "交易紀錄",
    icon: Receipt,
    href: "/transactions",
  },
  {
    label: "分類管理",
    icon: Tag,
    href: "/categories",
  },
  {
    label: "統計分析",
    icon: PieChart,
    href: "/analytics",
  },
  {
    label: "設定",
    icon: Settings,
    href: "/settings",
  },
]

const adminRoutes = [
  {
    label: "使用者管理",
    icon: Users,
    href: "/users",
  },
  {
    label: "活動管理",
    icon: CalendarDays,
    href: "/activities",
  },
]

export function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const { data: session } = useSession()
  
  // 根據使用者角色決定要顯示的路由
  const routes = session?.user?.role === 'ADMIN' 
    ? [...commonRoutes, ...adminRoutes]
    : commonRoutes;

  console.log('Sidebar render, isOpen:', isOpen)

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
                  href={route.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggle()
                    }
                  }}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer",
                    "hover:text-primary hover:bg-primary/10 rounded-lg transition"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className="h-5 w-5 mr-3" />
                    {route.label}
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