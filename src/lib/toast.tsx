"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/utils/cn";

export type ToastTone = "success" | "info" | "error";
type Toast = { id: number; title: string; body?: string; tone: ToastTone };

type Ctx = { push: (t: Omit<Toast, "id">) => void };
const ToastCtx = createContext<Ctx | null>(null);

let n = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = ++n;
    setItems((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = (id: number) => setItems((prev) => prev.filter((x) => x.id !== id));

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[120] flex w-[min(94vw,380px)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="border-biftu-border shadow-card-hover pointer-events-auto flex items-start gap-3 overflow-hidden rounded-2xl border bg-white/95 p-3.5 backdrop-blur-xl"
            >
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                  t.tone === "success" && "bg-emerald-50 text-emerald-600",
                  t.tone === "info" && "bg-biftu-blue-tint text-biftu-blue",
                  t.tone === "error" && "bg-biftu-red-tint text-biftu-red",
                )}
              >
                {t.tone === "success" ? <CheckCircle2 className="h-4.5 w-4.5" /> : t.tone === "error" ? <TriangleAlert className="h-4.5 w-4.5" /> : <Info className="h-4.5 w-4.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-biftu-ink text-[13.5px] leading-snug font-extrabold">{t.title}</div>
                {t.body && <div className="text-biftu-ink-soft mt-0.5 text-[12px] leading-snug">{t.body}</div>}
              </div>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-biftu-ink-soft hover:bg-biftu-paper rounded-lg p-1 transition">
                <X className="h-3.5 w-3.5" />
              </button>
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5",
                  t.tone === "success" && "bg-emerald-500",
                  t.tone === "info" && "bg-biftu-blue",
                  t.tone === "error" && "bg-biftu-red",
                )}
                style={{ animation: "toast-bar 4.2s linear forwards" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  return ctx?.push ?? (() => undefined);
}
