"use client"

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useLoading } from '@/store/use-loading'

function LoadingState() {
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isLoading, setLoading } = useLoading()

  useEffect(() => {
    // 路由變化時設置加載狀態
    setLoading(true)
    setProgress(0)
    
    // 模擬進度條
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 100)

    const timer = setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }, 500)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [pathname, searchParams, setLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <Spinner className="h-8 w-8 text-blue-600" />
        <p className="mt-2 text-sm text-gray-500">載入中...</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LoadingState />
      {children}
    </Suspense>
  )
} 