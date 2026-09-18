'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter as useNextRouter, usePathname } from '@/i18n/routing';
import { useMemo } from 'react';

export type Locale = 'en' | 'am' | 'om';

export interface I18nValue {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tj: (obj?: Record<string, string> | null) => string;
  money: (n: number) => string;
  num: (n: number) => string;
  date: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string;
  time: (d: Date | string) => string;
}

const INTL_LOCALE: Record<Locale, string> = { en: 'en-GB', am: 'am-ET', om: 'en-GB' };

/**
 * Drop-in replacement for the old useI18n hook - works with next-intl
 */
export function useI18n(): I18nValue {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return useMemo(() => {
    const intl = INTL_LOCALE[locale];
    
    const translate = (key: string, vars?: Record<string, string | number>) => {
      try {
        // next-intl expects variables to be passed directly
        const found = vars ? t(key, vars) : t(key);
        return String(found);
      } catch (error) {
        // If the key doesn't exist, return the key itself
        return key;
      }
    };

    return {
      locale,
      t: translate,
      tj: (obj) => (obj ? obj[locale] || obj.en || Object.values(obj)[0] || '' : ''),
      money: (n) =>
        new Intl.NumberFormat(intl, { maximumFractionDigits: 0 }).format(n) +
        ' ' +
        translate('common.etb'),
      num: (n) => new Intl.NumberFormat(intl).format(n),
      date: (d, opts) =>
        new Intl.DateTimeFormat(
          intl,
          opts ?? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
        ).format(typeof d === 'string' ? new Date(d) : d),
      time: (d) =>
        new Intl.DateTimeFormat(intl, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(typeof d === 'string' ? new Date(d) : d),
    };
  }, [locale, t]);
}

/**
 * Drop-in replacement for the old useRouter hook - works with next-intl navigation
 */
export function useRouter() {
  const router = useNextRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  return useMemo(() => {
    // Parse current path segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Get query params from window if available (client-side only)
    const query: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.forEach((v, k) => (query[k] = v));
    }

    return {
      locale,
      segments,
      path: pathname,
      query,
      navigate: (path: string, queryParams?: Record<string, string | number | undefined>) => {
        const qs = queryParams
          ? Object.entries(queryParams)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
              .join('&')
          : '';
        
        const url = qs ? `${path}?${qs}` : path;
        router.push(url);
        
        // Scroll to top
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      },
      setLocale: (newLocale: Locale) => {
        router.replace(pathname, { locale: newLocale });
      },
    };
  }, [router, pathname, locale]);
}
