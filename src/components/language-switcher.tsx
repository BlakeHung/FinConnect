'use client';

import { useClientLocale, useSetLocale } from '@/lib/i18n/utils';
import { useClientTranslation } from '@/lib/i18n/utils';
import { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// 語言選項
const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

export default function LanguageSwitcher() {
  const t = useClientTranslation('settings');
  const locale = useClientLocale();
  const setLocale = useSetLocale();
  const [open, setOpen] = useState(false);

  // 獲取當前語言名稱
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 focus:outline-none">
        <Globe className="h-4 w-4" />
        <span>{t('language')}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => {
              setLocale(language.code);
              setOpen(false);
            }}
          >
            <span>{language.name}</span>
            {locale === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 