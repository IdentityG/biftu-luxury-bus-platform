"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { useRouter } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { Badge, Button, Icon, inputCls } from "@/components/ui";
import { cityById, routeFor, getTrips, todayISO } from "@/lib/data";
import { LOCALES } from "@/i18n/messages";
import { BoardingPass, TicketViewer, usePassengerQrs } from "@/components/Ticket";
import { FLEET } from "@/lib/data";
import { cn } from "@/utils/cn";

const TABS = ["overview", "trips", "tickets", "passengers", "profile", "support"] as const;
type Tab = (typeof TABS)[number];

export function Account() {
  const { t } = useI18n();
  const { query } = useRouter();
  const [tab, setTab] = useState<Tab>((query.tab as Tab) && TABS.includes(query.tab as Tab) ? (query.tab as Tab) : "overview");
  const { profile } = useStore();

  return (
    <section className="bg-biftu-paper min-h-screen pt-28 pb-20 md:pt-36">
      <div className="container-biftu">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(26px,3.6vw,40px)] font-extrabold tracking-[-0.02em]">{t("dashboard.title")}</h1>
            <p className="text-biftu-ink-soft mt-1 text-[14px] font-semibold">{profile.fullName} · {profile.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="border-biftu-border relative grid h-10 w-10 place-items-center rounded-full border bg-white">
              <Icon name="ticket" className="text-biftu-blue h-4 w-4" />
              <span className="bg-biftu-red absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white" />
            </span>
            <span className="bg-biftu-blue grid h-10 w-10 place-items-center rounded-full font-extrabold text-white">
              {profile.fullName.charAt(0)}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="border-biftu-border h-fit rounded-2xl border bg-white p-3">
            {TABS.map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-bold transition",
                  tab === x ? "text-biftu-blue" : "text-biftu-ink-soft hover:text-biftu-blue",
                )}
              >
                {tab === x && <motion.span layoutId="acct-pill" className="bg-biftu-blue-tint absolute inset-0 rounded-xl" />}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon name={{ overview: "chart", trips: "bus", tickets: "ticket", passengers: "user", profile: "settings", support: "phone" }[x]} className="h-4 w-4" />
                  {t(`dashboard.nav.${x === "passengers" ? "passengers" : x}`)}
                </span>
              </button>
            ))}
          </aside>

          <div>
            {tab === "overview" && <Overview />}
            {tab === "trips" && <Trips />}
            {tab === "tickets" && <Tickets />}
            {tab === "passengers" && <SavedPassengers />}
            {tab === "profile" && <Profile />}
            {tab === "support" && <Support />}
          </div>
        </div>
      </div>
    </section>
  );
}

function useNext() {
  const { bookings } = useStore();
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && new Date(b.departure) > new Date())
    .sort((a, b) => +new Date(a.departure) - +new Date(b.departure));
  return upcoming[0];
}

