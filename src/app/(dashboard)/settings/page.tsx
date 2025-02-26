"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { availableLocales } from "@/lib/i18n/translations";

export default function SettingsPage() {
  const { locale, changeLanguage, t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t.common.settings}</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium mb-2">{t.common.language}</h2>
          <div className="flex gap-2">
            {availableLocales.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-4 py-2 rounded ${
                  locale === lang
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {lang === "en" ? "English" : "中文"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 