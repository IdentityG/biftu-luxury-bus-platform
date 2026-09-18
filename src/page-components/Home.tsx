"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useI18n, useRouter } from "@/lib/hooks";
import { SearchCard } from "@/components/SearchCard";
import { Badge, Button, Counter, Icon, Reveal, SectionTitle, Stagger, StaggerItem, Stars } from "@/components/ui";
import { AMENITY_LABEL, FLEET, ROUTES, TESTIMONIALS, cityById, getTrips, todayISO } from "@/lib/data";

export function Home() {
  return (
    <>
      <Hero />
      <SearchRibbon />
      <StatBand />
      <PopularRoutes />
      <FleetPreview />
      <Features />
      <TestimonialsCTA />
    </>
  );
}

/* ============================ 7.1 HERO — cinematic opening ============================ */

const HEADLINE = { en: ["TRAVEL", "ELEVATED"], am: ["ጉዞ", "በከፍታ"], om: ["IMALA", "OL'AANAA"] } as const;

const DESTINATIONS: { code: string; km: number; note: { en: string; am: string; om: string }; from: string; to: string }[] = [
  { code: "HAW", km: 275, from: "addis", to: "hawassa", note: { en: "Lake Awassa at dawn", am: "ሀዋሳ ሐውዝ በማለዳ", om: "Haroo Hawaasaa ganama" } },
  { code: "WSD", km: 330, from: "addis", to: "sodo", note: { en: "Wolaita green hills", am: "የወላይታ አረንጓዴ ኮረብታ", om: "Gaara Wolayitaa" } },
  { code: "ARM", km: 455, from: "addis", to: "arbaminch", note: { en: "Forty springs, one lake", am: "አርባ ምንጭ ሐውዝ", om: "Haroo Arbaa Mincii" } },
  { code: "DDR", km: 445, from: "addis", to: "diredawa", note: { en: "Desert oasis of the east", am: "የምስራቁ አረንጓዴ መዓልት", om: "Dirre Dhawaa" } },
  { code: "HRJ", km: 525, from: "addis", to: "harar", note: { en: "The walled city of Harar", am: "የሐረር ግንብ", om: "Daldala Harar" } },
  { code: "JJG", km: 628, from: "addis", to: "jijiga", note: { en: "Gateway to the south-east", am: "የምስራቅ በር", om: "Balbala kibbxii" } },
  { code: "NGB", km: 600, from: "addis", to: "negelle", note: { en: "Borena golden savannah", am: "የቦረና ሱዛና", om: "Booranaa" } },
];

function useCoarse() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 820px)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return coarse;
}

