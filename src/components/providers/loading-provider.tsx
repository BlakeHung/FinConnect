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

    // 創建一個 MutationObserver 來監視 DOM 變化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes)
          const isRscRequest = addedNodes.some((node) => {
            if (node instanceof HTMLScriptElement) {
              return node.src?.includes('_rsc=') || node.src?.includes('_next/')
            }
            return false
          })

          if (isRscRequest) {
            NProgress.start()
            setLoading(true)
            
            // 設置一個合理的超時時間來結束 loading 狀態
            setTimeout(() => {
              NProgress.done()
              setLoading(false)
            }, 500)
          }
        }
      })
    })

    // 開始觀察 DOM 變化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 清理函數
    return () => {
      observer.disconnect()
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