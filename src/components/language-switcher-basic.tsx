'use client';

import { useClientLocale, useSetLocale } from '@/lib/i18n/utils';
import { useClientTranslation } from '@/lib/i18n/utils';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

// 語言選項
const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

export default function LanguageSwitcherBasic() {
  const t = useClientTranslation('settings');
  const locale = useClientLocale();
  const setLocale = useSetLocale();
  const [isOpen, setIsOpen] = useState(false);      
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉下拉菜單
  // 點擊外部關閉下拉菜單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span>{t('language')}</span>
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  locale === language.code ? 'bg-gray-50 font-medium' : ''
                }`}
                onClick={() => {
                  setLocale(language.code);
                  setIsOpen(false);
                }}
              >
                <span>{language.name}</span>
                {locale === language.code && (
                  <svg
                    className="h-4 w-4 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 