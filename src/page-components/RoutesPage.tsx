"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { useRouter } from "@/lib/hooks";
import { SearchCard } from "@/components/SearchCard";
import { Accordion, Badge, Button, Eyebrow, Icon, Reveal, SectionTitle, Stagger, StaggerItem } from "@/components/ui";
import { CITIES, FLEET, OFFICES, ROUTES, cityById, getTrips, todayISO } from "@/lib/data";
import { cn } from "@/utils/cn";

export function RoutesPage() {
  return (
    <>
      <Header />
      <Explorer />
      <FareTable />
      <AgentBand />
      <Faq />
    </>
  );
}

function Header() {
  const { t } = useI18n();
  return (
    <section className="bg-biftu-blue-tint grid-lines pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="container-biftu">
        <Reveal>
          <SectionTitle eyebrow={t("routes.header.eyebrow")} title={t("routes.header.title")} subtitle={t("routes.header.subtitle")} />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <SearchCard variant="inline" />
        </Reveal>
      </div>
    </section>
  );
}

/* --- Interactive explorer: map + list --- */
function Explorer() {
  const { t, tj, money } = useI18n();
  const { navigate } = useRouter();
  const [view, setView] = useState<"map" | "list">("map");
  const [city, setCity] = useState<string>("all");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (city === "all" ? ROUTES : ROUTES.filter((r) => r.from === city || r.to === city)),
    [city],
  );

  // project lat/lng to % coords
  const lats = CITIES.map((c) => c.lat);
  const lngs = CITIES.map((c) => c.lng);
  const minLat = Math.min(...lats) - 0.6,
    maxLat = Math.max(...lats) + 0.6,
    minLng = Math.min(...lngs) - 0.6,
    maxLng = Math.max(...lngs) + 0.6;
  const px = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
  const py = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * 100;

  return (
    <section className="py-16 md:py-24">
      <div className="container-biftu">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle title={t("routes.explorer.title")} />
          <div className="bg-biftu-paper flex gap-1 rounded-full p-1">
            {(["map", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[13px] font-bold",
                  view === v ? "text-white" : "text-biftu-ink-soft",
                )}
              >
                {view === v && <motion.span layoutId="view-pill" className="bg-biftu-blue absolute inset-0 rounded-full" />}
                <span className="relative z-10">{t(`routes.explorer.${v}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Chip active={city === "all"} onClick={() => setCity("all")}>
            {t("routes.explorer.all")}
          </Chip>
          {CITIES.map((c) => (
            <Chip key={c.id} active={city === c.id} onClick={() => setCity(c.id)}>
              {tj(c.name)}
            </Chip>
          ))}
        </div>

        {view === "map" ? (
          <div className="border-biftu-border shadow-card mt-8 grid gap-6 rounded-2xl border bg-white p-4 lg:grid-cols-[1.35fr_1fr] lg:p-6">
            <div className="from-biftu-blue-dark to-biftu-blue relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br">
              <div className="grid-lines absolute inset-0 opacity-30" />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                {filtered.map((r) => {
                  const a = cityById(r.from),
                    b = cityById(r.to);
                  return (
                    <motion.line
                      key={r.id}
                      x1={px(a.lng)}
                      y1={py(a.lat)}
                      x2={px(b.lng)}
                      y2={py(b.lat)}
                      stroke={active === r.id ? "#D71A21" : "rgba(255,255,255,0.45)"}
                      strokeWidth={active === r.id ? 0.7 : 0.35}
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    />
                  );
                })}
              </svg>
              {CITIES.map((c) => (
                <div key={c.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${px(c.lng)}%`, top: `${py(c.lat)}%` }}>
                  <button onClick={() => setCity(c.id)} className="group flex flex-col items-center">
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full ring-4 transition",
                        city === c.id ? "bg-biftu-red ring-biftu-red/30" : "bg-white ring-white/20 group-hover:ring-white/40",
                      )}
                    />
                    <span className="mt-1 rounded-md bg-black/35 px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white backdrop-blur-sm">
                      {tj(c.name)}
                    </span>
                  </button>
                </div>
              ))}
            </div>
            <div className="scroll-thin max-h-[480px] space-y-3 overflow-y-auto pr-1">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onMouseEnter={() => setActive(r.id)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => navigate("/book/results", { from: r.from, to: r.to, date: todayISO(1), pax: 1, route: r.id })}
                  className="border-biftu-border hover:border-biftu-blue w-full rounded-xl border p-4 text-left transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-extrabold">
                      {tj(cityById(r.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(r.to).name)}
                    </span>
                    <span className="tnum text-biftu-red text-[14px] font-extrabold">{money(r.basePrice)}</span>
                  </div>
                  <div className="text-biftu-ink-soft tnum mt-1 text-[12px] font-semibold">
                    {r.distanceKm} km · {Math.floor(r.durationMinutes / 60)}
                    {t("common.hoursShort")} {r.durationMinutes % 60}
                    {t("common.minutesShort")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Stagger className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <StaggerItem key={r.id}>
                <div className="border-biftu-border shadow-card flex h-full flex-col rounded-2xl border bg-white p-5">
                  <div className="text-[17px] font-extrabold">
                    {tj(cityById(r.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(r.to).name)}
                  </div>
                  <div className="text-biftu-ink-soft tnum mt-2 text-[13px] font-semibold">
                    {r.distanceKm} km · {Math.floor(r.durationMinutes / 60)}
                    {t("common.hoursShort")}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="text-biftu-red tnum text-[18px] font-extrabold">{money(r.basePrice)}</span>
                    <Button size="sm" onClick={() => navigate("/book/results", { from: r.from, to: r.to, date: todayISO(1), pax: 1, route: r.id })}>
                      {t("home.popular.book")}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition",
        active ? "bg-biftu-blue border-biftu-blue text-white" : "border-biftu-border text-biftu-ink-soft hover:border-biftu-blue hover:text-biftu-blue",
      )}
    >
      {children}
    </button>
  );
}

