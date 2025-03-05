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
import { useTranslations } from "next-intl"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const t = useTranslations('auth')

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
        toast.error(t('login_error'))
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(t('login_error'))
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
        toast.error(t('login_error'))
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(t('login_error'))
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">{t('password')}</Label>
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
              {t('login_loading')}
            </>
          ) : (
            t('login_submit')
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">{t('or')}</span>
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
            {t('login_loading')}
          </>
        ) : (
          t('login_demo')
        )}
      </Button>
    </div>
  )
}

export default function LoginPage() {
  const t = useTranslations('auth')

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">
            {t('login_title')}
          </h1>
          <p className="text-gray-500">
            {t('login_description')}
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
} 