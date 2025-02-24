"use client"

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <Spinner className="h-8 w-8 text-blue-600" />
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        </div>
      )}
      {children}
    </>
  )
} 