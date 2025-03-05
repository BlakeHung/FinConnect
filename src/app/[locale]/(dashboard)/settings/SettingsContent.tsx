"use client";

import {
  useClientTranslation,
  useClientLocale,
  useSetLocale,
} from "@/lib/i18n/utils";
import { locales } from "@/lib/i18n";

export function SettingsContent() {
  const t = useClientTranslation("settings");
  const locale = useClientLocale();
  const setLocale = useSetLocale();

  // 語言切換函數
  const changeLanguage = (lang: string) => {
    setLocale(lang);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium mb-2">{t("language")}</h2>
          <div className="flex gap-2">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-4 py-2 rounded ${
                  locale === lang
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {t(`languages.${lang}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
