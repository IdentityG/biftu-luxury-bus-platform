"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { useRouter } from "@/lib/hooks";
import { DEMO_TRACK, OFFICES, cityById, routeFor } from "@/lib/data";
import { useStore } from "@/lib/store";
import { BoardingPass, TicketViewer } from "@/components/Ticket";
import { Badge, Button, Icon, Reveal, SectionTitle } from "@/components/ui";
import { cn } from "@/utils/cn";

const STEPS = ["scheduled", "boarding", "departed", "enroute", "arriving", "completed"] as const;

/* ---- "My passes" — look up your own tickets by phone number or reference ---- */
function TicketLookup() {
  const { t } = useI18n();
  const { bookings } = useStore();
  const [q, setQ] = useState("");
  const [viewer, setViewer] = useState<{ ref: string; seat: string } | null>(null);

  const matches = useMemo(() => {
    const needle = q.replace(/\D/g, "");
    const text = q.trim().toUpperCase();
    if (text.length < 3 && needle.length < 6) return [];
    return bookings.filter(
      (b) =>
        b.ref.toUpperCase().includes(text) ||
        (needle.length >= 6 && b.passengers.some((p) => p.phone.replace(/\D/g, "").endsWith(needle.slice(-9)))),
    );
  }, [q, bookings]);

  const active = viewer ? bookings.find((b) => b.ref === viewer.ref) : null;

  return (
    <section className="py-16 md:py-20">
      <div className="container-biftu">
        <div className="border-biftu-border shadow-card rounded-[26px] border bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow={t("track.myPasses.title")} title={t("track.myPasses.h")} subtitle={t("track.myPasses.sub")} />
            <div className="min-w-[240px] flex-1 md:max-w-xs">
              <label className="block">
                <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold tracking-[0.08em] uppercase">
                  {t("track.myPasses.placeholder")}
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="+251 911 220 118"
                  className="border-biftu-border focus:border-biftu-blue w-full rounded-xl border px-4 py-3 text-[14px] font-bold outline-none"
                />
              </label>
            </div>
          </div>

          {q.trim().length >= 3 && matches.length === 0 && (
            <p className="bg-biftu-paper text-biftu-ink-soft mt-6 rounded-xl p-4 text-[13px] font-semibold">{t("track.myPasses.empty")}</p>
          )}

          {matches.length > 0 && (
            <>
              <p className="text-biftu-blue mt-6 text-[12px] font-bold">
                {t("track.myPasses.found", { count: matches.length })}
              </p>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {matches.flatMap((b) =>
                  b.passengers.map((p) => (
                    <motion.div key={b.ref + p.seat} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                      <BoardingPass booking={b} seat={p.seat} compact onOpen={() => setViewer({ ref: b.ref, seat: p.seat })} />
                    </motion.div>
                  )),
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewer && active && <TicketViewer booking={active} initialSeat={viewer.seat} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </section>
  );
}

export function TrackPage() {
  const { t, tj, time, money } = useI18n();
  const { navigate } = useRouter();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "found" | "notfound">("idle");
  const [progress, setProgress] = useState(DEMO_TRACK.progress);

  useEffect(() => {
    if (state !== "found") return;
    const id = setInterval(() => setProgress((p) => Math.min(0.98, p + 0.002)), 3000);
    return () => clearInterval(id);
  }, [state]);

  const route = routeFor(DEMO_TRACK.routeId);
  const eta = new Date(Date.now() + (1 - progress) * route.durationMinutes * 60000);
  const office = OFFICES.find((o) => o.id === DEMO_TRACK.office)!;
  const currentStep = progress < 0.05 ? 1 : progress < 0.15 ? 2 : progress < 0.85 ? 3 : progress < 0.99 ? 4 : 5;

  const submit = () => {
    const v = value.trim().toUpperCase();
    setState(v === DEMO_TRACK.ref || v.replace(/\s/g, "").endsWith("822619") ? "found" : "notfound");
  };

  return (
    <>
      {/* 1. header + input */}
      <section className="bg-biftu-blue-dark relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="grid-lines absolute inset-0 opacity-40" />
        <div className="stripe-motif absolute -right-16 bottom-0 h-64 w-64 rotate-12 opacity-20" />
        <div className="container-biftu relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionTitle tone="light" eyebrow={t("track.header.eyebrow")} title={t("track.header.title")} subtitle={t("track.header.subtitle")} />
          <Reveal>
            <div className="shadow-glass rounded-[22px] bg-white/96 p-6 backdrop-blur-md">
              <label className="block">
                <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold tracking-[0.08em] uppercase">{t("track.form.ref")}</span>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder={t("track.form.placeholder")}
                  className="border-biftu-border focus:border-biftu-blue w-full rounded-xl border px-4 py-3.5 text-[15px] font-bold tracking-wide uppercase outline-none"
                />
              </label>
              <Button full className="mt-4" onClick={submit}>
                {t("track.form.submit")} <Icon name="arrow" className="h-4 w-4" />
              </Button>
              <button onClick={() => setValue(DEMO_TRACK.ref)} className="text-biftu-blue mt-3 text-[12px] font-bold">
                {t("track.form.demo")}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {state === "found" ? (
        <>
          {/* 2. live map */}
          <section className="py-16 md:py-20">
            <div className="container-biftu grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="border-biftu-border shadow-card overflow-hidden rounded-[26px] border bg-white">
                <div className="from-biftu-blue-dark to-biftu-blue relative h-[360px] bg-gradient-to-br">
                  <div className="grid-lines absolute inset-0 opacity-30" />
                  <div className="absolute inset-x-10 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25">
                    <motion.div className="bg-biftu-red h-full rounded-full" animate={{ width: `${progress * 100}%` }} transition={{ duration: 1 }} />
                    <motion.div
                      className="absolute -top-5 -ml-5 grid h-11 w-11 place-items-center rounded-xl bg-white shadow-lg"
                      animate={{ left: `${progress * 100}%` }}
                      transition={{ duration: 1 }}
                    >
                      <Icon name="bus" className="text-biftu-blue" />
                    </motion.div>
                    <span className="absolute -top-8 left-0 text-[12px] font-bold text-white">{tj(cityById(route.from).name)}</span>
                    <span className="absolute -top-8 right-0 text-[12px] font-bold text-white">{tj(cityById(route.to).name)}</span>
                  </div>
                  <div className="absolute bottom-5 left-5 rounded-xl bg-white/10 px-4 py-3 text-white ring-1 ring-white/20 backdrop-blur-md">
                    <div className="text-[11px] tracking-wider text-white/60 uppercase">{t("track.map.speed")}</div>
                    <div className="tnum text-[22px] font-extrabold">{DEMO_TRACK.speed} km/h</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3">
                  <Stat label={t("track.map.eta")} value={time(eta)} />
                  <Stat label={t("track.map.progress")} value={`${Math.round(progress * 100)}%`} />
                  <Stat label={t("common.price")} value={money(route.basePrice)} />
                </div>
              </div>

              {/* 4. crew card */}
              <div className="border-biftu-border shadow-card rounded-[26px] border bg-white p-6">
                <h3 className="text-[17px] font-extrabold">{t("track.crew.title")}</h3>
                <div className="mt-5 space-y-4">
                  <Row label={t("track.crew.driver")} value={DEMO_TRACK.driver} />
                  <Row label={t("track.crew.plate")} value={DEMO_TRACK.plate} />
                  <Row label={t("track.crew.class")} value="VIP Lounge" />
                  <Row label={t("track.crew.office")} value={`${tj(office.name)} · ${office.phone}`} />
                </div>
                <div className="bg-biftu-blue-tint mt-6 rounded-2xl p-4">
                  <div className="text-biftu-blue text-[12px] font-bold">{t("booking.confirm.reference")}</div>
                  <div className="tnum text-biftu-ink mt-1 text-[20px] font-extrabold">{DEMO_TRACK.ref}</div>
                </div>
                <Button variant="outline" full className="mt-4" onClick={() => navigate("/account")}>
                  {t("dashboard.title")}
                </Button>
              </div>
            </div>
          </section>

          {/* 3. timeline */}
          <section className="bg-biftu-paper py-16 md:py-20">
            <div className="container-biftu">
              <SectionTitle title={t("track.timeline.title")} />
              <div className="mt-10 grid gap-4 md:grid-cols-6">
                {STEPS.map((s, i) => {
                  const done = i <= currentStep;
                  return (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className={cn(
                        "rounded-2xl border p-4",
                        done ? "border-biftu-blue bg-white" : "border-biftu-border bg-white/50",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full text-[13px] font-extrabold",
                          i === currentStep ? "bg-biftu-red text-white" : done ? "bg-biftu-blue text-white" : "bg-biftu-border text-white",
                        )}
                      >
                        {i + 1}
                      </div>
                      <div className={cn("mt-3 text-[13px] font-bold", done ? "text-biftu-ink" : "text-biftu-ink-soft")}>
                        {t(`track.timeline.${s}`)}
                      </div>
                      {i === currentStep && <Badge tone="red">{t("track.map.updated")}</Badge>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="py-16 md:py-24">
          <div className="container-biftu">
            {state === "notfound" && (
              <div className="bg-biftu-red-tint text-biftu-red mb-8 rounded-2xl p-5 text-[14px] font-bold">{t("track.notFound")}</div>
            )}
            <div className="border-biftu-border shadow-card grid gap-8 rounded-[26px] border bg-white p-8 md:p-12 lg:grid-cols-2">
              <div>
                <SectionTitle eyebrow={t("common.callCenter")} title={t("track.help.title")} subtitle={t("track.help.subtitle")} />
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="tel:8477">
                    <Button>
                      <Icon name="phone" className="h-4 w-4" /> 8477
                    </Button>
                  </a>
                  <Button variant="outline" onClick={() => navigate("/about")}>
                    {t("track.help.contact")}
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {OFFICES.map((o) => (
                  <div key={o.id} className="bg-biftu-paper rounded-2xl p-4">
                    <div className="text-[13px] font-extrabold">{tj(o.name)}</div>
                    <div className="text-biftu-ink-soft mt-1 text-[12px]">{tj(o.address)}</div>
                    <div className="text-biftu-blue tnum mt-2 text-[12px] font-bold">{o.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <TicketLookup />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-biftu-paper rounded-2xl p-4">
      <div className="text-biftu-ink-soft text-[11px] font-bold tracking-wider uppercase">{label}</div>
      <div className="tnum text-biftu-ink mt-1 text-[20px] font-extrabold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-biftu-border flex items-center justify-between gap-4 border-b pb-3 text-[13px]">
      <span className="text-biftu-ink-soft font-semibold">{label}</span>
      <span className="text-biftu-ink text-right font-extrabold">{value}</span>
    </div>
  );
}
