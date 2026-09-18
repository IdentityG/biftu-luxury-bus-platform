"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { useRouter } from "@/lib/hooks";
import { useStore, type Passenger } from "@/lib/store";
import { SearchCard } from "@/components/SearchCard";
import { SeatMap } from "@/components/SeatMap";
import { Badge, Button, Icon, SectionTitle, inputCls } from "@/components/ui";
import { FLEET, cityById, findRoute, getTripById, getTrips, makeRef, routeFor, todayISO, type Trip } from "@/lib/data";
import { BoardingPass, TicketViewer } from "@/components/Ticket";
import { cn } from "@/utils/cn";

const STEPS = ["search", "results", "seats", "passengers", "payment", "done"] as const;

function Steps({ current, onStep }: { current: number; onStep?: (i: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="scroll-thin flex items-center gap-2 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const clickable = done && !!onStep;
        return (
          <div key={s} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStep(i)}
              aria-current={i === current ? "step" : undefined}
              title={clickable ? `${t("common.back")} · ${t(`booking.steps.${s}`)}` : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap transition",
                i === current
                  ? "bg-biftu-blue text-white"
                  : done
                    ? "bg-biftu-blue-tint text-biftu-blue"
                    : "bg-biftu-paper text-biftu-ink-soft",
                clickable && "hover:bg-biftu-blue hover:text-white cursor-pointer",
                !clickable && i !== current && "cursor-default",
              )}
            >
              <span className={cn("tnum grid h-4 w-4 place-items-center rounded-full text-[10px]", done ? "bg-biftu-blue text-white" : i === current ? "bg-white/25" : "")}>
                {done ? "✓" : i + 1}
              </span>
              {t(`booking.steps.${s}`)}
            </button>
            {i < STEPS.length - 1 && <span className="bg-biftu-border h-px w-4 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function Shell({
  step,
  children,
  back,
  backLabel,
  onStep,
}: {
  step: number;
  children: React.ReactNode;
  /** where the back control goes; omit to hide it (search + confirmation) */
  back?: () => void;
  backLabel?: string;
  onStep?: (i: number) => void;
}) {
  const { t } = useI18n();
  const { navigate } = useRouter();

  return (
    <section className="bg-biftu-paper min-h-screen pt-28 pb-20 md:pt-36">
      <div className="container-biftu">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {back ? (
            <motion.button
              type="button"
              onClick={back}
              whileTap={{ scale: 0.96 }}
              className="border-biftu-border text-biftu-ink hover:border-biftu-blue hover:text-biftu-blue hover:bg-biftu-blue-tint group inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-[13px] font-bold transition"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
              {backLabel ?? t("common.back")}
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="border-biftu-border text-biftu-ink-soft hover:border-biftu-blue hover:text-biftu-blue inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-[13px] font-bold transition"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              {t("nav.home")}
            </button>
          )}
          <span className="text-biftu-ink-soft tnum ml-auto text-[11.5px] font-bold">
            {t("booking.stepOf", { current: step + 1, total: STEPS.length })}
          </span>
        </div>

        <Steps current={step} onStep={onStep} />

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8">
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/** Resolves any step index to the right route, preserving the in-progress search. */
function useFlowNav(tripId?: string) {
  const { navigate, query } = useRouter();
  const q = {
    from: query.from,
    to: query.to,
    date: query.date,
    pax: query.pax,
    route: query.route,
  };
  return (i: number) => {
    if (i <= 0) return navigate("/book/search", q);
    if (i === 1) return navigate("/book/results", q);
    if (!tripId) return navigate("/book/results", q);
    if (i === 2) return navigate(`/book/${tripId}/seats`, { pax: query.pax });
    if (i === 3) return navigate(`/book/${tripId}/passengers`, { pax: query.pax });
    return navigate(`/book/${tripId}/payment`, { pax: query.pax });
  };
}

/* ---------- 1. SEARCH ---------- */
export function BookSearch() {
  const { t } = useI18n();
  const { query } = useRouter();
  return (
    <Shell step={0}>
      <SectionTitle eyebrow={t("nav.bookNow")} title={t("booking.search.title")} />
      <div className="mt-8">
        <SearchCard variant="inline" defaults={{ from: query.from, to: query.to, date: query.date, pax: query.pax ? Number(query.pax) : 1 }} />
      </div>
    </Shell>
  );
}

/* ---------- 2. RESULTS ---------- */
export function BookResults() {
  const { t, tj, money, time, date } = useI18n();
  const { query, navigate } = useRouter();
  const from = query.from ?? "addis";
  const to = query.to ?? "hawassa";
  const day = query.date ?? todayISO(1);
  const pax = Number(query.pax ?? 1);
  const goStep = useFlowNav();
  const route = findRoute(from, to);
  const [cls, setCls] = useState<string[]>([]);
  const [win, setWin] = useState<string[]>([]);
  const [sort, setSort] = useState("time");

  const trips = useMemo(() => {
    if (!route) return [];
    let list = getTrips(route.id, day);
    if (cls.length) list = list.filter((x) => cls.includes(x.busClass));
    if (win.length)
      list = list.filter((x) => {
        const h = x.departure.getHours();
        const w = h < 12 ? "morning" : h < 18 ? "afternoon" : "night";
        return win.includes(w);
      });
    if (sort === "price") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "duration") list = [...list].sort((a, b) => +a.arrival - +a.departure - (+b.arrival - +b.departure));
    return list;
  }, [route, day, cls, win, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Shell step={1} onStep={goStep} back={() => goStep(0)} backLabel={t("booking.back.search")}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(24px,3.4vw,38px)] font-extrabold tracking-[-0.02em]">
            {tj(cityById(from).name)} <span className="text-biftu-red">→</span> {tj(cityById(to).name)}
          </h1>
          <p className="text-biftu-ink-soft mt-2 text-[14px] font-semibold">
            {date(day)} · {t("booking.results.subtitle", { count: trips.length })} · {pax} {t("booking.search.passengers")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/book/search", { from, to, date: day, pax })}>
          {t("common.search")}
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="border-biftu-border h-fit rounded-2xl border bg-white p-5">
          <h3 className="text-[14px] font-extrabold">{t("booking.results.filters")}</h3>
          <div className="mt-5">
            <div className="text-biftu-ink-soft text-[11px] font-bold uppercase">{t("booking.results.busClass")}</div>
            <div className="mt-3 space-y-2">
              {FLEET.map((f) => (
                <label key={f.id} className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
                  <input type="checkbox" checked={cls.includes(f.id)} onChange={() => toggle(cls, setCls, f.id)} className="accent-biftu-blue h-4 w-4" />
                  {tj(f.name)}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="text-biftu-ink-soft text-[11px] font-bold uppercase">{t("booking.results.departure")}</div>
            <div className="mt-3 space-y-2">
              {["morning", "afternoon", "night"].map((w) => (
                <label key={w} className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
                  <input type="checkbox" checked={win.includes(w)} onChange={() => toggle(win, setWin, w)} className="accent-biftu-blue h-4 w-4" />
                  {t(`booking.results.${w}`)}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="text-biftu-ink-soft text-[11px] font-bold uppercase">{t("booking.results.sort")}</div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={cn(inputCls, "mt-3")}>
              <option value="time">{t("booking.results.sortTime")}</option>
              <option value="price">{t("booking.results.sortPrice")}</option>
              <option value="duration">{t("booking.results.sortDuration")}</option>
            </select>
          </div>
        </aside>

        <div className="space-y-4">
          {trips.length === 0 && (
            <div className="border-biftu-border rounded-2xl border bg-white p-10 text-center text-[14px] font-semibold">
              {t("booking.results.empty")}
            </div>
          )}
          {trips.map((trip) => {
            const f = FLEET.find((x) => x.id === trip.busClass)!;
            const mins = Math.round((+trip.arrival - +trip.departure) / 60000);
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-biftu-border hover:shadow-card rounded-2xl border bg-white p-5 transition md:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="tnum text-[26px] leading-none font-extrabold">{time(trip.departure)}</div>
                      <div className="text-biftu-ink-soft mt-1 text-[12px] font-semibold">{tj(cityById(from).name)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-biftu-ink-soft tnum text-[11px] font-bold">
                        {Math.floor(mins / 60)}
                        {t("common.hoursShort")} {mins % 60}
                        {t("common.minutesShort")}
                      </div>
                      <div className="bg-biftu-border relative my-1.5 h-px w-24">
                        <span className="bg-biftu-red absolute -top-[3px] right-0 h-2 w-2 rounded-full" />
                      </div>
                      <Badge tone="blue">{tj(f.name)}</Badge>
                    </div>
                    <div>
                      <div className="tnum text-[26px] leading-none font-extrabold">{time(trip.arrival)}</div>
                      <div className="text-biftu-ink-soft mt-1 text-[12px] font-semibold">{tj(cityById(to).name)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      {trip.seatsLeft <= 5 && <Badge tone="red">{t("common.seatsLeft", { count: trip.seatsLeft })}</Badge>}
                      <div className="text-biftu-red tnum mt-1 text-[22px] font-extrabold">{money(trip.price)}</div>
                      <div className="text-biftu-ink-soft text-[11px] font-semibold">{t("common.perSeat")}</div>
                    </div>
                    <Button onClick={() => navigate(`/book/${trip.id}/seats`, { pax })}>{t("booking.results.selectSeats")}</Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

/* ---------- 3. SEATS ---------- */
export function BookSeats({ tripId }: { tripId: string }) {
  const { t, tj, money, time, date } = useI18n();
  const { navigate, query } = useRouter();
  const { draft, setDraft } = useStore();
  const trip = getTripById(tripId);
  const pax = Number(query.pax ?? 1);
  const goStep = useFlowNav(tripId);
  const [left, setLeft] = useState(600);

  useEffect(() => {
    setDraft((d) => ({ ...d, tripId, seats: d.tripId === tripId ? d.seats : [], holdUntil: Date.now() + 600000 }));
  }, [tripId, setDraft]);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((l) => Math.max(0, l - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!trip)
    return (
      <Shell step={2} onStep={goStep} back={() => goStep(1)} backLabel={t("booking.back.results")}>
        Trip not found
      </Shell>
    );
  const route = routeFor(trip.routeId);
  const fee = 35 * draft.seats.length;
  const total = trip.price * draft.seats.length + fee;

  const toggle = (s: string) =>
    setDraft((d) => ({ ...d, seats: d.seats.includes(s) ? d.seats.filter((x) => x !== s) : [...d.seats, s].slice(0, pax) }));

  return (
    <Shell step={2} onStep={goStep} back={() => goStep(1)} backLabel={t("booking.back.results")}>
      <SectionTitle title={t("booking.seats.title")} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="border-biftu-border rounded-[26px] border bg-white p-6">
          <SeatMap trip={trip} selected={draft.seats} onToggle={toggle} max={pax} />
        </div>

        <div className="h-fit lg:sticky lg:top-24">
          <div className="border-biftu-border shadow-card rounded-[26px] border bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[16px] font-extrabold">
                  {tj(cityById(route.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(route.to).name)}
                </div>
                <div className="text-biftu-ink-soft mt-1 text-[13px] font-semibold">
                  {date(trip.departure)} · <span className="tnum">{time(trip.departure)}</span>
                </div>
              </div>
              <Badge tone="blue">{tj(FLEET.find((f) => f.id === trip.busClass)!.name)}</Badge>
            </div>

            <div className="border-biftu-border mt-5 border-t pt-5">
              <div className="text-biftu-ink-soft text-[11px] font-bold uppercase">{t("booking.seats.selectedSeats")}</div>
              <div className="mt-3 flex min-h-[38px] flex-wrap gap-2">
                <AnimatePresence>
                  {draft.seats.length === 0 && <span className="text-biftu-ink-soft text-[13px]">{t("booking.seats.none")}</span>}
                  {draft.seats.map((s) => (
                    <motion.button
                      key={s}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => toggle(s)}
                      className="bg-biftu-red tnum flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-white"
                    >
                      {s} <span className="opacity-70">×</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <dl className="border-biftu-border mt-5 space-y-2 border-t pt-5 text-[13px]">
              <Line label={`${t("booking.seats.seatPrice")} × ${draft.seats.length}`} value={money(trip.price * draft.seats.length)} />
              <Line label={t("booking.seats.serviceFee")} value={money(fee)} />
              <div className="flex items-center justify-between pt-3">
                <span className="text-[13px] font-bold">{t("booking.seats.total")}</span>
                <span className="text-biftu-red tnum text-[22px] font-extrabold">{money(total)}</span>
              </div>
            </dl>

            <div
              className={cn(
                "mt-5 flex items-center justify-between rounded-xl px-4 py-3 text-[12px] font-bold",
                left < 120 ? "bg-biftu-red-tint text-biftu-red" : "bg-biftu-blue-tint text-biftu-blue",
              )}
            >
              <Icon name="clock" className="h-4 w-4" />
              <span className="tnum">
                {t("booking.seats.holdExpiry", {
                  minutes: String(Math.floor(left / 60)).padStart(2, "0"),
                  seconds: String(left % 60).padStart(2, "0"),
                })}
              </span>
            </div>

            <Button full className="mt-5" disabled={draft.seats.length === 0} onClick={() => navigate(`/book/${tripId}/passengers`, { pax })}>
              {t("booking.seats.continue")} <Icon name="arrow" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-biftu-ink-soft flex items-center justify-between font-semibold">
      <span>{label}</span>
      <span className="tnum text-biftu-ink font-bold">{value}</span>
    </div>
  );
}

/* ---------- 4. PASSENGERS ---------- */
export function BookPassengers({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const { navigate, query } = useRouter();
  const goStep = useFlowNav(tripId);
  const { draft, setDraft, savedPassengers } = useStore();
  const [rows, setRows] = useState<Passenger[]>(
    draft.seats.map((s) => ({ seat: s, fullName: "", phone: "", gender: "male", idNumber: "" })),
  );
  const [errors, setErrors] = useState<Record<number, string>>({});

  const update = (i: number, patch: Partial<Passenger>) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const submit = () => {
    const errs: Record<number, string> = {};
    rows.forEach((r, i) => {
      if (r.fullName.trim().length < 3) errs[i] = t("errors.minName");
      else if (!/^\+?[0-9\s]{9,}$/.test(r.phone)) errs[i] = t("errors.phone");
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setDraft((d) => ({ ...d, passengers: rows }));
    navigate(`/book/${tripId}/payment`, { pax: query.pax });
  };

  if (!draft.seats.length)
    return (
      <Shell step={3} onStep={goStep} back={() => goStep(2)} backLabel={t("booking.back.seats")}>
        <div className="border-biftu-border rounded-2xl border bg-white p-10 text-center">
          <p className="font-semibold">{t("booking.seats.none")}</p>
          <Button className="mt-4" onClick={() => navigate(`/book/${tripId}/seats`, { pax: query.pax })}>
            {t("booking.results.selectSeats")}
          </Button>
        </div>
      </Shell>
    );

  return (
    <Shell step={3} onStep={goStep} back={() => goStep(2)} backLabel={t("booking.back.seats")}>
      <SectionTitle title={t("booking.passengers.title")} subtitle={t("booking.passengers.subtitle")} />
      <div className="mt-8 space-y-4">
        {rows.map((r, i) => (
          <div key={r.seat} className="border-biftu-border rounded-[26px] border bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[15px] font-extrabold">{t("booking.passengers.forSeat", { seat: r.seat })}</h3>
              <select
                className="border-biftu-border rounded-lg border px-3 py-1.5 text-[12px] font-bold"
                onChange={(e) => {
                  const p = savedPassengers[Number(e.target.value)];
                  if (p) update(i, p);
                }}
                defaultValue=""
              >
                <option value="">{t("booking.passengers.saved")}</option>
                {savedPassengers.map((p, idx) => (
                  <option key={p.idNumber} value={idx}>
                    {p.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("booking.passengers.fullName")}</span>
                <input className={inputCls} value={r.fullName} onChange={(e) => update(i, { fullName: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("booking.passengers.phone")}</span>
                <input className={inputCls} value={r.phone} onChange={(e) => update(i, { phone: e.target.value })} placeholder="+251 9.." />
              </label>
              <label className="block">
                <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("booking.passengers.gender")}</span>
                <select className={inputCls} value={r.gender} onChange={(e) => update(i, { gender: e.target.value })}>
                  <option value="male">{t("booking.passengers.male")}</option>
                  <option value="female">{t("booking.passengers.female")}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-biftu-ink-soft mb-1.5 block text-[11px] font-bold uppercase">{t("booking.passengers.idNumber")}</span>
                <input className={inputCls} value={r.idNumber} onChange={(e) => update(i, { idNumber: e.target.value })} />
              </label>
            </div>
            {errors[i] && <p className="text-biftu-red mt-3 text-[12px] font-bold">{errors[i]}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => navigate(`/book/${tripId}/seats`, { pax: query.pax })}>
          {t("common.back")}
        </Button>
        <Button onClick={submit}>
          {t("booking.passengers.continue")} <Icon name="arrow" className="h-4 w-4" />
        </Button>
      </div>
    </Shell>
  );
}

/* ---------- 5. PAYMENT ---------- */
export function BookPayment({ tripId }: { tripId: string }) {
  const { t, tj, money, time, date, locale } = useI18n();
  const { navigate } = useRouter();
  const goStep = useFlowNav(tripId);
  const { draft, addBooking } = useStore();
  const trip = getTripById(tripId);
  const [settlement, setSettlement] = useState<"transfer" | "on_arrival">("transfer");
  const [proof, setProof] = useState<{ url: string; name: string; size: number } | null>(null);
  const [uploadErr, setUploadErr] = useState("");
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!trip)
    return (
      <Shell step={4} onStep={goStep} back={() => goStep(3)} backLabel={t("booking.back.passengers")}>
        Trip not found
      </Shell>
    );
  const route = routeFor(trip.routeId);
  const fee = 35 * draft.seats.length;
  const total = trip.price * draft.seats.length + fee;

  const readFile = (file?: File | null) => {
    if (!file) return;
    setUploadErr("");
    if (!/^image\//.test(file.type)) return setUploadErr(t("booking.payment.upload.errType"));
    if (file.size > 5 * 1024 * 1024) return setUploadErr(t("booking.payment.upload.errSize"));
    const reader = new FileReader();
    reader.onload = () => setProof({ url: String(reader.result), name: file.name, size: file.size });
    reader.readAsDataURL(file);
  };

  const pay = () => {
    if (settlement === "transfer" && !proof) return setErr(t("booking.payment.upload.required"));
    if (!terms) return setErr(t("errors.terms"));
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const ref = makeRef();
      addBooking({
        ref,
        tripId,
        routeId: trip.routeId,
        busClass: trip.busClass,
        departure: trip.departure.toISOString(),
        seats: draft.seats,
        passengers: draft.passengers,
        total,
        locale,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        method: settlement === "transfer" ? "bank_transfer" : "on_arrival",
        settlement,
        proof: settlement === "transfer" ? proof?.url : undefined,
        proofName: settlement === "transfer" ? proof?.name : undefined,
        payStatus: settlement === "transfer" ? "pending_review" : "due_on_arrival",
      });
      navigate(`/book/${tripId}/confirmation`, { ref });
    }, 1400);
  };

  const gateways = [
    { id: "telebirr", label: t("booking.payment.telebirr"), hint: "USSD / app" },
    { id: "chapa", label: t("booking.payment.chapa"), hint: "Card & wallets" },
    { id: "cbe", label: t("booking.payment.cbe"), hint: "CBE Birr" },
    { id: "card", label: t("booking.payment.card"), hint: "Visa / Mastercard" },
  ];

  return (
    <Shell step={4} onStep={goStep} back={() => goStep(3)} backLabel={t("booking.back.passengers")}>
      <SectionTitle title={t("booking.payment.title")} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          {/* --- gateways: disabled, coming soon --- */}
          <div className="border-biftu-border rounded-[26px] border bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[14px] font-extrabold">{t("booking.payment.method")}</h3>
              <span className="bg-biftu-paper text-biftu-ink-soft rounded-full px-2.5 py-1 text-[10.5px] font-extrabold tracking-wider uppercase">
                {t("booking.payment.comingSoon")}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {gateways.map((m) => (
                <div
                  key={m.id}
                  aria-disabled="true"
                  title={t("booking.payment.comingSoon")}
                  className="border-biftu-border bg-biftu-paper/70 relative cursor-not-allowed rounded-2xl border p-4 select-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-biftu-ink-soft text-[14px] font-extrabold">{m.label}</span>
                    <span className="bg-biftu-border/60 h-4 w-4 rounded-full" />
                  </div>
                  <div className="text-biftu-ink-soft/70 mt-1 text-[12px] font-semibold">{m.hint}</div>
                  <span className="bg-biftu-ink/80 absolute top-3 right-3 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-white uppercase">
                    {t("booking.payment.soon")}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-biftu-ink-soft mt-4 text-[12px] leading-relaxed">{t("booking.payment.gatewayNote")}</p>
          </div>

          {/* --- available today: transfer proof or pay on arrival --- */}
          <div className="border-biftu-border rounded-[26px] border bg-white p-6">
            <h3 className="text-[14px] font-extrabold">{t("booking.payment.available")}</h3>
            <p className="text-biftu-ink-soft mt-1 text-[12.5px]">{t("booking.payment.availableHint")}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                { id: "transfer", icon: "download", title: t("booking.payment.transfer.title"), hint: t("booking.payment.transfer.hint") },
                { id: "on_arrival", icon: "phone", title: t("booking.payment.onArrival.title"), hint: t("booking.payment.onArrival.hint") },
              ] as const).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSettlement(o.id);
                    setErr("");
                  }}
                  aria-pressed={settlement === o.id}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    settlement === o.id ? "border-biftu-blue bg-biftu-blue-tint shadow-card" : "border-biftu-border hover:border-biftu-blue",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", settlement === o.id ? "bg-biftu-blue text-white" : "bg-biftu-paper text-biftu-blue")}>
                      <Icon name={o.icon} className="h-4 w-4" />
                    </span>
                    <span className={cn("mt-1 h-4 w-4 shrink-0 rounded-full border-2", settlement === o.id ? "border-biftu-blue bg-biftu-blue" : "border-biftu-border")} />
                  </div>
                  <div className="mt-3 text-[14px] font-extrabold">{o.title}</div>
                  <div className="text-biftu-ink-soft mt-1 text-[12px] leading-snug font-semibold">{o.hint}</div>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {settlement === "transfer" ? (
                <motion.div
                  key="transfer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="bg-biftu-paper mt-4 rounded-2xl p-4">
                    <div className="text-biftu-ink-soft text-[10.5px] font-bold tracking-wider uppercase">{t("booking.payment.transfer.accounts")}</div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {[
                        { bank: "CBE", acc: "1000 2345 6789", name: "Biftu Luxury Bus S.C." },
                        { bank: "Telebirr", acc: "8477", name: "Biftu Merchant" },
                      ].map((b) => (
                        <div key={b.bank} className="border-biftu-border rounded-xl border bg-white p-3">
                          <div className="text-biftu-blue text-[11px] font-extrabold uppercase">{b.bank}</div>
                          <div className="tnum text-biftu-ink mt-0.5 text-[14px] font-extrabold">{b.acc}</div>
                          <div className="text-biftu-ink-soft text-[11px] font-semibold">{b.name}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-biftu-ink-soft mt-2 text-[11.5px] font-semibold">
                      {t("booking.payment.transfer.amount")} <span className="text-biftu-red tnum font-extrabold">{money(total)}</span>
                    </div>
                  </div>

                  {/* uploader */}
                  <div className="mt-4">
                    <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">{t("booking.payment.upload.label")}</div>
                    {!proof ? (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          readFile(e.dataTransfer.files?.[0]);
                        }}
                        onClick={() => fileRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
                        className="border-biftu-border hover:border-biftu-blue hover:bg-biftu-blue-tint/40 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition"
                      >
                        <span className="bg-biftu-blue-tint text-biftu-blue grid h-12 w-12 place-items-center rounded-2xl">
                          <Icon name="download" className="h-5 w-5 rotate-180" />
                        </span>
                        <p className="text-biftu-ink mt-3 text-[13.5px] font-extrabold">{t("booking.payment.upload.cta")}</p>
                        <p className="text-biftu-ink-soft mt-1 text-[11.5px]">{t("booking.payment.upload.formats")}</p>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-biftu-border flex gap-3 rounded-2xl border p-3">
                        <img src={proof.url} alt={t("booking.payment.upload.label")} className="border-biftu-border h-24 w-24 shrink-0 rounded-xl border object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] font-black text-white">✓</span>
                            <span className="text-[12.5px] font-extrabold text-emerald-600">{t("booking.payment.upload.ready")}</span>
                          </div>
                          <div className="text-biftu-ink mt-1 truncate text-[12.5px] font-bold">{proof.name}</div>
                          <div className="text-biftu-ink-soft tnum text-[11px]">{(proof.size / 1024).toFixed(0)} KB</div>
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => fileRef.current?.click()} className="text-biftu-blue hover:bg-biftu-blue-tint rounded-lg px-2 py-1 text-[11.5px] font-extrabold transition">
                              {t("booking.payment.upload.replace")}
                            </button>
                            <button onClick={() => setProof(null)} className="text-biftu-red hover:bg-biftu-red-tint rounded-lg px-2 py-1 text-[11.5px] font-extrabold transition">
                              {t("common.delete")}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => readFile(e.target.files?.[0])}
                    />
                    {uploadErr && <p className="text-biftu-red mt-2 text-[12px] font-bold">{uploadErr}</p>}
                    <p className="text-biftu-ink-soft mt-2 text-[11.5px] leading-relaxed">{t("booking.payment.upload.note")}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="arrival"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="border-biftu-border mt-4 rounded-2xl border bg-amber-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-white">
                        <Icon name="clock" className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-[13px] font-extrabold text-amber-900">{t("booking.payment.onArrival.holdTitle")}</div>
                        <p className="mt-1 text-[12px] leading-relaxed text-amber-900/80">{t("booking.payment.onArrival.holdBody")}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-[13px] font-semibold">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="accent-biftu-blue mt-0.5 h-4 w-4" />
              {t("booking.payment.terms")}
            </label>
            {err && <p className="text-biftu-red mt-2 text-[12px] font-bold">{err}</p>}
            <p className="text-biftu-ink-soft mt-3 text-[12px]">{t("booking.payment.secure")}</p>
          </div>
        </div>

        <div className="h-fit lg:sticky lg:top-24">
          <div className="border-biftu-border shadow-card rounded-[26px] border bg-white p-6">
            <h3 className="text-[14px] font-extrabold">{t("booking.payment.summary")}</h3>
            <div className="mt-4 text-[14px] font-extrabold">
              {tj(cityById(route.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(route.to).name)}
            </div>
            <div className="text-biftu-ink-soft mt-1 text-[13px] font-semibold">
              {date(trip.departure)} · <span className="tnum">{time(trip.departure)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.seats.map((s) => (
                <span key={s} className="bg-biftu-blue-tint text-biftu-blue tnum rounded-full px-2.5 py-1 text-[12px] font-bold">
                  {s}
                </span>
              ))}
            </div>
            <dl className="border-biftu-border mt-5 space-y-2 border-t pt-5">
              <Line label={`${t("booking.seats.seatPrice")} × ${draft.seats.length}`} value={money(trip.price * draft.seats.length)} />
              <Line label={t("booking.seats.serviceFee")} value={money(fee)} />
            </dl>
            <div className="border-biftu-border mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-[13px] font-bold">{t("booking.seats.total")}</span>
              <span className="text-biftu-red tnum text-[24px] font-extrabold">{money(total)}</span>
            </div>

            <div
              className={cn(
                "mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11.5px] font-bold",
                settlement === "transfer" ? "bg-biftu-blue-tint text-biftu-blue" : "bg-amber-50 text-amber-800",
              )}
            >
              <Icon name={settlement === "transfer" ? "download" : "clock"} className="h-4 w-4 shrink-0" />
              {settlement === "transfer" ? t("booking.payment.badge.review") : t("booking.payment.badge.arrival")}
            </div>

            <Button full className="mt-4" onClick={pay} disabled={loading}>
              {loading
                ? t("common.loading")
                : settlement === "transfer"
                  ? t("booking.payment.submitProof")
                  : t("booking.payment.reserveSeat")}
            </Button>
            <button
              type="button"
              onClick={() => goStep(3)}
              disabled={loading}
              className="text-biftu-ink-soft hover:text-biftu-blue mt-3 flex w-full items-center justify-center gap-1.5 py-1 text-[12.5px] font-bold transition disabled:opacity-40"
            >
              <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
              {t("booking.back.passengers")}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------- 6. CONFIRMATION ---------- */
export function BookConfirmation({ tripId }: { tripId: string }) {
  const { t, tj, money, time, date } = useI18n();
  const { navigate, query } = useRouter();
  const { bookings } = useStore();
  const booking = bookings.find((b) => b.ref === query.ref) ?? bookings[0];
  const trip = getTripById(tripId);
  const [viewer, setViewer] = useState<string | null>(null);

  const route = routeFor(booking?.routeId ?? "");

  if (!booking || !trip)
    return (
      <Shell step={5}>
        <Button onClick={() => navigate("/book/search")}>{t("nav.bookNow")}</Button>
      </Shell>
    );

  return (
    <Shell step={5}>
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white"
        >
          <Icon name="check" className="h-9 w-9" />
        </motion.div>
        <h1 className="font-display mt-6 text-[clamp(26px,4vw,44px)] font-extrabold tracking-[-0.02em]">{t("booking.confirm.title")}</h1>
        <p className="text-biftu-ink-soft mt-3 text-[15px]">{t("booking.confirm.subtitle")}</p>
      </div>

      <div className="border-biftu-border shadow-card mx-auto mt-10 max-w-3xl overflow-hidden rounded-[26px] border bg-white">
        <div className="bg-biftu-blue-dark relative flex items-center justify-between p-6 text-white">
          <div className="stripe-motif absolute inset-y-0 right-0 w-1/4 opacity-20" />
          <div className="relative z-10">
            <div className="text-[11px] tracking-wider text-white/60 uppercase">{t("booking.confirm.reference")}</div>
            <div className="font-display tnum text-[28px] font-extrabold">{booking.ref}</div>
          </div>
          <Badge tone="red">{tj(FLEET.find((f) => f.id === booking.busClass)!.name)}</Badge>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-[18px] font-extrabold">
              {tj(cityById(route.from).name)} <span className="text-biftu-red">→</span> {tj(cityById(route.to).name)}
            </div>
            <div className="text-biftu-ink-soft mt-1 text-[14px] font-semibold">
              {date(trip.departure)} · <span className="tnum">{time(trip.departure)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] font-bold">{t("booking.seats.total")}</span>
              <span className="text-biftu-red tnum text-[22px] font-extrabold">{money(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* one unique, signed boarding pass per passenger */}
        <div className="border-biftu-border border-t p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[14px] font-extrabold">
              {t("booking.confirm.pass")}
              <span className="text-biftu-ink-soft ml-2 text-[12px] font-semibold">{t("booking.confirm.tapToOpen")}</span>
            </h3>
            <span className="bg-biftu-blue-tint text-biftu-blue flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold">
              <Icon name="shield" className="h-3.5 w-3.5" /> {t("booking.confirm.signed")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {booking.passengers.map((p) => (
              <BoardingPass key={p.seat} booking={booking} seat={p.seat} compact onOpen={() => setViewer(p.seat)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3 print:hidden">
        <Button onClick={() => window.print()}>
          <Icon name="download" className="h-4 w-4" /> {t("booking.confirm.download")}
        </Button>
        <Button variant="outline" onClick={() => navigate("/account", { tab: "tickets" })}>
          {t("booking.confirm.dashboard")}
        </Button>
      </div>

      <div className="border-biftu-border shadow-card mx-auto mt-6 grid max-w-3xl gap-4 rounded-[26px] border bg-white p-6 sm:grid-cols-3">
        <Mini label={t("booking.confirm.gate")} value="Board 15 min early" />
        <Mini label={t("track.crew.driver")} value={trip.driver} />
        <Mini
          label={t("booking.payment.method")}
          value={booking.settlement === "on_arrival" ? t("booking.payment.onArrival.title") : t("booking.payment.transfer.title")}
        />
      </div>

      {/* settlement status */}
      <div
        className={cn(
          "mx-auto mt-4 flex max-w-3xl flex-wrap items-center gap-3 rounded-[22px] border p-5",
          booking.payStatus === "due_on_arrival" ? "border-amber-200 bg-amber-50" : "border-biftu-blue/20 bg-biftu-blue-tint",
        )}
      >
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white",
            booking.payStatus === "due_on_arrival" ? "bg-amber-400" : "bg-biftu-blue",
          )}
        >
          <Icon name={booking.payStatus === "due_on_arrival" ? "clock" : "shield"} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className={cn("text-[13.5px] font-extrabold", booking.payStatus === "due_on_arrival" ? "text-amber-900" : "text-biftu-blue")}>
            {booking.payStatus === "due_on_arrival" ? t("booking.payment.badge.arrival") : t("booking.payment.badge.review")}
          </div>
          <p className={cn("mt-0.5 text-[12px] leading-snug", booking.payStatus === "due_on_arrival" ? "text-amber-900/75" : "text-biftu-ink-soft")}>
            {booking.payStatus === "due_on_arrival" ? t("booking.payment.onArrival.holdBody") : t("booking.payment.upload.note")}
          </p>
        </div>
        {booking.proof && (
          <img src={booking.proof} alt={t("booking.payment.upload.label")} className="border-biftu-border h-16 w-16 shrink-0 rounded-xl border object-cover" />
        )}
      </div>

      <AnimatePresence>
        {viewer && <TicketViewer booking={booking} initialSeat={viewer} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </Shell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-biftu-paper rounded-2xl p-4">
      <div className="text-biftu-ink-soft text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div className="mt-1 text-[15px] font-extrabold">{value}</div>
    </div>
  );
}

export type { Trip };
