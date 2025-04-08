"use client"

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useLoading } from '@/store/use-loading'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

function LoadingState() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner className="h-8 w-8" />
      </div>
    </div>
  )
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { setLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 配置 NProgress
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08
    })

    // 保存原始的 fetch 函數
    const originalFetch = window.fetch

    // 替換 fetch 函數以攔截請求
    window.fetch = async (...args) => {
      const [resource] = args
      const url = resource instanceof Request ? resource.url : resource.toString()

      // 檢查是否是 RSC 請求
      if (url.includes('_rsc=')) {
        NProgress.start()
        setLoading(true)

        try {
          const response = await originalFetch(...args)
          return response
        } finally {
          // 設置一個小延遲來確保 loading 狀態可見
          setTimeout(() => {
            NProgress.done()
            setLoading(false)
          }, 500)
        }
      }

      return originalFetch(...args)
    }

    // 清理函數
    return () => {
      window.fetch = originalFetch
      NProgress.remove()
    }
  }, [setLoading])

  // 路由變化時的 loading 效果
  useEffect(() => {
    NProgress.start()
    setLoading(true)

    const timeout = setTimeout(() => {
      NProgress.done()
      setLoading(false)
    }, 500)

    return () => {
      clearTimeout(timeout)
      NProgress.remove()
    }
  }, [pathname, searchParams, setLoading])

  return (
    <Suspense fallback={null}>
      <LoadingState />
      {children}
    </Suspense>
  )
} 