function Overview() {
  const { t, tj, money, time, date } = useI18n();
  const { navigate } = useRouter();
  const { bookings } = useStore();
  const next = useNext();
  const [viewer, setViewer] = useState<{ ref: string; seat: string } | null>(null);
  const qrMap = usePassengerQrs(next, 150);
  const qr = next ? qrMap[next.passengers[0]?.seat ?? ""] : "";
  const [left, setLeft] = useState("");

  useEffect(() => {
    if (!next) return;
    const tick = () => {
      const diff = +new Date(next.departure) - Date.now();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [next]);

  const spent = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-6">
      {next ? (
        <div className="bg-biftu-blue-dark relative overflow-hidden rounded-[26px] p-7 text-white">
          <div className="stripe-motif absolute inset-y-0 right-0 w-1/4 opacity-20" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-[11px] tracking-wider text-white/60 uppercase">{t("dashboard.overview.next")}</span>
              <div className="font-display mt-2 text-[clamp(22px,3vw,34px)] font-extrabold">
                {tj(cityById(routeFor(next.routeId).from).name)} → {tj(cityById(routeFor(next.routeId).to).name)}
              </div>
              <div className="mt-2 text-[14px] text-white/75">
                {date(next.departure)} · <span className="tnum">{time(next.departure)}</span> · {t("common.seat")} {next.seats.join(", ")}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[13px] font-bold">
                <Icon name="clock" className="h-4 w-4" /> {t("dashboard.overview.countdown")} <span className="tnum">{left}</span>
              </div>
            </div>
            {qr && (
              <button
                onClick={() => setViewer({ ref: next.ref, seat: next.passengers[0]?.seat ?? "" })}
                className="group flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 p-3 transition hover:bg-white/20"
              >
                <img src={qr} alt="QR" className="rounded-xl bg-white p-1.5 transition group-hover:scale-105" />
                <span className="text-[10px] font-bold tracking-wider text-white/70 uppercase">{t("dashboard.tickets.view")}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="border-biftu-border rounded-[26px] border bg-white p-10 text-center">
          <p className="text-biftu-ink-soft font-semibold">{t("dashboard.overview.none")}</p>
          <Button className="mt-4" onClick={() => navigate("/book/search")}>
            {t("dashboard.overview.bookOne")}
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: "dashboard.overview.trips", v: String(bookings.length) },
          { k: "dashboard.overview.spent", v: money(spent) },
          { k: "dashboard.overview.points", v: String(bookings.length * 120) },
        ].map((s) => (
          <div key={s.k} className="border-biftu-border rounded-2xl border bg-white p-5">
            <div className="text-biftu-ink-soft text-[11px] font-bold uppercase">{t(s.k)}</div>
            <div className="tnum text-biftu-blue mt-2 text-[24px] font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      <SuggestedTrips />

      <AnimatePresence>
        {viewer && next && <TicketViewer booking={next} initialSeat={viewer.seat} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </div>
  );
}

function SuggestedTrips() {
  const { t, tj, money, time } = useI18n();
  const { navigate } = useRouter();
  const trips = getTrips("r1", todayISO(2)).slice(0, 3);
  return (
    <div className="border-biftu-border rounded-2xl border bg-white p-6">
      <h3 className="text-[15px] font-extrabold">{t("home.popular.title")}</h3>
      <div className="mt-4 space-y-3">
        {trips.map((tr) => (
          <button
            key={tr.id}
            onClick={() => navigate(`/book/${tr.id}/seats`, { pax: 1 })}
            className="border-biftu-border hover:border-biftu-blue flex w-full items-center justify-between rounded-xl border p-4 text-left transition"
          >
            <span className="text-[14px] font-bold">
              {tj(cityById("addis").name)} → {tj(cityById("hawassa").name)} · <span className="tnum">{time(tr.departure)}</span>
            </span>
            <span className="text-biftu-red tnum font-extrabold">{money(tr.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Trips() {
  const { t, tj, money, time, date } = useI18n();
  const { bookings, cancelBooking } = useStore();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const now = Date.now();
  const list = bookings.filter((b) =>
    tab === "cancelled" ? b.status === "cancelled" : b.status !== "cancelled" && (tab === "upcoming" ? +new Date(b.departure) > now : +new Date(b.departure) <= now),
  );
  return (
    <div className="border-biftu-border rounded-[26px] border bg-white p-6">
      <div className="bg-biftu-paper flex w-fit gap-1 rounded-full p-1">
        {(["upcoming", "past", "cancelled"] as const).map((x) => (
          <button key={x} onClick={() => setTab(x)} className={cn("relative rounded-full px-4 py-2 text-[13px] font-bold", tab === x ? "text-white" : "text-biftu-ink-soft")}>
            {tab === x && <motion.span layoutId="trip-pill" className="bg-biftu-blue absolute inset-0 rounded-full" />}
            <span className="relative z-10">{t(`dashboard.trips.${x}`)}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {list.length === 0 && <p className="text-biftu-ink-soft py-8 text-center text-[14px] font-semibold">{t("dashboard.trips.empty")}</p>}
        {list.map((b) => {
          const r = routeFor(b.routeId);
          return (
            <div key={b.ref} className="border-biftu-border flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
              <div>
                <div className="text-[15px] font-extrabold">
                  {tj(cityById(r.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(r.to).name)}
                </div>
                <div className="text-biftu-ink-soft mt-1 text-[13px] font-semibold">
                  {date(b.departure)} · <span className="tnum">{time(b.departure)}</span> · {b.ref}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {b.payStatus && (
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold",
                      b.payStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.payStatus === "due_on_arrival"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-biftu-blue-tint text-biftu-blue",
                    )}
                  >
                    <Icon name={b.payStatus === "due_on_arrival" ? "clock" : b.payStatus === "paid" ? "check" : "shield"} className="h-3 w-3" />
                    {b.payStatus === "paid"
                      ? t("dashboard.pay.paid")
                      : b.payStatus === "due_on_arrival"
                        ? t("dashboard.pay.onArrival")
                        : t("dashboard.pay.review")}
                  </span>
                )}
                <Badge tone="blue">{tj(FLEET.find((f) => f.id === b.busClass)!.name)}</Badge>
                <span className="tnum text-biftu-red font-extrabold">{money(b.total)}</span>
                {b.status === "confirmed" && tab === "upcoming" && (
                  <Button size="sm" variant="outline" onClick={() => cancelBooking(b.ref)}>
                    {t("common.cancel")}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tickets() {
  const { t, tj, money } = useI18n();
  const { bookings, profile } = useStore();
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ ref: string; seat: string } | null>(null);
  const active = viewer ? bookings.find((b) => b.ref === viewer.ref) : null;

  return (
    <div className="space-y-5">
      {bookings.length === 0 && (
        <div className="border-biftu-border rounded-[26px] border bg-white p-10 text-center">
          <p className="text-biftu-ink-soft text-[14px] font-semibold">{t("dashboard.trips.empty")}</p>
        </div>
      )}

      {bookings.map((b) => {
        const r = routeFor(b.routeId);
        return (
          <div key={b.ref} className="border-biftu-border rounded-[26px] border bg-white p-4">
            <div className="border-biftu-border mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="min-w-0">
                <div className="tnum text-[17px] font-extrabold">{b.ref}</div>
                <div className="text-biftu-ink-soft mt-0.5 text-[12px] font-semibold">
                  {r ? `${tj(cityById(r.from).name)} → ${tj(cityById(r.to).name)}` : b.routeId} · {b.passengers.length} {t("common.seats")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-biftu-red tnum text-[15px] font-extrabold">{money(b.total)}</span>
                <Button size="sm" variant="outline" onClick={() => setSentRef(b.ref)}>
                  {sentRef === b.ref ? t("dashboard.tickets.sent") : t("dashboard.tickets.resend")}
                </Button>
              </div>
            </div>

            {/* one unique, signed boarding pass per seat */}
            <div className="grid gap-4 sm:grid-cols-2">
              {b.passengers.map((p) => (
                <BoardingPass key={p.seat} booking={b} seat={p.seat} compact onOpen={() => setViewer({ ref: b.ref, seat: p.seat })} />
              ))}
            </div>
            {sentRef === b.ref && (
              <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-[12px] font-bold text-emerald-700">
                {t("dashboard.tickets.sent")} · {LOCALES.find((l) => l.code === profile.preferredLocale)?.label} · {profile.phone}
              </p>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {viewer && active && <TicketViewer booking={active} initialSeat={viewer.seat} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </div>
  );
}

function SavedPassengers() {
  const { t } = useI18n();
  const { savedPassengers, addSavedPassenger } = useStore();
  const [form, setForm] = useState({ fullName: "", phone: "", gender: "male", idNumber: "" });
  return (
    <div className="border-biftu-border rounded-[26px] border bg-white p-6">
      <h3 className="text-[15px] font-extrabold">{t("dashboard.passengersTab.title")}</h3>
      <div className="mt-4 space-y-3">
        {savedPassengers.map((p) => (
          <div key={p.idNumber} className="border-biftu-border flex items-center justify-between rounded-xl border p-4">
            <div>
              <div className="text-[14px] font-bold">{p.fullName}</div>
              <div className="text-biftu-ink-soft tnum text-[12px]">{p.phone} · {p.idNumber}</div>
            </div>
            <Icon name="user" className="text-biftu-blue" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <input className={inputCls} placeholder={t("booking.passengers.fullName")} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className={inputCls} placeholder={t("booking.passengers.phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={inputCls} placeholder={t("booking.passengers.idNumber")} value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
        <Button
          onClick={() => {
            if (form.fullName && form.idNumber) {
              addSavedPassenger(form);
              setForm({ fullName: "", phone: "", gender: "male", idNumber: "" });
            }
          }}
        >
          {t("dashboard.passengersTab.add")}
        </Button>
      </div>
    </div>
  );
}

function Profile() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { profile, setProfile, setRole } = useStore();
  const [saved, setSaved] = useState(false);
  return (
    <div className="border-biftu-border rounded-[26px] border bg-white p-6">
      <h3 className="text-[15px] font-extrabold">{t("dashboard.profile.title")}</h3>
      <div className="border-biftu-border mt-5 rounded-2xl border p-4">
        <span className="text-biftu-ink-soft mb-2 block text-[11px] font-bold uppercase">Account role</span>
        <div className="flex flex-wrap gap-2">
          {(["customer", "agent", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-bold capitalize transition",
                profile.role === r ? "border-biftu-blue bg-biftu-blue text-white" : "border-biftu-border text-biftu-ink-soft",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-biftu-ink-soft mt-2 text-[12px]">Staff roles unlock the operations console.</p>
        {profile.role !== "customer" && (
          <Button size="sm" className="mt-3" onClick={() => navigate("/admin")}>
            <Icon name="chart" className="h-4 w-4" /> Open admin console
          </Button>
        )}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("dashboard.profile.fullName")}</span>
          <input className={inputCls} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("dashboard.profile.phone")}</span>
          <input className={inputCls} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </label>
        <label className="block md:col-span-2">
          <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("dashboard.profile.email")}</span>
          <input className={inputCls} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </label>
      </div>
      <div className="mt-6">
        <span className="text-biftu-ink-soft mb-2 block text-[11px] font-bold uppercase">{t("dashboard.profile.language")}</span>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => setProfile({ ...profile, preferredLocale: l.code })}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-bold transition",
                profile.preferredLocale === l.code ? "border-biftu-blue bg-biftu-blue text-white" : "border-biftu-border text-biftu-ink-soft",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-biftu-ink-soft mt-2 text-[12px]">{t("dashboard.profile.languageHint")}</p>
      </div>
      <Button
        className="mt-6"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2200);
        }}
      >
        {t("dashboard.profile.save")}
      </Button>
      {saved && <span className="ml-3 text-[13px] font-bold text-emerald-600">{t("dashboard.profile.saved")}</span>}
    </div>
  );
}

function Support() {
  const { t, tj } = useI18n();
  return (
    <div className="border-biftu-border rounded-[26px] border bg-white p-6">
      <h3 className="text-[15px] font-extrabold">{t("dashboard.support.title")}</h3>
      <p className="text-biftu-ink-soft mt-2 text-[14px]">{t("dashboard.support.subtitle")}</p>
      <a href="tel:8477" className="bg-biftu-blue-dark mt-5 inline-flex items-center gap-3 rounded-2xl px-6 py-4 text-white">
        <Icon name="phone" />
        <span className="font-display tnum text-[26px] font-extrabold">8477</span>
      </a>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {["o1", "o2"].map((id) => {
          const o = { o1: { n: { en: "Wolaita Sodo" }, p: "+251 943 822 619" }, o2: { n: { en: "Addis Ababa" }, p: "8477" } }[id]!;
          return (
            <div key={id} className="bg-biftu-paper rounded-xl p-4">
              <div className="text-[13px] font-extrabold">{tj(o.n)}</div>
              <div className="text-biftu-blue tnum text-[13px] font-bold">{o.p}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
