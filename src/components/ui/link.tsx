"use client";

import { Link as IntlLink } from '@/i18n'; // 使用我們自己的 i18n 導出
import { ComponentProps } from 'react';

export function Link(props: ComponentProps<typeof IntlLink>) {
  return <IntlLink {...props} />;
} 