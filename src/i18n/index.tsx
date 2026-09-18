import { createContext, useContext, useMemo } from "react";
import { messages, type Locale } from "./messages";
import { useRouter } from "@/lib/router";

export type I18nValue = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tj: (obj?: Record<string, string> | null) => string;
  money: (n: number) => string;
  num: (n: number) => string;
  date: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string;
  time: (d: Date | string) => string;
};

const Ctx = createContext<I18nValue | null>(null);

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
}

/** Minimal ICU: {var} interpolation + {count, plural, one {…} other {…}} */
function format(template: string, vars: Record<string, string | number> = {}): string {
  let out = template.replace(
    /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\s*\}/g,
    (_m, name: string, one: string, other: string) => {
      const n = Number(vars[name] ?? 0);
      const chosen = n === 1 ? one : other;
      return chosen.replace(/#/g, String(n));
    },
  );
  out = out.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? `{${name}}`));
  return out;
}

const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", am: "am-ET", om: "en-GB" };

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useRouter();

  const value = useMemo<I18nValue>(() => {
    const intl = INTL_LOCALE[locale];
    const t = (key: string, vars?: Record<string, string | number>) => {
      const found = lookup(messages[locale], key) ?? lookup(messages.en, key);
      if (typeof found !== "string") return key;
      return format(found, vars);
    };
    return {
      locale,
      t,
      tj: (obj) => (obj ? obj[locale] || obj.en || Object.values(obj)[0] || "" : ""),
      money: (n) =>
        new Intl.NumberFormat(intl, { maximumFractionDigits: 0 }).format(n) + " " + t("common.etb"),
      num: (n) => new Intl.NumberFormat(intl).format(n),
      date: (d, opts) =>
        new Intl.DateTimeFormat(intl, opts ?? { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
          typeof d === "string" ? new Date(d) : d,
        ),
      time: (d) =>
        new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", hour12: false }).format(
          typeof d === "string" ? new Date(d) : d,
        ),
    };
  }, [locale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}
