"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/store/use-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { toggle } = useSidebar()

  const handleToggle = () => {
    console.log('Menu button clicked')
    toggle()
    console.log('Sidebar state after toggle:', useSidebar.getState().isOpen)
  }

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <Button 
          variant="ghost" 
          className="md:hidden" 
          size="icon"
          onClick={handleToggle}
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-4 ml-4 md:ml-0">
          <h2 className="text-2xl font-bold">AMIS</h2>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="@username" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">username</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                設定檔
              </DropdownMenuItem>
              <DropdownMenuItem>
                偏好設定
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
} 