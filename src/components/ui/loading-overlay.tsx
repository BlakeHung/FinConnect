"use client"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  loadingText?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  className,
  loadingText = "處理中..."
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50",
          className
        )}>
          <Spinner className="h-8 w-8 text-blue-600" />
          <p className="mt-2 text-sm text-gray-500">{loadingText}</p>
        </div>
      )}
    </div>
  )
} 