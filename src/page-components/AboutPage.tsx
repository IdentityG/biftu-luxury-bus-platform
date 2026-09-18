"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n, useRouter } from "@/lib/hooks";
import { CITIES, OFFICES, cityById } from "@/lib/data";
import { Button, Counter, Eyebrow, Icon, Reveal, SectionTitle, Stagger, StaggerItem, inputCls } from "@/components/ui";

export function AboutPage() {
  return (
    <>
      <Hero />
      <Story />
      <Milestones />
      <Values />
      <Offices />
      <Contact />
    </>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
      <img src="/images/station.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="from-biftu-blue-dark/95 via-biftu-blue-dark/80 to-biftu-blue-dark/30 absolute inset-0 bg-gradient-to-r" />
      <div className="container-biftu relative z-10">
        <SectionTitle tone="light" eyebrow={t("about.hero.eyebrow")} title={t("about.hero.title")} subtitle={t("about.hero.subtitle")} />
      </div>
    </section>
  );
}

function Story() {
  const { t } = useI18n();
  const milestones = [1, 2, 3, 4];
  return (
    <section className="py-16 md:py-24">
      <div className="container-biftu grid gap-12 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <SectionTitle eyebrow="2016 — today" title={t("about.story.title")} />
          <p className="text-biftu-ink-soft mt-6 text-[15px] leading-relaxed">{t("about.story.p1")}</p>
          <p className="text-biftu-ink-soft mt-4 text-[15px] leading-relaxed">{t("about.story.p2")}</p>
          <img src="/images/exterior.jpg" alt="" className="shadow-card mt-8 h-64 w-full rounded-[26px] object-cover" />
        </Reveal>
        <Stagger className="relative space-y-4 lg:pl-8">
          <span className="bg-biftu-border absolute top-2 bottom-2 left-0 hidden w-px lg:block" />
          {milestones.map((m) => (
            <StaggerItem key={m}>
              <div className="border-biftu-border shadow-card relative rounded-2xl border bg-white p-6">
                <span className="bg-biftu-red absolute top-8 -left-[38px] hidden h-3 w-3 rounded-full ring-4 ring-white lg:block" />
                <div className="text-biftu-blue tnum font-display text-[24px] font-extrabold">{t(`about.story.m${m}`)}</div>
                <p className="text-biftu-ink-soft mt-2 text-[14px] leading-relaxed">{t(`about.story.m${m}d`)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Milestones() {
  const { t } = useI18n();
  const stats = [
    { v: 9, s: "", k: "about.stats.years" },
    { v: 10, s: "", k: "about.stats.cities" },
    { v: 1.4, s: "M+", k: "about.stats.passengers", d: 1 },
    { v: 48, s: "", k: "about.stats.fleet" },
  ];
  return (
    <section className="bg-biftu-blue relative overflow-hidden py-16 md:py-24">
      <div className="stripe-motif pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-15" />
      <div className="container-biftu relative z-10">
        <SectionTitle tone="light" title={t("about.stats.title")} />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-white/[0.08] p-6 ring-1 ring-white/15"
            >
              <div className="font-display text-[clamp(30px,4vw,50px)] leading-none font-extrabold text-white">
                <Counter to={s.v} suffix={s.s} decimals={s.d ?? 0} />
              </div>
              <div className="mt-3 text-[13px] font-semibold text-white/70">{t(s.k)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Values() {
  const { t } = useI18n();
  return (
    <section className="py-16 md:py-24">
      <div className="container-biftu">
        <SectionTitle align="center" title={t("about.values.title")} />
        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <StaggerItem key={i}>
              <div className="border-biftu-border hover:shadow-card h-full rounded-2xl border bg-white p-7 transition">
                <div className="bg-biftu-blue-tint text-biftu-blue grid h-12 w-12 place-items-center rounded-xl">
                  <Icon name={["clock", "seat", "ticket"][i - 1]} />
                </div>
                <h3 className="mt-5 text-[17px] font-extrabold">{t(`about.values.v${i}t`)}</h3>
                <p className="text-biftu-ink-soft mt-2 text-[14px] leading-relaxed">{t(`about.values.v${i}d`)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Offices() {
  const { t, tj } = useI18n();
  const [active, setActive] = useState(OFFICES[0].id);
  const lats = CITIES.map((c) => c.lat);
  const lngs = CITIES.map((c) => c.lng);
  const minLat = Math.min(...lats) - 0.6,
    maxLat = Math.max(...lats) + 0.6,
    minLng = Math.min(...lngs) - 0.6,
    maxLng = Math.max(...lngs) + 0.6;
  return (
    <section className="bg-biftu-paper py-16 md:py-24">
      <div className="container-biftu">
        <SectionTitle eyebrow={t("about.offices.title")} title={t("about.offices.title")} subtitle={t("about.offices.subtitle")} />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="from-biftu-blue-dark to-biftu-blue relative aspect-[4/3] overflow-hidden rounded-[26px] bg-gradient-to-br">
            <div className="grid-lines absolute inset-0 opacity-30" />
            {OFFICES.map((o) => {
              const c = cityById(o.city);
              const left = ((c.lng - minLng) / (maxLng - minLng)) * 100;
              const top = (1 - (c.lat - minLat) / (maxLat - minLat)) * 100;
              return (
                <button
                  key={o.id}
                  onClick={() => setActive(o.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full ${active === o.id ? "bg-biftu-red text-white" : "bg-white text-biftu-blue"}`}
                  >
                    <Icon name="pin" className="h-4 w-4" />
                  </span>
                  <span className="mt-1 block rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white">
                    {tj(c.name)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            {OFFICES.map((o) => (
              <button
                key={o.id}
                onClick={() => setActive(o.id)}
                className={`w-full rounded-2xl border bg-white p-5 text-left transition ${active === o.id ? "border-biftu-blue shadow-card" : "border-biftu-border"}`}
              >
                <div className="text-[15px] font-extrabold">{tj(o.name)}</div>
                <div className="text-biftu-ink-soft mt-1 text-[13px]">{tj(o.address)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="text-biftu-blue tnum flex items-center gap-1.5 text-[13px] font-bold">
                    <Icon name="phone" className="h-4 w-4" /> {o.phone}
                  </a>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 3) errs.name = t("errors.minName");
    if (!/^\+?[0-9\s]{9,}$/.test(form.phone)) errs.phone = t("errors.phone");
    if (form.email && !/^[^@]+@[^@]+\.[a-z]{2,}$/i.test(form.email)) errs.email = t("errors.email");
    if (form.message.trim().length < 3) errs.message = t("errors.required");
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSent(true);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container-biftu grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionTitle eyebrow={t("about.contact.line")} title={t("about.contact.title")} subtitle={t("about.contact.subtitle")} />
          <a href="tel:8477" className="bg-biftu-blue-dark mt-8 flex items-center gap-4 rounded-2xl p-6 text-white">
            <span className="bg-biftu-red grid h-12 w-12 place-items-center rounded-xl">
              <Icon name="phone" />
            </span>
            <span>
              <span className="block text-[12px] text-white/60">{t("about.contact.line")}</span>
              <span className="font-display tnum block text-[30px] font-extrabold">8477</span>
            </span>
          </a>
          <div className="mt-6">
            <Eyebrow>{t("about.contact.social")}</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Facebook", "Telegram", "TikTok", "Instagram", "YouTube"].map((s) => (
                <a key={s} href="#" className="border-biftu-border hover:border-biftu-blue hover:text-biftu-blue rounded-full border px-4 py-2 text-[13px] font-bold transition">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="border-biftu-border shadow-card rounded-[26px] border bg-white p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("about.contact.name")}</span>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <span className="text-biftu-red text-[12px] font-bold">{errors.name}</span>}
            </label>
            <label className="block">
              <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("about.contact.phone")}</span>
              <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+251 9.." />
              {errors.phone && <span className="text-biftu-red text-[12px] font-bold">{errors.phone}</span>}
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("about.contact.email")}</span>
            <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="text-biftu-red text-[12px] font-bold">{errors.email}</span>}
          </label>
          <label className="mt-4 block">
            <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("about.contact.message")}</span>
            <textarea rows={5} className={inputCls} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {errors.message && <span className="text-biftu-red text-[12px] font-bold">{errors.message}</span>}
          </label>
          <Button type="submit" full className="mt-5">
            {t("about.contact.send")}
          </Button>
          {sent && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-emerald-50 p-4 text-[13px] font-bold text-emerald-700">
              {t("about.contact.sent")}
            </motion.p>
          )}
        </form>
      </div>
    </section>
  );
}
