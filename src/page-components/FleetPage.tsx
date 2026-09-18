"use client";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n, useRouter } from "@/lib/hooks";
import { AMENITY_LABEL, FLEET } from "@/lib/data";
import { Button, Icon, Reveal, SectionTitle, Stagger, StaggerItem } from "@/components/ui";

export function FleetPage() {
  return (
    <>
      <Header />
      <ClassesScroller />
      <Amenities />
      <Safety />
      <Gallery />
    </>
  );
}

function Header() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
      <img src="/images/exterior.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-biftu-blue-dark/92 via-biftu-blue-dark/70 to-biftu-blue-dark/20" />
      <div className="container-biftu relative z-10">
        <Reveal>
          <SectionTitle tone="light" eyebrow={t("fleet.header.eyebrow")} title={t("fleet.header.title")} subtitle={t("fleet.header.subtitle")} />
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   Scroll to compare classes
   - Desktop (lg+): pinned stage — scrolling scrubs VIP → Business → Standard
     with a spring progress rail, cross-fading copy, an animated comparison
     chart and a live mini seat-map.
   - Mobile / tablet / reduced-motion: swipeable snap carousel with dots.
   - Never leaves a blank frame: the stage is always painted.
   ====================================================================== */

type L3 = { en: string; am: string; om: string };
const CLASS_META: Record<string, { accent: string; tagline: L3; seats: number; recline: number; power: number; comfort: number }> = {
  vip: { accent: "#D71A21", tagline: { en: "The quiet cabin", am: "ጸጥ ያለው ክፍል", om: "Kutaa callisaa" }, seats: 27, recline: 140, power: 100, comfort: 100 },
  business: { accent: "#3B7DD8", tagline: { en: "Room to work", am: "ለመስራት የሚበቃ ቦታ", om: "Bakka hojii" }, seats: 39, recline: 125, power: 100, comfort: 78 },
  standard: { accent: "#8FB2E0", tagline: { en: "Best value, every day", am: "በየቀኑ ምርጥ ዋጋ", om: "Gatii gaarii, guyyaa hunda" }, seats: 47, recline: 112, power: 60, comfort: 58 },
};

function ClassesScroller() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section className="bg-biftu-blue-dark relative overflow-x-clip">
      <div className="stripe-motif pointer-events-none absolute -top-24 right-0 h-64 w-[38%] rotate-6 opacity-[0.13]" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="container-biftu relative z-10 pt-16 md:pt-24">
        <SectionTitle tone="light" eyebrow={t("fleet.classes.scrollHint")} title={t("fleet.classes.title")} />
      </div>
      {isDesktop && !reduce ? <PinnedCompare /> : <MobileCompare />}
    </section>
  );
}

