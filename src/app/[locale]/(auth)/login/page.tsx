"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useClientTranslation } from "@/lib/i18n/utils"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useClientTranslation('auth')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      setIsLoading(true)
      const response = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      })

      if (response?.error) {
        toast.error(mounted ? t('login_error') : "登入失敗")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(mounted ? t('login_error') : "登入失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true)
      const response = await signIn("credentials", {
        email: "demo@wchung.tw",
        password: "demo2025",
        redirect: false,
      })

      if (response?.error) {
        toast.error(mounted ? t('login_error') : "登入失敗")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(mounted ? t('login_error') : "登入失敗")
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{mounted ? t('email') : "電子郵件"}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">{mounted ? t('password') : "密碼"}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isDemoLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {mounted ? t('login_loading') : "登入中..."}
            </>
          ) : (
            mounted ? t('login_submit') : "登入"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">或</span>
        </div>
      </div>

      <Button
        onClick={handleDemoLogin}
        variant="outline"
        className="w-full"
        disabled={isLoading || isDemoLoading}
      >
        {isDemoLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {mounted ? t('login_loading') : "登入中..."}
          </>
        ) : (
          mounted ? t('login_demo') : "使用 Demo 帳號"
        )}
      </Button>
    </div>
  )
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const t = useClientTranslation('auth')

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">
            {mounted ? t('login_title') : "登入"}
          </h1>
          <p className="text-gray-500">
            {mounted ? t('login_description') : "歡迎回來"}
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
} 