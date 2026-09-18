"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n, useRouter } from "@/lib/hooks";
import { CITIES, findRoute, todayISO } from "@/lib/data";
import { Icon, inputCls } from "./ui";
import { cn } from "@/utils/cn";

export function SearchCard({
  variant = "floating",
  defaults,
}: {
  variant?: "floating" | "inline";
  defaults?: { from?: string; to?: string; date?: string; pax?: number };
}) {
  const { t, tj } = useI18n();
  const { navigate } = useRouter();
  const [from, setFrom] = useState(defaults?.from ?? "addis");
  const [to, setTo] = useState(defaults?.to ?? "hawassa");
  const [date, setDate] = useState(defaults?.date ?? todayISO(1));
  const [pax, setPax] = useState(defaults?.pax ?? 1);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (from === to) return setError(t("errors.sameCity"));
    setError(null);
    const route = findRoute(from, to);
    navigate("/book/results", { from, to, date, pax, route: route?.id });
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div
      className={cn(
        "w-full rounded-[20px] p-5 md:p-6",
        variant === "floating"
          ? "bg-white/96 shadow-glass border border-white/60 backdrop-blur-md"
          : "border-biftu-border shadow-card border bg-white",
      )}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
        <CitySelect label={t("booking.search.from")} value={from} onChange={setFrom} placeholder={t("booking.search.selectCity")} tj={tj} />
        <div className="relative">
          <CitySelect label={t("booking.search.to")} value={to} onChange={setTo} placeholder={t("booking.search.selectCity")} tj={tj} />
          <button
            onClick={swap}
            aria-label={t("booking.search.swap")}
            className="border-biftu-border text-biftu-blue absolute -top-3 -left-4 hidden h-8 w-8 place-items-center rounded-full border bg-white shadow-sm lg:grid"
          >
            ⇄
          </button>
        </div>
        <label className="block">
          <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold tracking-[0.08em] uppercase">
            {t("booking.search.date")}
          </span>
          <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} className={cn(inputCls, "tnum")} />
        </label>
        <div>
          <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold tracking-[0.08em] uppercase">
            {t("booking.search.passengers")}
          </span>
          <div className="border-biftu-border flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2">
            <button onClick={() => setPax(Math.max(1, pax - 1))} className="text-biftu-blue bg-biftu-blue-tint h-8 w-8 rounded-lg font-bold" aria-label="-">
              −
            </button>
            <span className="tnum text-[15px] font-bold">{pax}</span>
            <button onClick={() => setPax(Math.min(6, pax + 1))} className="text-biftu-blue bg-biftu-blue-tint h-8 w-8 rounded-lg font-bold" aria-label="+">
              +
            </button>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={submit}
          className="bg-biftu-red hover:bg-biftu-red-dark inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-bold text-white transition-colors"
        >
          {t("booking.search.submit")}
          <Icon name="arrow" className="h-4 w-4" />
        </motion.button>
      </div>
      {error && <p className="text-biftu-red mt-3 text-[13px] font-semibold">{error}</p>}
    </div>
  );
}

function CitySelect({
  label,
  value,
  onChange,
  placeholder,
  tj,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  tj: (o?: Record<string, string> | null) => string;
}) {
  return (
    <label className="block">
      <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold tracking-[0.08em] uppercase">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} aria-label={label}>
        <option value="">{placeholder}</option>
        {CITIES.map((c) => (
          <option key={c.id} value={c.id}>
            {tj(c.name)}
          </option>
        ))}
      </select>
    </label>
  );
}
