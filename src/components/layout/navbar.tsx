"use client";

import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/store/use-sidebar";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export function Navbar() {
  const { toggle } = useSidebar();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = () => {
    console.log("Menu button clicked");
    toggle();
    console.log("Sidebar state after toggle:", useSidebar.getState().isOpen);
  };
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirect: true, callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
          <h2 className="text-2xl font-bold">FinConnect</h2>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "使用者"}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || "使用者"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>設定檔</DropdownMenuItem>
              <DropdownMenuItem>偏好設定</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    <span>登出中...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>登出</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
