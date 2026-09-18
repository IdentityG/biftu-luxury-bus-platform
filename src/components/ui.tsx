"use client";

import { motion, useInView, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.075 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "white" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.12em] uppercase",
        tone === "red" ? "text-biftu-red" : "text-white/80",
      )}
    >
      <span className={cn("h-px w-6", tone === "red" ? "bg-biftu-red" : "bg-white/60")} />
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <Eyebrow tone={tone === "dark" ? "red" : "white"}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "font-display mt-4 text-[clamp(28px,4vw,48px)] leading-[1.02] font-extrabold tracking-[-0.03em]",
          tone === "dark" ? "text-biftu-ink" : "text-white",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-[15px] leading-relaxed", tone === "dark" ? "text-biftu-ink-soft" : "text-white/75")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "red" | "blue" | "ghost" | "outline" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
};

export function Button({
  children,
  onClick,
  variant = "red",
  size = "md",
  className,
  disabled,
  type = "button",
  full,
}: BtnProps) {
  const variants: Record<string, string> = {
    red: "bg-biftu-red text-white hover:bg-biftu-red-dark shadow-[0_6px_20px_rgba(215,26,33,0.28)]",
    blue: "bg-biftu-blue text-white hover:bg-biftu-blue-dark shadow-[0_6px_20px_rgba(27,79,156,0.25)]",
    white: "bg-white text-biftu-blue hover:bg-biftu-blue-tint",
    outline: "border border-biftu-border bg-white text-biftu-ink hover:border-biftu-blue hover:text-biftu-blue",
    ghost: "text-biftu-ink-soft hover:text-biftu-blue hover:bg-biftu-blue-tint",
  };
  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-[13px] rounded-[10px]",
    md: "px-5 py-3 text-[14px] rounded-xl",
    lg: "px-7 py-4 text-[15px] rounded-xl",
  };
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold transition-colors duration-200",
        variants[variant],
        sizes[size],
        full && "w-full",
        disabled && "cursor-not-allowed opacity-45 shadow-none",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const unsub = mv.on("change", (v) => setDisplay(v.toFixed(decimals)));
    return unsub;
  }, [mv, decimals]);

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.8, ease: EASE });
      return controls.stop;
    }
  }, [inView, to, mv]);

  return (
    <span ref={ref} className="tnum">
      {display}
      {suffix}
    </span>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-biftu-border border-biftu-border divide-y overflow-hidden rounded-2xl border bg-white">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-biftu-ink text-[15px] font-bold">{item.q}</span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg",
                open === i ? "bg-biftu-red text-white" : "bg-biftu-blue-tint text-biftu-blue",
              )}
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="text-biftu-ink-soft px-6 pb-6 text-[14px] leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1 text-[14px]" aria-label={`${n} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-biftu-red" : "text-biftu-border"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "red" | "green" | "gray" }) {
  const tones: Record<string, string> = {
    blue: "bg-biftu-blue-tint text-biftu-blue",
    red: "bg-biftu-red-tint text-biftu-red",
    green: "bg-emerald-50 text-emerald-700",
    gray: "bg-biftu-paper text-biftu-ink-soft",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", tones[tone])}>
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  error,
  className,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold tracking-[0.08em] uppercase">{label}</span>
      {children}
      {error && <span className="text-biftu-red mt-1 block text-[12px] font-semibold">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-biftu-border bg-white px-4 py-3 text-[14px] font-semibold text-biftu-ink outline-none transition focus:border-biftu-blue";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-biftu-blue grid h-9 w-9 place-items-center rounded-[11px] shadow-[0_4px_14px_rgba(27,79,156,0.35)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 3l8 9-8 9" stroke="#D71A21" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 3l6 9-6 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-[22px] leading-none font-extrabold tracking-[0.03em]",
          light ? "text-white" : "text-biftu-ink",
        )}
      >
        BIFTU
      </span>
    </span>
  );
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    bus: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="3" />
        <path d="M3 10h18M7 21v-2M17 21v-2M7.5 14h.01M16.5 14h.01" />
      </>
    ),
    shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
    pin: (
      <>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    ticket: (
      <>
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
        <path d="M13 6v12" strokeDasharray="2 3" />
      </>
    ),
    phone: <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    seat: <path d="M7 5v7a3 3 0 0 0 3 3h6M7 19h10M17 15v4" />,
    wifi: <path d="M5 12a10 10 0 0 1 14 0M8 15.5a5.5 5.5 0 0 1 8 0M12 19h.01" />,
    ac: <path d="M12 3v18M4 7l16 10M20 7L4 17" />,
    usb: (
      <>
        <path d="M12 21V6" />
        <path d="M9 9l3-3 3 3" />
        <circle cx="12" cy="21" r="1" />
      </>
    ),
    screen: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8" />
      </>
    ),
    snack: <path d="M6 8h12l-1 12H7L6 8zM9 8V5a3 3 0 0 1 6 0v3" />,
    recline: <path d="M6 4v9a3 3 0 0 0 3 3h7M16 16l3 4M6 20h8" />,
    star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="M4 12.5l5 5 11-11" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6L6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
    chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden
    >
      {paths[name] ?? paths.bus}
    </svg>
  );
}
