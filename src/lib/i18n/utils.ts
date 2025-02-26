import { translations, type Locale } from '@/lib/i18n'

// 伺服器端使用
export function getServerLocale(): Locale {
  return 'zh'  // 預設中文
}

export function getTranslation(locale: Locale) {
  return translations[locale]
}

// 客戶端使用
export function getClientLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'zh'  // 預設中文
  }

  // 從 cookie 讀取語言設定
  const cookieLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1] as Locale

  return cookieLocale || 'zh'  // 預設中文
}

export function getClientTranslation() {
  return translations[getClientLocale()]
}

export function setLocale(locale: Locale) {
  // 設定 cookie
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
  // 重新載入頁面以更新所有組件的翻譯
  window.location.reload()
} 