/* floating dust / light particles — gives the frame breathing depth */
function Particles({ count = 14 }: { count?: number }) {
  const parts = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 61) % 100}%`,
      top: `${(i * 37) % 100}%`,
      size: 3 + ((i * 7) % 4),
      delay: (i % 9) * 0.9,
      dur: 9 + ((i * 5) % 8),
      opacity: 0.25 + ((i * 13) % 30) / 100,
    })),
  ).current;
  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden" aria-hidden>
      {parts.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [-16, -110], x: [0, (p.id % 3 - 1) * 30], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* one energetic sheen that sweeps the whole hero every few seconds */
function Sheen() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2]"
      initial={false}
      animate={{ x: ["-60%", "220%"] }}
      transition={{ duration: 7, repeat: Infinity, repeatDelay: 4.5, ease: [0.5, 0, 0.2, 1] }}
      style={{
        width: "38%",
        background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.16) 48%, rgba(215,26,33,0.10) 52%, transparent 100%)",
        filter: "blur(14px)",
      }}
    />
  );
}

function Hero() {
  const { t, locale, tj, money } = useI18n();
  const { navigate } = useRouter();
  const coarse = useCoarse();
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  /* scroll choreography */
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);
  const heroFade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  /* cursor parallax (desktop only, springs keep it buttery) */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const l1y = useTransform(sy, (v) => v * -10); // rails move gently
  const l2x = useTransform(sx, (v) => v * 22); // backdrop moves parallax
  const l2y = useTransform(sy, (v) => v * 10);
  const l3x = useTransform(sx, (v) => v * 7); // centre content moves least (depth)
  const l3y = useTransform(sy, (v) => v * 4);

  /* destination rotator */
  const [dest, setDest] = useState(0);
  const [destPaused, setDestPaused] = useState(false);
  useEffect(() => {
    if (destPaused || reduce) return;
    const id = setInterval(() => setDest((d) => (d + 1) % DESTINATIONS.length), 3600);
    return () => clearInterval(id);
  }, [destPaused, reduce]);
  const d = DESTINATIONS[dest];

  /* split headline on scroll */
  const a = HEADLINE[locale as keyof typeof HEADLINE];
  const w1y = useTransform(scrollYProgress, (v) => v * -(coarse ? 0 : 130));
  const w2y = useTransform(scrollYProgress, (v) => v * (coarse ? 0 : 130));
  const bgY = useTransform([y, l2y], (v) => (Number(v[0]) + Number(v[1])) as unknown as string);

  const mouse = coarse || reduce
    ? {}
    : {
        onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
          my.set(((e.clientY - r.top) / r.height) * 2 - 1);
        },
        onMouseLeave: () => {
          mx.set(0);
          my.set(0);
        },
      };

  const size = locale === "en" ? "clamp(56px, 12.5vw, 220px)" : locale === "am" ? "clamp(42px, 10.5vw, 176px)" : "clamp(42px, 10vw, 168px)";
  const size2 = locale === "en" ? "clamp(56px, 12.5vw, 220px)" : locale === "am" ? "clamp(42px, 10.5vw, 176px)" : "clamp(42px, 10vw, 168px)";

  const nextDepartures = [getTrips("r1", todayISO())[0], getTrips("r2", todayISO())[1], getTrips("r4", todayISO())[2]];

  return (
    <section
      ref={ref}
      {...mouse}
      className="hero-vignette hero-grain relative min-h-[640px] w-full overflow-x-clip overflow-y-hidden"
      style={{ height: "100svh" }}
    >
      {/* backdrop image — cursor parallax + scroll zoom */}
      <motion.div style={coarse ? { y } : { x: l2x, y: bgY }} className="absolute -inset-[6%]">
        <motion.div
          initial={{ scale: reduce ? 1 : 1.14 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full"
        >
          <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover" style={{ objectPosition: "center 55%" }} />
        </motion.div>
      </motion.div>

      {/* brand-grade overlay: deep edge, airy centre */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(120% 90% at 50% 30%, rgba(14,47,99,0) 34%, rgba(14,47,99,0.28) 100%),
            linear-gradient(180deg, rgba(14,47,99,0.62) 0%, rgba(14,47,99,0.10) 30%, rgba(18,21,26,0.06) 55%, rgba(14,47,99,0.32) 100%)
          `,
        }}
      />

      {/* architectural guide lines (fixed-feel, parallax subtle) */}
      <motion.div style={{ opacity: heroFade }} className="pointer-events-none absolute inset-0 z-[1]">
        {["20%", "40%", "60%", "80%"].map((x) => (
          <span key={x} className="absolute inset-y-0 w-px bg-white/[0.07]" style={{ left: x }} />
        ))}
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/[0.05]" />
      </motion.div>

      {!reduce && <Particles />}
      {!reduce && !coarse && <Sheen />}

      {/* blue edge halo + red hairline framing the centre composition */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-x-[5%] top-1/2 z-[1] hidden h-[52vh] -translate-y-1/2 md:block"
      >
        <span className="absolute inset-0 rounded-[32px] border border-white/[0.13]" />
        <span className="bg-biftu-red absolute -top-1 -left-1 h-3 w-3 rounded-full shadow-[0_0_18px_rgba(215,26,33,0.9)]" />
        <span className="bg-biftu-red absolute -top-1 -right-1 h-3 w-3 rounded-full shadow-[0_0_18px_rgba(215,26,33,0.9)]" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
        <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
      </motion.div>

      {/* centre framing: eyebrow, giant split headline, subhead */}
      <motion.div
        style={coarse ? { opacity: fade } : { opacity: fade, x: l3x, y: l3y }}
        className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center px-5 pt-8 text-center md:pt-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <span className="h-px w-8 bg-white/50" />
          <span className="text-[11px] font-extrabold tracking-[0.32em] text-white/85 uppercase md:text-[12px]">{t("hero.eyebrow")}</span>
          <span className="h-px w-8 bg-white/50" />
        </motion.div>

        <h1 className="mt-5 md:mt-7">
          <span className="block overflow-hidden pb-1">
            <motion.span
              style={{ fontSize: size, y: w1y }}
              initial={{ y: reduce ? 0 : "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-gradient-hero font-display inline-block whitespace-nowrap leading-[0.84] font-extrabold tracking-[-0.035em]"
            >
              {a[0]}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              style={{ fontSize: size2, y: w2y }}
              initial={{ y: reduce ? 0 : "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-outline inline-block whitespace-nowrap leading-[0.9] font-extrabold tracking-[-0.035em]"
            >
              {a[1]}
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.9 }}
          className="mt-5 max-w-[520px] text-[13.5px] font-semibold text-white/75 md:mt-7 md:text-[15px]"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* hero CTAs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-3 md:mt-8">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/book/search")}
            className="bg-biftu-red hover:bg-biftu-red-dark flex items-center gap-2.5 rounded-2xl px-7 py-4 text-[14px] font-extrabold text-white shadow-[0_14px_36px_rgba(215,26,33,0.45)] transition-colors"
          >
            {t("nav.bookNow")} <Icon name="arrow" className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/routes")}
            className="flex items-center gap-2.5 rounded-2xl border border-white/35 bg-white/10 px-7 py-4 text-[14px] font-extrabold text-white backdrop-blur-md transition hover:border-white hover:bg-white/20"
          >
            {t("nav.routes")}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* left rail: live departure ticker */}
      <motion.aside
        initial={{ opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ y: coarse ? 0 : l1y }}
        className="absolute bottom-[110px] left-[max(20px,calc((100vw-1360px)/2+56px))] z-[3] hidden w-[280px] md:block"
      >
        <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold tracking-[0.18em] text-white/60 uppercase">
            <span className="bg-emerald-400 inline-block h-1.5 w-1.5 rounded-full" />
            {t("hero.liveDepartures")}
          </div>
          <div className="space-y-2">
            {nextDepartures.map((tr) => {
              const r = tr && ROUTES.find((x) => x.id === tr.routeId);
              if (!tr || !r) return null;
              return (
                <button
                  key={tr.id}
                  onClick={() => navigate("/book/results", { from: r.from, to: r.to, date: todayISO(1), pax: 1, route: r.id })}
                  className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/[0.07] px-3 py-2 text-left transition hover:bg-white/[0.16]"
                >
                  <span className="truncate text-[12px] font-bold text-white">
                    {tj(cityById(r.from).name)} → {tj(cityById(r.to).name)}
                  </span>
                  <span className="text-biftu-red-tint tnum text-[12px] font-extrabold">{money(tr.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.aside>

      {/* right rail: destination rotator dial */}
      <motion.aside
        initial={{ opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ y: coarse ? 0 : l1y }}
        onMouseEnter={() => setDestPaused(true)}
        onMouseLeave={() => setDestPaused(false)}
        className="absolute right-[max(20px,calc((100vw-1360px)/2+56px))] bottom-[110px] z-[3] hidden w-[240px] md:block"
      >
        <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 text-right backdrop-blur-md">
          <div className="text-[10px] font-extrabold tracking-[0.18em] text-white/55 uppercase">{t("hero.destinations")}</div>
          <AnimatePresence mode="wait">
            <motion.div key={d.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
              <div className="font-display mt-2 text-[34px] leading-none font-extrabold text-white">{d.code}</div>
              <div className="mt-1 text-[13px] font-extrabold text-white">{tj(cityById(d.to).name)}</div>
              <div className="text-biftu-red-tint text-[11.5px] font-semibold">{d.note[locale as keyof (typeof d)["note"]]}</div>
              <div className="tnum mt-1.5 text-[11px] font-bold text-white/50">{d.km} km · Addis Ababa</div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex justify-end gap-1.5">
            {DESTINATIONS.map((x, i) => (
              <button
                key={x.code}
                onClick={() => setDest(i)}
                aria-label={tj(cityById(x.to).name)}
                aria-current={i === dest}
                className="h-1 rounded-full transition-all"
                style={{ width: i === dest ? 20 : 6, background: i === dest ? "#D71A21" : "rgba(255,255,255,.35)" }}
              />
            ))}
          </div>
        </div>
      </motion.aside>

      {/* bottom-only copy (mobile), scroll cue (desktop) */}
      <div className="container-biftu absolute inset-x-0 bottom-[36px] z-[3] md:hidden">
        <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-center text-[15px] font-bold text-white/85">
          {t("hero.title")}
        </motion.h2>
      </div>

      <motion.a
        href="#biftu-search"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        style={{ opacity: heroFade }}
        className="text-white/75 hover:text-white absolute bottom-[30px] left-1/2 z-[4] hidden -translate-x-1/2 flex-col items-center gap-2 text-[10.5px] font-extrabold tracking-[0.24em] uppercase transition-colors md:flex"
      >
        {t("hero.scroll")}
        <span className="border-white/50 flex h-9 w-5 justify-center rounded-full border pt-1.5">
          <motion.span animate={{ y: [0, 8, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="bg-biftu-red h-1.5 w-1.5 rounded-full" />
        </span>
      </motion.a>

      {/* red lane strip at the hero's base — the livery moment */}
      <div className="absolute inset-x-0 bottom-0 z-[3] h-1.5">
        <div className="stripe-motif h-full w-full opacity-90" />
      </div>
    </section>
  );
}

/* Paper band whose top edge the search card deliberately breaks — never clipped. */
function SearchRibbon() {
  return (
    <div id="biftu-search" className="bg-biftu-paper grid-lines relative z-30 pt-0">
      <div className="container-biftu">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="-mt-[68px] sm:-mt-[84px] md:-mt-[96px]"
        >
          <SearchCard variant="floating" />
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- 7.2 STATS ---------------- */
function StatBand() {
  const { t } = useI18n();
  const stats = [
    { v: 14, s: "+", k: "home.stats.routes" },
    { v: 62, s: "", k: "home.stats.departures" },
    { v: 4.8, s: "/5", k: "home.stats.rating", d: 1 },
    { v: 9, s: "", k: "home.stats.years" },
  ];
  return (
    <section className="bg-biftu-paper pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="container-biftu">
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.k}>
              <div className="border-biftu-border shadow-card h-full rounded-2xl border bg-white p-6">
                <div className="font-display text-biftu-blue text-[clamp(32px,4.5vw,54px)] leading-none font-extrabold tracking-[-0.03em]">
                  <Counter to={s.v} suffix={s.s} decimals={s.d ?? 0} />
                </div>
                <div className="text-biftu-ink-soft mt-3 text-[13px] font-semibold">{t(s.k)}</div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- 7.3 POPULAR ROUTES ---------------- */
function PopularRoutes() {
  const { t, tj, money, time } = useI18n();
  const { navigate } = useRouter();
  const popular = ROUTES.filter((r) => r.popular).slice(0, 6);

  return (
    <section className="py-20 md:py-[110px]">
      <div className="container-biftu">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow={t("home.popular.eyebrow")} title={t("home.popular.title")} subtitle={t("home.popular.subtitle")} />
          <Button variant="outline" onClick={() => navigate("/routes")}>
            {t("common.viewAll")} <Icon name="arrow" className="h-4 w-4" />
          </Button>
        </div>

        <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {popular.map((r) => {
            const next = getTrips(r.id, todayISO())[2];
            return (
              <StaggerItem key={r.id}>
                <motion.button
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate("/book/results", { from: r.from, to: r.to, date: todayISO(1), pax: 1, route: r.id })}
                  className="border-biftu-border shadow-card hover:shadow-card-hover group w-full rounded-2xl border bg-white p-6 text-left transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-biftu-ink text-[19px] leading-tight font-extrabold">{tj(cityById(r.from).name)}</div>
                      <div className="text-biftu-blue mt-1 flex items-center gap-2 text-[19px] leading-tight font-extrabold">
                        <Icon name="arrow" className="text-biftu-red h-4 w-4" />
                        {tj(cityById(r.to).name)}
                      </div>
                    </div>
                    <Badge tone="blue">{r.distanceKm} km</Badge>
                  </div>
                  <div className="border-biftu-border mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-biftu-ink-soft flex items-center gap-2 text-[13px] font-semibold">
                      <Icon name="clock" className="h-4 w-4" />
                      <span className="tnum">
                        {Math.floor(r.durationMinutes / 60)}
                        {t("common.hoursShort")} {r.durationMinutes % 60}
                        {t("common.minutesShort")}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-biftu-ink-soft text-[11px] font-semibold">{t("common.from")}</div>
                      <div className="text-biftu-red tnum text-[18px] font-extrabold">{money(r.basePrice)}</div>
                    </div>
                  </div>
                  {next && (
                    <div className="bg-biftu-blue-tint text-biftu-blue mt-4 flex items-center justify-between rounded-xl px-3 py-2 text-[12px] font-bold">
                      <span>{t("home.popular.next")}</span>
                      <span className="tnum">{time(next.departure)}</span>
                    </div>
                  )}
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- 7.4 FLEET PREVIEW ---------------- */
function FleetPreview() {
  const { t, tj, money } = useI18n();
  const { navigate } = useRouter();
  return (
    <section className="bg-biftu-blue-dark relative overflow-hidden py-20 md:py-[110px]">
      <div className="stripe-motif pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-15" />
      <div className="container-biftu relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle tone="light" eyebrow={t("home.fleet.eyebrow")} title={t("home.fleet.title")} />
          <Button variant="white" onClick={() => navigate("/fleet")}>
            {t("home.fleet.see")} <Icon name="arrow" className="h-4 w-4" />
          </Button>
        </div>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {FLEET.map((f, i) => (
            <StaggerItem key={f.id}>
              <motion.div whileHover={{ y: -6 }} className="flex h-full flex-col rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[22px] font-extrabold text-white">{tj(f.name)}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">{f.config}</span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-white/70">{tj(f.description)}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {f.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white/80">
                      <Icon name={a} className="h-3.5 w-3.5" /> {tj(AMENITY_LABEL[a])}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-end justify-between pt-6">
                  <span className="text-[12px] font-semibold text-white/60">{t("common.from")}</span>
                  <span className="tnum text-[22px] font-extrabold text-white">{money(Math.round(950 * f.priceFactor))}</span>
                </div>
                {i === 0 && <div className="bg-biftu-red mt-4 h-1 w-14 rounded-full" />}
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- 7.5 FEATURES ---------------- */
function Features() {
  const { t } = useI18n();
  const items = [
    { icon: "shield", t: "home.features.f1t", d: "home.features.f1d" },
    { icon: "pin", t: "home.features.f2t", d: "home.features.f2d" },
    { icon: "ticket", t: "home.features.f3t", d: "home.features.f3d" },
    { icon: "phone", t: "home.features.f4t", d: "home.features.f4d" },
  ];
  return (
    <section className="py-20 md:py-[110px]">
      <div className="container-biftu grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionTitle eyebrow={t("home.features.eyebrow")} title={t("home.features.title")} />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <img src="/images/interior.jpg" alt="" className="shadow-card h-48 w-full rounded-2xl object-cover" />
            <img src="/images/station.jpg" alt="" className="shadow-card mt-8 h-48 w-full rounded-2xl object-cover" />
          </div>
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <StaggerItem key={it.t}>
              <div className="border-biftu-border hover:shadow-card h-full rounded-2xl border bg-white p-6 transition-shadow">
                <div className="bg-biftu-blue-tint text-biftu-blue grid h-12 w-12 place-items-center rounded-xl">
                  <Icon name={it.icon} />
                </div>
                <h3 className="text-biftu-ink mt-5 text-[17px] font-extrabold">{t(it.t)}</h3>
                <p className="text-biftu-ink-soft mt-2 text-[14px] leading-relaxed">{t(it.d)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- 7.6 TESTIMONIALS + CTA ---------------- */
function TestimonialsCTA() {
  const { t, tj } = useI18n();
  const { navigate } = useRouter();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % TESTIMONIALS.length), 5200);
    return () => clearInterval(id);
  }, [paused]);

  const cur = TESTIMONIALS[i];

  return (
    <>
      <section className="bg-biftu-paper py-20 md:py-[110px]">
        <div className="container-biftu">
          <SectionTitle align="center" eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} />
          <div
            className="relative mx-auto mt-12 max-w-3xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="border-biftu-border shadow-card min-h-[260px] rounded-2xl border bg-white p-8 md:p-10">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={cur.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.5 }}
                >
                  <Stars n={cur.rating} />
                  <p className="text-biftu-ink mt-5 text-[clamp(17px,2.2vw,23px)] leading-[1.45] font-semibold">“{tj(cur.quote)}”</p>
                  <footer className="text-biftu-ink-soft mt-6 text-[13px] font-bold">
                    {cur.author} · <span className="text-biftu-blue">{cur.city}</span>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {TESTIMONIALS.map((tm, idx) => (
                <button
                  key={tm.id}
                  onClick={() => setI(idx)}
                  aria-label={`${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${idx === i ? "bg-biftu-red w-8" : "bg-biftu-border w-2"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-biftu-blue relative overflow-hidden py-16 md:py-24">
        <div className="stripe-motif pointer-events-none absolute inset-y-0 left-1/2 w-[60%] opacity-20" />
        <div className="container-biftu relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-[clamp(30px,4.6vw,56px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-white">
              {t("home.cta.title")}
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-white/80">{t("home.cta.subtitle")}</p>
          </div>
          <Button size="lg" onClick={() => navigate("/book/search")}>
            {t("home.cta.button")} <Icon name="arrow" className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
