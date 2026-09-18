"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { FLEET, bookedSeats, type Trip } from "@/lib/data";
import { cn } from "@/utils/cn";

export function buildLayout(trip: Trip) {
  const f = FLEET.find((x) => x.id === trip.busClass)!;
  const rows: { left: string[]; right: string[] }[] = [];
  let n = 1;
  for (let r = 0; r < f.rows; r++) {
    const left: string[] = [];
    const right: string[] = [];
    left.push(String(n++));
    left.push(String(n++));
    if (f.config === "2-1") {
      right.push(String(n++));
    } else {
      right.push(String(n++));
      if (n <= trip.seatsTotal) right.push(String(n++));
    }
    rows.push({ left, right });
  }
  return rows;
}

export function SeatMap({
  trip,
  selected,
  onToggle,
  max,
}: {
  trip: Trip;
  selected: string[];
  onToggle: (seat: string) => void;
  max: number;
}) {
  const { t, money } = useI18n();
  const rows = buildLayout(trip);
  const booked = bookedSeats(trip.id, trip.seatsTotal);

  const seatState = (s: string) => (booked.has(s) ? "booked" : selected.includes(s) ? "selected" : "available");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        {(["available", "selected", "booked"] as const).map((k) => (
          <span key={k} className="flex items-center gap-2 text-[12px] font-semibold">
            <span
              className={cn(
                "h-4 w-4 rounded-[5px] border",
                k === "available" && "bg-biftu-blue-tint border-biftu-blue",
                k === "selected" && "bg-biftu-red border-biftu-red-dark",
                k === "booked" && "border-[#D9DBDF] bg-[#EDEEF0]",
              )}
            />
            {t(`booking.seats.legend.${k}`)}
          </span>
        ))}
      </div>

      <div className="border-biftu-border mx-auto w-full max-w-[380px] rounded-[26px] border bg-white p-5">
        <div className="text-biftu-ink-soft mb-4 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
          <span className="flex items-center gap-1.5">🚍 {t("booking.seats.driver")}</span>
          <span className="bg-biftu-paper rounded-full px-2 py-1">{trip.plate}</span>
        </div>
        <div className="space-y-2.5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex gap-2.5">
                {row.left.map((s) => (
                  <Seat key={s} n={s} state={seatState(s)} price={money(trip.price)} onClick={() => onToggle(s)} disabled={seatState(s) === "booked" || (seatState(s) === "available" && selected.length >= max)} />
                ))}
              </div>
              <span className="tnum text-biftu-ink-soft w-4 text-center text-[10px]">{i + 1}</span>
              <div className="flex gap-2.5">
                {row.right.map((s) => (
                  <Seat key={s} n={s} state={seatState(s)} price={money(trip.price)} onClick={() => onToggle(s)} disabled={seatState(s) === "booked" || (seatState(s) === "available" && selected.length >= max)} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-biftu-ink-soft mt-4 text-center text-[11px] font-bold tracking-wider uppercase">{t("booking.seats.rear")}</div>
      </div>

      {/* accessible fallback */}
      <details className="border-biftu-border mt-6 rounded-2xl border bg-white p-4">
        <summary className="cursor-pointer text-[13px] font-bold">{t("booking.seats.a11yList")}</summary>
        <p className="text-biftu-ink-soft mt-2 text-[12px]">{t("booking.seats.a11yHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {rows
            .flatMap((r) => [...r.left, ...r.right])
            .filter((s) => !booked.has(s))
            .map((s) => (
              <button
                key={s}
                onClick={() => onToggle(s)}
                aria-pressed={selected.includes(s)}
                className={cn(
                  "tnum rounded-lg border px-2.5 py-1 text-[12px] font-bold",
                  selected.includes(s) ? "bg-biftu-red border-biftu-red text-white" : "border-biftu-border text-biftu-ink",
                )}
              >
                {s}
              </button>
            ))}
        </div>
      </details>
    </div>
  );
}

function Seat({
  n,
  state,
  onClick,
  disabled,
  price,
}: {
  n: string;
  state: "available" | "selected" | "booked";
  onClick: () => void;
  disabled?: boolean;
  price: string;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      disabled={state === "booked" || (disabled && state !== "selected")}
      title={state === "booked" ? "—" : price}
      animate={{ scale: state === "selected" ? 1.06 : 1 }}
      whileHover={state === "available" ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "tnum grid h-11 w-11 place-items-center rounded-[10px] border-[1.5px] text-[13px] font-semibold transition-colors",
        state === "available" && "bg-biftu-blue-tint border-biftu-blue text-biftu-blue hover:shadow-card",
        state === "selected" && "bg-biftu-red border-biftu-red-dark text-white",
        state === "booked" && "cursor-not-allowed border-[#D9DBDF] bg-[#EDEEF0] text-[#9CA3AF]",
        disabled && state === "available" && "opacity-45",
      )}
    >
      {state === "booked" ? "×" : n}
    </motion.button>
  );
}
