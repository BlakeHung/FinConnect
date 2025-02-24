"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

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
        toast.error("登入失敗，請檢查帳號密碼")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("登入失敗，請稍後再試")
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
        toast.error("訪客登入失敗，請稍後再試")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("訪客登入失敗，請稍後再試")
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">密碼</Label>
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
              登入中...
            </>
          ) : (
            "登入"
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
            登入中...
          </>
        ) : (
          "訪客登入"
        )}
      </Button>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError('登入時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">登入系統</h1>
          <p className="text-gray-500">請輸入您的帳號密碼</p>
        </div>
        <LoginForm />
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
            {error}
          </div>
        )}
      </Card>
    </div>
  )
} 