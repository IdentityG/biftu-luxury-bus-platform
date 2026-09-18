"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { passengerQR, parsePassengerPayload, sign, maskPhone, type QRPayload } from "@/lib/qr";
import { FLEET, cityById, routeFor } from "@/lib/data";
import type { Booking } from "@/lib/store";
import { Badge, Button, Icon } from "./ui";
import { cn } from "@/utils/cn";

export type { Booking };

/** Unique QR per passenger, keyed by seat. */
export function usePassengerQrs(booking: Booking | undefined, size = 220) {
  const [qrs, setQrs] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!booking) return;
    let alive = true;
    const r = routeFor(booking.routeId);
    const routeCode = r ? `${r.from}-${r.to}` : "-";
    const date = new Date(booking.departure).toISOString().slice(0, 10);
    Promise.all(
      booking.passengers.map(async (p) => {
        const payload: QRPayload = {
          ref: booking.ref,
          seat: p.seat,
          name: p.fullName,
          phone: p.phone,
          id: p.idNumber,
          route: routeCode,
          date,
        };
        return [p.seat, await passengerQR(payload, size)] as const;
      }),
    ).then((pairs) => {
      if (alive) setQrs(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
  }, [booking, size]);
  return qrs;
}

/* ---------------- Boarding pass ---------------- */
export function BoardingPass({
  booking,
  seat,
  compact = false,
  onOpen,
}: {
  booking: Booking;
  seat: string;
  compact?: boolean;
  onOpen?: () => void;
}) {
  const { t, tj, time, date: fdate } = useI18n();
  const qrs = usePassengerQrs(booking, compact ? 150 : 220);
  const p = booking.passengers.find((x) => x.seat === seat) ?? booking.passengers[0];
  const route = routeFor(booking.routeId);
  const cls = FLEET.find((f) => f.id === booking.busClass);
  if (!p || !route) return null;
  const qr = qrs[p.seat];

  return (
    <div
      className={cn(
        "border-biftu-border shadow-card group relative overflow-hidden rounded-[22px] border bg-white transition",
        onOpen && "hover:shadow-card-hover",
      )}
      onClick={onOpen}
    >
      <span className="border-biftu-border absolute inset-x-6 top-[92px] hidden border-t border-dashed md:block" />
      <span className="absolute top-[80px] -left-2.5 hidden h-6 w-6 rounded-full border-[3px] border-biftu-border bg-biftu-paper md:block" />
      <span className="absolute top-[80px] -right-2.5 hidden h-6 w-6 rounded-full border-[3px] border-biftu-border bg-biftu-paper md:block" />

      <div className="bg-biftu-blue-dark relative flex items-center justify-between gap-3 px-5 py-4 text-white">
        <div className="stripe-motif pointer-events-none absolute inset-y-0 right-0 w-1/4 opacity-20" />
        <div className="relative z-10 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.16em] text-white/55 uppercase">Biftu · Boarding pass</div>
          <div className="font-display tnum truncate text-[19px] leading-tight font-extrabold">{booking.ref}</div>
        </div>
        <Badge tone="red">{cls ? tj(cls.name) : booking.busClass}</Badge>
      </div>

      <div className="grid gap-4 px-5 pt-5 pb-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Cell label={t("common.from")} value={tj(cityById(route.from).name)} strong />
          <Cell label={t("common.to")} value={tj(cityById(route.to).name)} strong />
          <Cell label={t("booking.search.date")} value={fdate(booking.departure)} />
          <Cell label={t("admin.table.departure")} value={time(booking.departure)} mono />
          <Cell label={t("common.seat")} value={p.seat} mono accent />
          <Cell label={t("booking.passengers.idNumber")} value={p.idNumber || "—"} />
        </div>
        <div className="flex flex-col items-center gap-2 md:pl-5">
          {qr ? (
            <img
              src={qr}
              alt={`Boarding QR seat ${p.seat}`}
              className="border-biftu-border rounded-xl border bg-white p-1.5 transition group-hover:scale-[1.03]"
              style={{ width: compact ? 108 : 140, height: compact ? 108 : 140 }}
            />
          ) : (
            <div
              className="border-biftu-border grid place-items-center rounded-xl border bg-white text-[11px] text-biftu-ink-soft"
              style={{ width: compact ? 108 : 140, height: compact ? 108 : 140 }}
            >
              …
            </div>
          )}
          <div className="text-biftu-ink-soft tnum text-[10px] font-bold">{maskPhone(p.phone)}</div>
        </div>
      </div>

      <div className="bg-biftu-paper flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[11px] font-bold">
        <span className="text-biftu-ink-soft">
          {p.fullName} · {p.gender === "female" ? t("booking.passengers.female") : t("booking.passengers.male")}
        </span>
        <span className={cn("flex items-center gap-1.5", booking.status === "confirmed" ? "text-emerald-600" : "text-biftu-ink-soft")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", booking.status === "confirmed" ? "bg-emerald-500" : "bg-biftu-border")} />
          {booking.checkedIn ? "Checked in" : booking.status}
        </span>
      </div>
    </div>
  );
}

function Cell({ label, value, strong, mono, accent }: { label: string; value: string; strong?: boolean; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <div className="text-biftu-ink-soft text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div
        className={cn(
          "mt-0.5 truncate text-[15px]",
          mono && "tnum",
          accent ? "text-biftu-red font-extrabold" : strong ? "text-biftu-ink font-extrabold" : "text-biftu-ink font-bold",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- Full-screen ticket viewer ---------------- */
export function TicketViewer({ booking, initialSeat, onClose }: { booking: Booking; initialSeat?: string; onClose: () => void }) {
  const { t, money } = useI18n();
  const [seat, setSeat] = useState(initialSeat ?? booking.passengers[0]?.seat ?? "");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("noscroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("noscroll");
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-biftu-ink/80 fixed inset-0 z-[90] grid place-items-center overflow-y-auto p-4 backdrop-blur-sm print:static print:bg-white print:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex gap-1.5">
            {booking.passengers.map((p) => (
              <button
                key={p.seat}
                onClick={() => setSeat(p.seat)}
                className={cn(
                  "tnum rounded-full px-3.5 py-1.5 text-[12px] font-bold transition",
                  seat === p.seat ? "bg-white text-biftu-blue" : "bg-white/15 text-white hover:bg-white/25",
                )}
              >
                {t("common.seat")} {p.seat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="white" onClick={() => window.print()}>
              <Icon name="download" className="h-4 w-4" /> PDF
            </Button>
            <button onClick={onClose} aria-label={t("common.close")} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <BoardingPass booking={booking} seat={seat} />

        <div className="border-biftu-border mt-3 flex items-center justify-between rounded-2xl border bg-white/10 px-4 py-3 text-[12px] font-semibold text-white print:hidden">
          <span>{t("booking.confirm.scan")}</span>
          <span className="tnum">{money(booking.total)}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Compact QR slot (dark panels, gates, tickets) ---------------- */
export function PassengerQRSlot({ booking, seat, size = 190 }: { booking: Booking; seat: string; size?: number }) {
  const qrs = usePassengerQrs(booking, size);
  if (!qrs[seat]) return <div className="mx-auto animate-pulse rounded-xl bg-white/20" style={{ width: size, height: size }} />;
  return <img src={qrs[seat]} alt={`QR seat ${seat}`} className="mx-auto rounded-xl bg-white p-2" style={{ width: size, height: size }} />;
}

/* ---------------- Live camera scanner (BarcodeDetector w/ graceful fallback) ---------------- */
export function CameraScanner({ onResult, onClose }: { onResult: (v: string) => void; onClose: () => void }) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"starting" | "live" | "unsupported" | "denied">("starting");
  const cbRef = useRef(onResult);
  cbRef.current = onResult;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const hasDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

    (async () => {
      if (!hasDetector) {
        setStatus("unsupported");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
        if (stopped) return;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play();
          setStatus("live");
        }
        const w = window as unknown as {
          BarcodeDetector: new (o?: { formats?: string[] }) => { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> };
        };
        const detector = new w.BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (stopped || !videoRef.current || videoRef.current.readyState < 2) {
            raf = requestAnimationFrame(tick);
            return;
          }
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              cbRef.current(codes[0].rawValue);
              return;
            }
          } catch {
            /* transient frame error */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setStatus("denied");
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-biftu-ink/85 fixed inset-0 z-[95] grid place-items-center p-4 backdrop-blur"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-[26px] bg-black"
      >
        <div className="relative aspect-square w-full">
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="relative h-52 w-52 rounded-2xl border-2" style={{ borderColor: "var(--color-biftu-red)" }}>
              <motion.span
                animate={{ y: [-100, 100, -100] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-3 top-1/2 h-0.5 rounded-full"
                style={{ background: "var(--color-biftu-red)" }}
              />
            </span>
          </div>
          {status !== "live" && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 px-8 text-center text-[13px] font-semibold text-white">
              {status === "starting" ? "Starting camera…" : status === "unsupported" ? "No QR camera API here — paste the code below instead." : "Camera blocked — paste the code below instead."}
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full bg-white/10 py-4 text-[13px] font-bold text-white hover:bg-white/20">
          {t("common.close")}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Decode + match against bookings (shared by admin + track) ---------------- */
export function useTicketLookup(raw: string, bookings: Booking[]) {
  return useMemo(() => {
    const parsed = parsePassengerPayload(raw);
    if ("bare" in parsed) {
      const b = bookings.find((x) => x.ref.toUpperCase() === parsed.bare.toUpperCase());
      if (!b) return { kind: "notfound" as const, ref: parsed.bare };
      return { kind: "ok" as const, booking: b, passenger: b.passengers[0], sig: sign({ ref: b.ref, seat: b.passengers[0]?.seat ?? "", phone: b.passengers[0]?.phone ?? "", id: b.passengers[0]?.idNumber ?? "", date: b.departure.slice(0, 10) }), legacy: true };
    }
    if (!parsed.ok) return { kind: parsed.reason as "malformed" | "signature" };
    const b = bookings.find((x) => x.ref.toUpperCase() === parsed.data.ref.toUpperCase());
    if (!b) return { kind: "notfound" as const, ref: parsed.data.ref };
    const passenger = b.passengers.find((x) => x.seat === parsed.data.seat);
    if (!passenger) return { kind: "notfound" as const, ref: parsed.data.ref };
    return { kind: "ok" as const, booking: b, passenger, sig: parsed.data, legacy: parsed.legacy };
  }, [raw, bookings]);
}
