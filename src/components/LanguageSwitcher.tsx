"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { availableLocales, type Locale } from '@/lib/i18n'
import { getClientLocale, setLocale } from '@/lib/i18n/utils'
import { useEffect, useState } from 'react'

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh')

  useEffect(() => {
    setCurrentLocale(getClientLocale())
  }, [])

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableLocales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale === 'zh' ? '中文' : 'English'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 