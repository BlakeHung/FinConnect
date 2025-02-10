"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : '登入'}
          </Button>
        </form>
      </Card>
    </div>
  )
} 