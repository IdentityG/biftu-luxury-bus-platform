"use client";

import { motion } from "framer-motion";
import { LOCALES } from "@/i18n/messages";
import { useRouter } from "@/lib/hooks";
import { cn } from "@/utils/cn";

export function LanguageSwitcher({ hero = false, block = false }: { hero?: boolean; block?: boolean }) {
  const { locale, setLocale } = useRouter();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "flex items-center gap-1 rounded-full p-[2px]",
        hero ? "bg-white/15 backdrop-blur-sm" : "bg-biftu-blue-tint",
        block && "w-full",
      )}
    >
      {LOCALES.map((l) => {
        const active = l.code === locale;
        return (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            aria-current={active ? "true" : undefined}
            aria-label={l.label}
            className={cn(
              "relative rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
              block && "flex-1",
              active ? (hero ? "text-biftu-blue" : "text-biftu-blue") : hero ? "text-white/75 hover:text-white" : "text-biftu-ink-soft hover:text-biftu-blue",
            )}
          >
            {active && (
              <motion.span
                layoutId={block ? "lang-pill-mobile" : "lang-pill"}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
              />
            )}
            <span className="relative z-10">{l.short}</span>
          </button>
        );
      })}
    </div>
  );
}
