"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n, useRouter } from "@/lib/hooks";
import { useStore, type Role } from "@/lib/store";
import { Icon } from "./ui";
import { cn } from "@/utils/cn";

const ROLES: { id: Role; label: string; tone: string }[] = [
  { id: "customer", label: "Customer", tone: "bg-biftu-blue-tint text-biftu-blue" },
  { id: "agent", label: "Agent", tone: "bg-amber-50 text-amber-700" },
  { id: "admin", label: "Administrator", tone: "bg-biftu-red-tint text-biftu-red" },
];

export function AccountMenu({ solid }: { solid: boolean }) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { profile, setRole, bookings } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isStaff = profile.role === "admin" || profile.role === "agent";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t("nav.account")}
        className={cn(
          "flex items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 transition",
          solid ? "bg-biftu-paper text-biftu-blue hover:bg-biftu-blue-tint" : "bg-white/15 text-white hover:bg-white/25",
        )}
      >
        <span className="bg-biftu-blue grid h-7 w-7 place-items-center rounded-full text-[12px] font-extrabold text-white">
          {profile.fullName.charAt(0)}
        </span>
        <span className="hidden text-[13px] font-bold xl:block">{profile.fullName.split(" ")[0]}</span>
        {profile.role === "admin" && (
          <span className="bg-biftu-red hidden rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white xl:block">ADMIN</span>
        )}
        {profile.role === "agent" && (
          <span className="hidden rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-amber-950 xl:block">AGENT</span>
        )}
        <span className={cn("text-[10px] transition-transform", open && "rotate-180")}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="border-biftu-border absolute right-0 z-[70] mt-2 w-[290px] overflow-hidden rounded-2xl border bg-white shadow-[0_18px_50px_rgba(14,47,99,0.18)]"
          >
            <div className="border-biftu-border border-b p-4">
              <div className="text-[14px] font-extrabold text-biftu-ink">{profile.fullName}</div>
              <div className="text-biftu-ink-soft tnum text-[12px]">{profile.phone}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-extrabold", ROLES.find((r) => r.id === profile.role)?.tone)}>
                  {profile.role.toUpperCase()}
                </span>
                <span className="text-biftu-ink-soft text-[11px] font-semibold">{bookings.length} bookings</span>
              </div>
            </div>

            <div className="p-2">
              <MenuItem icon="user" label={t("nav.account")} hint={t("dashboard.title")} onClick={() => { setOpen(false); navigate("/account"); }} />
              <MenuItem
                icon="ticket"
                label={t("dashboard.nav.tickets")}
                hint={`${bookings.length}`}
                onClick={() => { setOpen(false); navigate("/account", { tab: "tickets" }); }}
              />
              <MenuItem
                icon="chart"
                label={t("admin.title")}
                hint={isStaff ? "Console" : "Restricted"}
                disabled={!isStaff}
                onClick={() => { setOpen(false); navigate("/admin"); }}
              />
            </div>

            <div className="border-biftu-border bg-biftu-paper border-t p-3">
              <div className="text-biftu-ink-soft mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                <Icon name="shield" className="h-3.5 w-3.5" /> {t("nav.language")} / role demo
              </div>
              <div className="flex gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      if (r.id === "admin" || r.id === "agent") {
                        setTimeout(() => {
                          setOpen(false);
                          navigate("/admin");
                        }, 200);
                      }
                    }}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-2 text-[11px] font-bold transition",
                      profile.role === r.id ? "bg-biftu-blue text-white" : "bg-white text-biftu-ink-soft hover:text-biftu-blue",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
        disabled ? "opacity-45" : "hover:bg-biftu-blue-tint",
      )}
    >
      <span className="bg-biftu-paper text-biftu-blue grid h-8 w-8 place-items-center rounded-lg">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-biftu-ink block truncate text-[13px] font-bold">{label}</span>
        {hint && <span className="text-biftu-ink-soft block truncate text-[11px]">{hint}</span>}
      </span>
      {disabled && <span className="text-biftu-ink-soft text-[10px] font-bold">🔒</span>}
    </button>
  );
}