/* --- Fares & schedule accordion --- */
function FareTable() {
  const { t, tj, money, time } = useI18n();
  const [open, setOpen] = useState<string | null>(ROUTES[0].id);
  return (
    <section className="bg-biftu-paper py-16 md:py-24">
      <div className="container-biftu">
        <SectionTitle eyebrow={t("routes.table.title")} title={t("routes.table.title")} subtitle={t("routes.table.subtitle")} />
        <div className="mt-10 space-y-3">
          {ROUTES.slice(0, 9).map((r) => {
            const isOpen = open === r.id;
            const trips = getTrips(r.id, todayISO(1));
            return (
              <div key={r.id} className="border-biftu-border overflow-hidden rounded-2xl border bg-white">
                <button onClick={() => setOpen(isOpen ? null : r.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                  <span className="text-[15px] font-extrabold">
                    {tj(cityById(r.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(r.to).name)}
                  </span>
                  <span className="flex items-center gap-3">
                    <Badge tone="gray">{trips.length} {t("routes.table.departures")}</Badge>
                    <span className={cn("text-biftu-blue transition-transform", isOpen && "rotate-180")}>▾</span>
                  </span>
                </button>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden">
                    <div className="scroll-thin overflow-x-auto px-5 pb-5">
                      <table className="w-full min-w-[520px] text-left text-[13px]">
                        <thead>
                          <tr className="text-biftu-ink-soft border-biftu-border border-b text-[11px] tracking-wider uppercase">
                            <th className="py-3 font-bold">{t("routes.table.departures")}</th>
                            <th className="py-3 font-bold">{t("routes.table.class")}</th>
                            <th className="py-3 font-bold">{t("common.duration")}</th>
                            <th className="py-3 text-right font-bold">{t("routes.table.fare")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-biftu-border divide-y">
                          {trips.map((tr) => (
                            <tr key={tr.id}>
                              <td className="tnum py-3 font-bold">{time(tr.departure)}</td>
                              <td className="py-3">{tj(FLEET.find((f) => f.id === tr.busClass)!.name)}</td>
                              <td className="tnum py-3">
                                {Math.floor(r.durationMinutes / 60)}
                                {t("common.hoursShort")} {r.durationMinutes % 60}
                                {t("common.minutesShort")}
                              </td>
                              <td className="tnum text-biftu-red py-3 text-right font-extrabold">{money(tr.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AgentBand() {
  const { t, tj } = useI18n();
  const { navigate } = useRouter();
  return (
    <section className="py-16 md:py-24">
      <div className="container-biftu">
        <div className="bg-biftu-blue-dark relative grid overflow-hidden rounded-[26px] p-8 md:p-12 lg:grid-cols-2 lg:gap-12">
          <div className="stripe-motif pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rotate-12 opacity-20" />
          <div className="relative z-10">
            <Eyebrow tone="white">{t("common.callCenter")}</Eyebrow>
            <h3 className="font-display mt-4 text-[clamp(26px,3.4vw,40px)] leading-tight font-extrabold text-white">{t("routes.agents.title")}</h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">{t("routes.agents.subtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="tel:8477">
                <Button variant="white">
                  <Icon name="phone" className="h-4 w-4" /> 8477
                </Button>
              </a>
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("/about")}>
                {t("routes.agents.offices")}
              </Button>
            </div>
          </div>
          <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2 lg:mt-0">
            {OFFICES.map((o) => (
              <div key={o.id} className="rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                <div className="text-[13px] font-extrabold text-white">{tj(o.name)}</div>
                <div className="mt-1 text-[12px] text-white/65">{tj(o.address)}</div>
                <div className="tnum mt-2 text-[12px] font-bold text-white/85">{o.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useI18n();
  return (
    <section className="bg-biftu-paper py-16 md:py-24">
      <div className="container-biftu grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionTitle eyebrow="FAQ" title={t("routes.faq.title")} />
        <Accordion
          items={[1, 2, 3, 4].map((i) => ({ q: t(`routes.faq.q${i}`), a: t(`routes.faq.a${i}`) }))}
        />
      </div>
    </section>
  );
}