/* ---------------- Desktop: pinned, scroll-scrubbed ---------------- */
function PinnedCompare() {
  const { t, tj, money, locale } = useI18n();
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 });
  const [active, setActive] = useState(0);
  const n = FLEET.length;

  const indexFor = (v: number) => Math.min(n - 1, Math.max(0, Math.floor(v * n + 0.0001)));

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = indexFor(v);
    setActive((cur) => (cur === idx ? cur : idx));
  });

  // sync on mount in case the visitor lands mid-section (deep link / restored scroll)
  useEffect(() => {
    setActive(indexFor(scrollYProgress.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const railWidth = useTransform(progress, [0, 1], ["0%", "100%"]);
  const f = FLEET[active];
  const meta = CLASS_META[f.id];

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / n);
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={ref} className="relative" style={{ height: `${n * 100 + 40}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center">
        <div className="container-biftu">
          {/* progress rail + tabs */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width: railWidth, background: meta.accent }} />
            </div>
            <div className="flex gap-1.5">
              {FLEET.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => goTo(i)}
                  aria-current={i === active}
                  className={`relative rounded-full px-4 py-1.5 text-[12px] font-bold transition ${i === active ? "text-biftu-blue-dark" : "text-white/70 hover:text-white"}`}
                >
                  {i === active && <motion.span layoutId="cls-tab" transition={{ type: "spring", stiffness: 400, damping: 32 }} className="absolute inset-0 rounded-full bg-white" />}
                  <span className="relative z-10">{tj(c.name)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            {/* copy side */}
            <div className="min-h-[380px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.14em] text-white uppercase" style={{ background: meta.accent }}>
                    {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {f.config}
                  </span>
                  <h3 className="font-display mt-5 text-[clamp(40px,6vw,88px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-white">{tj(f.name)}</h3>
                  <p className="mt-3 text-[18px] font-bold text-white/85">{meta.tagline[locale as keyof L3]}</p>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">{tj(f.description)}</p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {f.amenities.map((a, i) => (
                      <motion.span
                        key={a}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.12 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[12px] font-semibold text-white backdrop-blur-sm"
                      >
                        <Icon name={a} className="h-3.5 w-3.5" /> {tj(AMENITY_LABEL[a])}
                      </motion.span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-end gap-5">
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-white/55 uppercase">{t("fleet.classes.from")}</div>
                      <div className="tnum font-display text-[34px] leading-none font-extrabold text-white">{money(Math.round(950 * f.priceFactor))}</div>
                    </div>
                    <Button variant="red" onClick={() => navigate("/book/search")}>
                      {t("fleet.gallery.cta")} <Icon name="arrow" className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <CompareStage active={active} />
          </div>

          <div className="mt-8 flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase">
            <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>↓</motion.span>
            {t("fleet.classes.scrollHint")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* animated comparison chart + live mini seat-map */
function CompareStage({ active }: { active: number }) {
  const { t, tj } = useI18n();
  const f = FLEET[active];
  const meta = CLASS_META[f.id];
  const legroomOf = (id: string) => parseInt(FLEET.find((x) => x.id === id)!.legroom, 10);
  const metrics: { key: string; label: string; value: (id: string) => number; display: string }[] = [
    { key: "seats", label: t("common.seats"), value: (id) => 100 - ((CLASS_META[id].seats - 27) / 20) * 60, display: `${meta.seats}` },
    { key: "recline", label: "Recline", value: (id) => ((CLASS_META[id].recline - 100) / 40) * 100, display: `${meta.recline}°` },
    { key: "legroom", label: "Legroom", value: (id) => ((legroomOf(id) - 70) / 22) * 100, display: f.legroom },
    { key: "power", label: "USB / power", value: (id) => CLASS_META[id].power, display: `${meta.power}%` },
    { key: "comfort", label: "Comfort index", value: (id) => CLASS_META[id].comfort, display: `${meta.comfort}` },
  ];
  const rows = f.rows;
  const cols = f.config === "2-1" ? 3 : 4;
  const clamp = (v: number) => Math.max(6, Math.min(100, v));

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md md:p-8">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
        animate={{ background: meta.accent, opacity: 0.32 }}
        transition={{ duration: 0.8 }}
      />
      <div className="relative z-10 grid gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-[0.14em] text-white/55 uppercase">Compare</span>
            <span className="flex gap-1.5">
              {FLEET.map((c) => (
                <span key={c.id} className="h-1.5 w-6 rounded-full transition-colors duration-500" style={{ background: c.id === f.id ? meta.accent : "rgba(255,255,255,.2)" }} />
              ))}
            </span>
          </div>
          <div className="space-y-3.5">
            {metrics.map((m, i) => {
              const v = clamp(m.value(f.id));
              return (
                <div key={m.key}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px] font-bold text-white/85">
                    <span>{m.label}</span>
                    <motion.span key={f.id + m.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="tnum">
                      {m.display}
                    </motion.span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/12">
                    {FLEET.filter((c) => c.id !== f.id).map((c) => (
                      <span key={c.id} className="absolute inset-y-0 left-0 rounded-full bg-white/10" style={{ width: `${clamp(m.value(c.id))}%` }} />
                    ))}
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full"
                      animate={{ width: `${v}%`, background: meta.accent }}
                      transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.04 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* mini seat map */}
        <div className="rounded-2xl border border-white/12 bg-biftu-blue-dark/60 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-white/50 uppercase">
            <span>🚍</span>
            <span>{f.config}</span>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols + 1}, minmax(0,1fr))` }}>
            {Array.from({ length: rows }).flatMap((_, r) =>
              Array.from({ length: cols + 1 }).map((__, c) => {
                if (c === 2) return <span key={`${f.id}-${r}-${c}`} className="h-3 w-3" />;
                const idx = r * cols + (c > 2 ? c - 1 : c);
                return (
                  <motion.span
                    key={`${f.id}-${r}-${c}`}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1, background: idx % 5 === 0 ? meta.accent : "rgba(255,255,255,.8)" }}
                    transition={{ delay: 0.15 + (r * cols + c) * 0.008, type: "spring", stiffness: 300, damping: 22 }}
                    className="h-3 w-3 rounded-[3px]"
                  />
                );
              }),
            )}
          </div>
          <div className="tnum mt-2 text-center text-[11px] font-extrabold text-white">
            {meta.seats} {t("common.seats")} · {tj(f.name)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mobile / tablet / reduced-motion: snap carousel ---------------- */
function MobileCompare() {
  const { t, tj, money } = useI18n();
  const { navigate } = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const step = () => {
    const card = trackRef.current?.querySelector<HTMLElement>("[data-card]");
    return (card?.offsetWidth ?? 320) + 16;
  };
  const goTo = (i: number) => trackRef.current?.scrollTo({ left: Math.max(0, i) * step(), behavior: "smooth" });
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.max(0, Math.min(FLEET.length - 1, Math.round(track.scrollLeft / step()))));
  };

  return (
    <div className="relative z-10 pb-16 md:pb-24">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingLeft: 20 }}
      >
        {FLEET.map((f, i) => {
          const meta = CLASS_META[f.id];
          return (
            <motion.div
              key={f.id}
              data-card
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-[84vw] max-w-[420px] shrink-0 snap-center"
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/12 bg-white/[0.07] p-6 text-white backdrop-blur-md">
                <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl" style={{ background: meta.accent, opacity: 0.35 }} />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] uppercase" style={{ background: meta.accent }}>
                    {f.config}
                  </span>
                  <span className="tnum text-[11px] font-bold text-white/60">
                    {i + 1}/{FLEET.length}
                  </span>
                </div>
                <h3 className="font-display relative z-10 mt-4 text-[34px] leading-none font-extrabold">{tj(f.name)}</h3>
                <p className="relative z-10 mt-3 text-[14px] leading-relaxed text-white/75">{tj(f.description)}</p>
                <div className="relative z-10 mt-5 flex flex-wrap gap-1.5">
                  {f.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold">
                      <Icon name={a} className="h-3.5 w-3.5" /> {tj(AMENITY_LABEL[a])}
                    </span>
                  ))}
                </div>
                <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 text-center">
                  {[
                    [String(meta.seats), t("common.seats")],
                    [`${meta.recline}°`, "recline"],
                    [f.legroom, "legroom"],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-white/8 p-2.5">
                      <div className="tnum text-[16px] font-extrabold">{v}</div>
                      <div className="text-[10px] font-bold text-white/55 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="relative z-10 mt-auto flex items-end justify-between pt-6">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-white/55 uppercase">{t("fleet.classes.from")}</div>
                    <div className="tnum text-[24px] font-extrabold">{money(Math.round(950 * f.priceFactor))}</div>
                  </div>
                  <Button size="sm" onClick={() => navigate("/book/search")}>
                    {t("fleet.gallery.cta")}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="container-biftu mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {FLEET.map((f, i) => (
            <button
              key={f.id}
              onClick={() => goTo(i)}
              aria-label={tj(f.name)}
              aria-current={i === page}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === page ? 32 : 8, background: i === page ? CLASS_META[f.id].accent : "rgba(255,255,255,.3)" }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Previous" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white disabled:opacity-30">
            ←
          </button>
          <button onClick={() => goTo(page + 1)} disabled={page >= FLEET.length - 1} aria-label="Next" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white disabled:opacity-30">
            →
          </button>
        </div>
      </div>
    </div>
  );
}





function Amenities() {
  const { t } = useI18n();
  const items = [
    { icon: "recline", n: 1 },
    { icon: "ac", n: 2 },
    { icon: "usb", n: 3 },
    { icon: "screen", n: 4 },
    { icon: "bus", n: 5 },
    { icon: "snack", n: 6 },
  ];
  return (
    <section className="bg-biftu-paper py-16 md:py-24">
      <div className="container-biftu">
        <SectionTitle eyebrow={t("fleet.header.eyebrow")} title={t("fleet.amenities.title")} />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <StaggerItem key={it.n}>
              <div className="border-biftu-border hover:shadow-card h-full rounded-2xl border bg-white p-6 transition">
                <div className="bg-biftu-red-tint text-biftu-red grid h-12 w-12 place-items-center rounded-xl">
                  <Icon name={it.icon} />
                </div>
                <h3 className="mt-5 text-[17px] font-extrabold">{t(`fleet.amenities.a${it.n}t`)}</h3>
                <p className="text-biftu-ink-soft mt-2 text-[14px] leading-relaxed">{t(`fleet.amenities.a${it.n}d`)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Safety() {
  const { t } = useI18n();
  return (
    <section className="bg-biftu-paper py-16 md:py-24">
      <div className="container-biftu grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <img src="/images/hero.jpg" alt="" className="shadow-card h-[420px] w-full rounded-[26px] object-cover" />
        </Reveal>
        <Reveal delay={0.1}>
          <SectionTitle eyebrow={t("fleet.safety.title")} title={t("fleet.safety.title")} subtitle={t("fleet.safety.subtitle")} />
          <div className="mt-8 space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-biftu-border flex gap-4 rounded-2xl border bg-white p-5">
                <div className="bg-biftu-blue-tint text-biftu-blue grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                  <Icon name={["shield", "chart", "settings"][i - 1]} />
                </div>
                <div>
                  <h4 className="text-[16px] font-extrabold">{t(`fleet.safety.s${i}t`)}</h4>
                  <p className="text-biftu-ink-soft mt-1 text-[14px] leading-relaxed">{t(`fleet.safety.s${i}d`)}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Gallery() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const imgs = ["/images/interior.jpg", "/images/exterior.jpg", "/images/station.jpg", "/images/hero.jpg"];
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="py-16 md:py-24">
      <div className="container-biftu">
        <SectionTitle eyebrow={t("fleet.gallery.title")} title={t("fleet.gallery.title")} />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {imgs.map((src, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -5 }}
              onClick={() => setOpen(src)}
              className={`overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <img src={src} alt="" className={`w-full object-cover ${i === 0 ? "h-full min-h-[280px]" : "h-[180px]"}`} />
            </motion.button>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button size="lg" onClick={() => navigate("/book/search")}>
            {t("fleet.gallery.cta")} <Icon name="arrow" className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="bg-biftu-ink/80 fixed inset-0 z-[80] grid place-items-center p-6 backdrop-blur-sm"
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={open}
              alt=""
              className="max-h-[85vh] w-auto rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
