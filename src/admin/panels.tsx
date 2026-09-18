import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  BarChart3,
  Bus,
  CalendarClock,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Copy,
  Download,
  Eye,
  Filter,
  Fuel,
  MapPin,
  Pencil,
  Percent,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/hooks";
import { useStore, type AdminBus, type AdminRoute, type Booking } from "@/lib/store";
import { useToast } from "@/lib/toast";
import {
  ACTIVITY,
  CITIES,
  CREW,
  FLEET,
  HEATMAP,
  HEATMAP_DAYS,
  HEATMAP_ROUTES,
  HOURLY_DEMAND,
  LIVE_FLEET,
  OCCUPANCY,
  OFFICES,
  REVENUE_TREND,
  STAFF,
  TOP_ROUTES,
  cityById,
  getTrips,
  routeFor,
  todayISO,
} from "@/lib/data";
import { BoardingPass, CameraScanner, TicketViewer, PassengerQRSlot, useTicketLookup } from "@/components/Ticket";
import { Button, Icon, inputCls } from "@/components/ui";
import { cn } from "@/utils/cn";

export const EASE = [0.16, 1, 0.3, 1] as const;

type IconT = typeof TrendingUp;

/** Recharts tooltip formatter helper (keeps locale-aware money out of the chart config). */
const tip =
  (label: string, fn: (n: number) => string | number) =>
  (value: unknown): [string | number, string] =>
    [fn(Number(value)), label];

/* ============================ primitives ============================ */
export function Panel({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn("border-biftu-border shadow-card rounded-[22px] border bg-white", pad && "p-5 md:p-6", className)}>{children}</section>
  );
}

export function PanelHead({ title, hint, icon: Ic, right }: { title: string; hint?: string; icon?: IconT; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Ic && (
          <span className="bg-biftu-blue-tint text-biftu-blue grid h-9 w-9 shrink-0 place-items-center rounded-xl">
            <Ic className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h3 className="font-display text-biftu-ink text-[16px] leading-tight font-extrabold tracking-[-0.01em]">{title}</h3>
          {hint && <p className="text-biftu-ink-soft mt-1 text-[12.5px] leading-snug">{hint}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Chip({ children, active, onClick, tone }: { children: ReactNode; active?: boolean; onClick?: () => void; tone?: "red" | "blue" | "green" | "gray" }) {
  const cls =
    tone === "red"
      ? "bg-biftu-red-tint text-biftu-red"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "blue"
          ? "bg-biftu-blue-tint text-biftu-blue"
          : active
            ? "bg-biftu-blue text-white"
            : "border-biftu-border text-biftu-ink-soft hover:border-biftu-blue hover:text-biftu-blue";
  const Comp = onClick ? "button" : "span";
  return (
    <Comp onClick={onClick} className={cn("rounded-full px-3 py-1.5 text-[11.5px] font-bold whitespace-nowrap transition", onClick && !active && "border", cls)}>
      {children}
    </Comp>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200", on ? "bg-biftu-blue" : "bg-biftu-border")}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow", on ? "right-0.5" : "left-0.5")} />
    </button>
  );
}

function Stat({ label, value, sub, tone = "blue" }: { label: string; value: string; sub?: string; tone?: "blue" | "red" | "green" }) {
  const color = tone === "red" ? "text-biftu-red" : tone === "green" ? "text-emerald-600" : "text-biftu-blue";
  return (
    <div className="bg-biftu-paper rounded-xl p-3">
      <div className="text-biftu-ink-soft text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div className={cn("tnum mt-1 text-[18px] leading-none font-extrabold", color)}>{value}</div>
      {sub && <div className="text-biftu-ink-soft mt-1 text-[10.5px] font-semibold">{sub}</div>}
    </div>
  );
}

function Spark({ data, color = "#1B4F9C" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26 - 2}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-9 w-full">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,30 ${pts} 100,30`} fill={color} opacity="0.1" />
    </svg>
  );
}

function Field({ label, children, span }: { label: string; children: ReactNode; span?: boolean }) {
  return (
    <label className={cn("block", span && "sm:col-span-2")}>
      <span className="text-biftu-ink-soft mb-1.5 block text-[10.5px] font-bold tracking-wider uppercase">{label}</span>
      {children}
    </label>
  );
}

function Empty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="border-biftu-border grid place-items-center rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="bg-biftu-paper text-biftu-ink-soft mb-3 grid h-12 w-12 place-items-center rounded-2xl">
        <Search className="h-5 w-5" />
      </span>
      <p className="text-biftu-ink-soft max-w-sm text-[13.5px] font-semibold">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ============================ 1. Overview ============================ */
export function OverviewPanel({ onJump }: { onJump: (t: string) => void }) {
  const { t, money } = useI18n();
  const { bookings, adminBuses, adminRoutes } = useStore();
  const [range, setRange] = useState<"7" | "14" | "30">("30");

  const data = REVENUE_TREND.slice(-Number(range));
  const revenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);
  const seatsSold = bookings.reduce((s, b) => s + b.seats.length, 0);


  const kpis = [
    { k: t("admin.kpi.revenue"), v: money(revenue || 14820000), d: 12.4, spark: data.map((x) => x.revenue), act: "reports" },
    { k: t("admin.kpi.bookings"), v: String(bookings.length || 10214), d: 8.1, spark: data.map((x) => x.bookings), act: "bookings" },
    { k: t("admin.kpi.occupancy"), v: "87%", d: 3.2, spark: OCCUPANCY.map((o) => o.value), act: "fleet" },
    { k: t("admin.kpi.active"), v: `${LIVE_FLEET.length}/${adminBuses.length || 48}`, d: -1.4, spark: HOURLY_DEMAND.filter((_, i) => i % 3 === 0).map((h) => h.seats), act: "live" },
  ];

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.button
            key={k.k}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
            whileHover={{ y: -4 }}
            onClick={() => onJump(k.act)}
            className="border-biftu-border shadow-card hover:shadow-card-hover group relative overflow-hidden rounded-[20px] border bg-white p-5 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-biftu-ink-soft text-[10.5px] font-bold tracking-wider uppercase">{k.k}</span>
              <span className={cn("flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold", k.d >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-biftu-red-tint text-biftu-red")}>
                {k.d >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(k.d)}%
              </span>
            </div>
            <div className="font-display tnum text-biftu-ink mt-2 text-[clamp(22px,2.4vw,30px)] leading-none font-extrabold tracking-[-0.02em]">{k.v}</div>
            <Spark data={k.spark} color={i === 3 ? "#D71A21" : "#1B4F9C"} />
            <span className="text-biftu-blue absolute right-4 bottom-3 flex items-center gap-1 text-[10.5px] font-extrabold opacity-0 transition group-hover:opacity-100">
              open <ChevronRight className="h-3 w-3" />
            </span>
          </motion.button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel>
          <PanelHead
            title={t("admin.charts.revenue")}
            hint={t("admin.overview.revHint")}
            icon={TrendingUp}
            right={
              <div className="bg-biftu-paper flex gap-1 rounded-full p-1">
                {(["7", "14", "30"] as const).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className={cn("relative rounded-full px-3 py-1.5 text-[11.5px] font-bold", range === r ? "text-white" : "text-biftu-ink-soft")}>
                    {range === r && <motion.span layoutId="range-pill" className="bg-biftu-blue absolute inset-0 rounded-full" />}
                    <span className="relative z-10">{t("admin.overview.days", { n: r })}</span>
                  </button>
                ))}
              </div>
            }
          />
          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="adm-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B4F9C" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#1B4F9C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} interval={Math.floor(data.length / 6)} stroke="#E5E7EB" />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} stroke="#E5E7EB" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={42} />
                <Tooltip
                  contentStyle={{ borderRadius: 14, border: "1px solid #E5E7EB", fontSize: 12, boxShadow: "0 8px 30px rgba(14,47,99,.12)" }}
                  formatter={tip("Revenue", (v) => money(v))}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1B4F9C" strokeWidth={2.6} fill="url(#adm-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* live strip */}
        <Panel>
          <PanelHead title={t("admin.overview.live")} hint={t("admin.overview.liveHint")} icon={CircleDot} right={<Chip tone="green"><span className="bg-emerald-500 mr-1 inline-block h-1.5 w-1.5 rounded-full" />{LIVE_FLEET.length} on road</Chip>} />
          <div className="space-y-2.5">
            {LIVE_FLEET.slice(0, 4).map((b, i) => {
              const r = routeFor(b.routeId);
              return (
                <motion.div key={b.call} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="border-biftu-border hover:border-biftu-blue rounded-xl border p-3 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[12.5px] font-extrabold">
                      <span className={cn("h-2 w-2 rounded-full", b.status === "delayed" ? "bg-biftu-red" : b.status === "boarding" ? "bg-amber-400" : "bg-emerald-500", b.status === "enroute" && "pulse-dot")} />
                      {b.call}
                    </span>
                    <span className="text-biftu-ink-soft tnum text-[11px] font-bold">
                      {b.speed} km/h
                    </span>
                  </div>
                  <div className="text-biftu-ink-soft mt-1 text-[11px] font-semibold">
                    {r ? `${cityById(r.from).name.en} → ${cityById(r.to).name.en}` : b.routeId} · {b.driver}
                  </div>
                  <div className="bg-biftu-paper mt-2 h-1.5 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.progress * 100}%` }}
                      transition={{ duration: 1, ease: EASE }}
                      className={cn("h-full rounded-full", b.status === "delayed" ? "bg-biftu-red" : "bg-biftu-blue")}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          <button onClick={() => onJump("live")} className="text-biftu-blue hover:bg-biftu-blue-tint mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-extrabold transition">
            {t("admin.overview.allVehicles")} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHead title={t("admin.overview.heatmap")} hint={t("admin.overview.heatmapHint")} icon={Percent} />
          <Heatmap />
        </Panel>
        <Panel>
          <PanelHead title={t("admin.overview.feed")} icon={RefreshCw} />
          <div className="scroll-thin -mr-1 max-h-[268px] space-y-2.5 overflow-y-auto pr-1">
            {ACTIVITY.map((a, i) => (
              <motion.div key={a.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-2.5">
                <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg", feedTone(a.kind))}>
                  {feedIcon(a.kind)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-biftu-ink text-[12px] leading-snug font-bold">{a.text}</p>
                  <p className="text-biftu-ink-soft tnum mt-0.5 text-[10.5px] font-semibold">
                    {a.meta} · {a.at}m ago
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel>
          <PanelHead title={t("admin.charts.topRoutes")} icon={Bus} right={<Chip onClick={() => onJump("routes")}>{t("admin.overview.manage")}</Chip>} />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_ROUTES} layout="vertical" margin={{ left: 46 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} stroke="#E5E7EB" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#4B5563" }} width={132} stroke="#E5E7EB" />
                <Tooltip contentStyle={{ borderRadius: 14, fontSize: 12, border: "1px solid #E5E7EB" }} formatter={tip("Revenue", (v) => money(v))} />
                <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={16}>
                  {TOP_ROUTES.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#1B4F9C" : i === 1 ? "#D71A21" : "#8FB2E0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <PanelHead title={t("admin.charts.occupancy")} icon={Users} />
          <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
            <div className="relative h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={OCCUPANCY} dataKey="value" nameKey="cls" innerRadius={48} outerRadius={72} paddingAngle={3} startAngle={90} endAngle={-270}>
                    {OCCUPANCY.map((_, i) => (
                      <Cell key={i} fill={["#1B4F9C", "#D71A21", "#8FB2E0"][i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="tnum text-biftu-ink text-[19px] leading-none font-extrabold">87%</div>
                  <div className="text-biftu-ink-soft text-[9.5px] font-bold uppercase">avg</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {OCCUPANCY.map((o) => (
                <div key={o.cls} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ["#1B4F9C", "#D71A21", "#8FB2E0"][OCCUPANCY.indexOf(o)] }} />
                  <span className="text-biftu-ink flex-1 text-[12.5px] font-bold">{o.cls}</span>
                  <span className="tnum text-biftu-ink-soft text-[12px] font-extrabold">{o.value}%</span>
                </div>
              ))}
              <div className="border-biftu-border mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                <Stat label="buses" value={String(adminBuses.length)} />
                <Stat label="routes" value={String(adminRoutes.length)} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHead title={t("admin.overview.seatDemand")} hint={t("admin.overview.seatDemandHint")} icon={Clock} right={<Chip tone="blue">{seatsSold} seats sold</Chip>} />
        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HOURLY_DEMAND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9CA3AF" }} interval={2} stroke="#E5E7EB" />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} stroke="#E5E7EB" width={36} />
              <Tooltip contentStyle={{ borderRadius: 14, fontSize: 12, border: "1px solid #E5E7EB" }} />
              <Line type="monotone" dataKey="seats" stroke="#D71A21" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="revenue" stroke="#1B4F9C" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

function feedTone(kind: string) {
  if (kind === "refund") return "bg-biftu-red-tint text-biftu-red";
  if (kind === "delay") return "bg-amber-50 text-amber-600";
  if (kind === "checkin") return "bg-emerald-50 text-emerald-600";
  if (kind === "payout") return "bg-biftu-blue-tint text-biftu-blue";
  return "bg-biftu-paper text-biftu-ink-soft";
}
function feedIcon(kind: string) {
  const c = "h-3.5 w-3.5";
  if (kind === "refund") return <RotateCcw className={c} />;
  if (kind === "delay") return <Wrench className={c} />;
  if (kind === "checkin") return <Check className={c} />;
  if (kind === "booking") return <Ticket className={c} />;
  if (kind === "payout") return <Download className={c} />;
  return <Pencil className={c} />;
}

function Heatmap() {
  const { t } = useI18n();
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  return (
    <div>
      <div className="scroll-thin overflow-x-auto pb-1">
        <div className="min-w-[520px]">
          <div className="mb-2 grid grid-cols-[128px_repeat(7,1fr)] gap-1.5">
            <span className="text-biftu-ink-soft text-[10px] font-bold">{t("admin.overview.route")}</span>
            {HEATMAP_DAYS.map((d) => (
              <span key={d} className="text-biftu-ink-soft text-center text-[10px] font-bold uppercase">
                {d}
              </span>
            ))}
          </div>
          {HEATMAP.map((row, ri) => (
            <div key={HEATMAP_ROUTES[ri]} className="mb-1.5 grid grid-cols-[128px_repeat(7,1fr)] items-center gap-1.5">
              <span className="text-biftu-ink truncate text-[11.5px] font-bold">{HEATMAP_ROUTES[ri]}</span>
              {row.map((v, ci) => {
                const on = hover && hover.r === ri && hover.c === ci;
                return (
                  <button
                    key={ci}
                    onMouseEnter={() => setHover({ r: ri, c: ci })}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover({ r: ri, c: ci })}
                    className={cn("tnum grid h-8 place-items-center rounded-md text-[10.5px] font-extrabold text-white transition", on && "ring-2 ring-biftu-blue ring-offset-1")}
                    style={{ background: `rgba(27,79,156,${0.14 + (v / 100) * 0.86})`, color: v > 62 ? "#fff" : "#4B5563" }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="text-biftu-ink-soft mt-3 flex items-center justify-between text-[10.5px] font-bold">
        <span>{hover ? `${HEATMAP_ROUTES[hover.r]} · ${HEATMAP_DAYS[hover.c]} · ${HEATMAP[hover.r][hover.c]}% full` : t("admin.overview.heatLegend")}</span>
        <span className="flex items-center gap-1.5">
          0%
          <span className="flex gap-0.5">
            {[0.15, 0.35, 0.55, 0.75, 1].map((o) => (
              <span key={o} className="h-3 w-5 rounded-sm" style={{ background: `rgba(27,79,156,${o})` }} />
            ))}
          </span>
          100%
        </span>
      </div>
    </div>
  );
}

/* ============================ 2. Live board ============================ */
export function LivePanel() {
  const { t } = useI18n();
  const [sel, setSel] = useState(LIVE_FLEET[0].call);
  const bus = LIVE_FLEET.find((b) => b.call === sel)!;
  const route = routeFor(bus.routeId);

  const lats = CITIES.map((c) => c.lat);
  const lngs = CITIES.map((c) => c.lng);
  const minLat = Math.min(...lats) - 0.6,
    maxLat = Math.max(...lats) + 0.6,
    minLng = Math.min(...lngs) - 0.6,
    maxLng = Math.max(...lngs) + 0.6;
  const px = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
  const py = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * 100;
  const a = cityById(route?.from ?? "addis");
  const b2 = cityById(route?.to ?? "hawassa");
  const bx = px(a.lng) + (px(b2.lng) - px(a.lng)) * bus.progress;
  const by = py(a.lat) + (py(b2.lat) - py(a.lat)) * bus.progress;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Panel className="overflow-hidden">
        <PanelHead
          title={t("admin.live.map")}
          hint={t("admin.live.mapHint")}
          icon={MapPin}
          right={<Chip tone="green"><span className="bg-emerald-500 mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full" />GPS · 12s</Chip>}
        />
        <div className="from-biftu-blue-dark to-biftu-blue relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br">
          <div className="grid-lines absolute inset-0 opacity-40" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {LIVE_FLEET.map((lb) => {
              const r = routeFor(lb.routeId);
              if (!r) return null;
              const from = cityById(r.from);
              const to = cityById(r.to);
              return (
                <line
                  key={lb.call}
                  x1={px(from.lng)}
                  y1={py(from.lat)}
                  x2={px(to.lng)}
                  y2={py(to.lat)}
                  stroke={lb.call === sel ? "#D71A21" : "rgba(255,255,255,0.22)"}
                  strokeWidth={lb.call === sel ? 0.8 : 0.4}
                />
              );
            })}
          </svg>
          {CITIES.map((c) => (
            <span key={c.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${px(c.lng)}%`, top: `${py(c.lat)}%` }}>
              <span className="bg-white/90 block h-1.5 w-1.5 rounded-full" />
              <span className="mt-0.5 block text-[8.5px] font-bold whitespace-nowrap text-white/65">{c.name.en}</span>
            </span>
          ))}
          <motion.span
            animate={{ left: `${bx}%`, top: `${by}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="bg-biftu-red grid h-8 w-8 place-items-center rounded-xl text-white shadow-lg ring-4 ring-biftu-red/25">
              <Bus className="h-4 w-4" />
            </span>
          </motion.span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <Stat label="progress" value={`${Math.round(bus.progress * 100)}%`} />
          <Stat label="speed" value={`${bus.speed} km/h`} tone={bus.speed === 0 ? "red" : "blue"} />
          <Stat label="occupancy" value={`${Math.round(bus.occupancy * 100)}%`} tone={bus.occupancy > 0.9 ? "red" : "green"} />
          <Stat label="fuel" value="62%" sub="48 L/h nominal" />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelHead title={t("admin.live.vehicles")} icon={Bus} right={<Chip>{LIVE_FLEET.length}</Chip>} />
          <div className="scroll-thin -mr-1 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {LIVE_FLEET.map((lb) => (
              <button
                key={lb.call}
                onClick={() => setSel(lb.call)}
                className={cn("w-full rounded-xl border p-3 text-left transition", sel === lb.call ? "border-biftu-blue bg-biftu-blue-tint" : "border-biftu-border hover:border-biftu-blue/40")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-extrabold">{lb.call}</span>
                  <Chip tone={lb.status === "delayed" ? "red" : lb.status === "boarding" ? "gray" : "green"}>{lb.status}</Chip>
                </div>
                <div className="text-biftu-ink-soft mt-1 flex items-center gap-2 text-[11px] font-semibold">
                  <Fuel className="h-3 w-3" /> {lb.driver} · {lb.occupancy > 0.95 ? "sold out" : `${Math.round(lb.occupancy * 100)}%`}
                </div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHead title={t("admin.live.crew")} icon={ShieldCheck} hint="Licence + fatigue telemetry" />
          <div className="space-y-2">
            {CREW.map((d) => (
              <div key={d.id} className="border-biftu-border flex items-center gap-3 rounded-xl border p-2.5">
                <span className="bg-biftu-blue tnum grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold text-white">{d.name.split(" ").map((x) => x[0]).join("")}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-extrabold">{d.name}</div>
                  <div className="text-biftu-ink-soft tnum text-[10.5px] font-semibold">
                    {d.license} · {d.trips} trips
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500">
                  <Star className="h-3 w-3 fill-current" /> {d.rating}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================ 3. Scan & verify ============================ */
export function VerifyPanel() {
  const { t, tj, money, time, date } = useI18n();
  const { bookings, updateBooking, profile } = useStore();
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [cam, setCam] = useState(false);
  const [viewer, setViewer] = useState<{ booking: Booking; seat: string } | null>(null);

  const result = useTicketLookup(submitted, bookings);
  const route = result.kind === "ok" ? routeFor(result.booking.routeId) : null;

  const run = (v: string) => {
    setRaw(v);
    setSubmitted(v);
    setCam(false);
    if (!v.trim()) return;
    const parsed = parse(v);
    if (parsed) toast({ title: "Ticket decoded", body: `${parsed.ref} · seat ${parsed.seat}`, tone: "info" });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <PanelHead title={t("admin.verify.title")} hint={t("admin.verify.subtitle")} icon={ScanLine} />
          <div className="flex flex-wrap items-end gap-2">
            <Field label={t("admin.verify.placeholder")} span>
              <input
                className={cn(inputCls, "font-mono text-[12.5px]")}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run(raw)}
                placeholder="BIFTU1|BFT-8A24K1|2|+251911220118|ET-2291045|addis-hawassa|2026-05-14|4TQ7P"
              />
            </Field>
            <Button onClick={() => run(raw)}>
              <Search className="h-4 w-4" /> {t("admin.verify.scan")}
            </Button>
            <Button variant="outline" onClick={() => setCam(true)}>
              <Camera className="h-4 w-4" /> {t("admin.verify.camera")}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bookings.slice(0, 4).map((b) => (
              <Chip key={b.ref} onClick={() => run(b.ref)}>
                {b.ref}
              </Chip>
            ))}
            {bookings.length === 0 && <span className="text-biftu-ink-soft text-[11.5px] font-semibold">{t("admin.verify.noLocal")}</span>}
          </div>
        </Panel>

        <Panel className="from-biftu-blue-dark to-biftu-blue relative overflow-hidden bg-gradient-to-br text-white">
          <div className="stripe-motif pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-[0.15]" />
          <div className="relative z-10 grid min-h-[220px] place-items-center text-center">
            {result.kind === "ok" ? (
              <div>
                <QrCode className="text-emerald-300 mb-2 h-6 w-6" />
                <PassengerQRSlot booking={result.booking} seat={result.passenger.seat} />
                <p className="mt-3 max-w-[240px] text-[11px] font-semibold text-white/70">{t("booking.confirm.scan")}</p>
              </div>
            ) : (
              <div className="text-white/70">
                <ScanLine className="mx-auto mb-2 h-8 w-8 opacity-60" />
                <p className="text-[13px] font-bold">{t("admin.verify.waiting")}</p>
                <p className="mt-1 text-[11.5px]">{t("admin.verify.waitingHint")}</p>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {submitted && result.kind === "notfound" && (
        <div className="bg-biftu-red-tint text-biftu-red flex items-center gap-2 rounded-2xl p-4 text-[13px] font-bold">
          <Ban className="h-4 w-4 shrink-0" /> {t("admin.verify.notFound")}
        </div>
      )}
      {(result.kind === "malformed" || result.kind === "signature") && (
        <div className="bg-biftu-red-tint text-biftu-red flex items-center gap-2 rounded-2xl p-4 text-[13px] font-bold">
          <ShieldCheck className="h-4 w-4 shrink-0" /> {result.kind === "signature" ? t("admin.verify.badSig") : t("admin.verify.malformed")}
        </div>
      )}

      {result.kind === "ok" && route && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <Panel>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-emerald-500 grid h-6 w-6 place-items-center rounded-full text-[12px] font-black text-white">✓</span>
                  <h3 className="text-[14px] font-extrabold">{t("admin.verify.identity")}</h3>
                  {result.legacy ? <Chip tone="gray">manual reference</Chip> : <Chip tone="green">{t("admin.verify.signed")}</Chip>}
                </div>
                <dl className="border-biftu-border divide-biftu-border divide-y rounded-2xl border px-4 py-1">
                  <Kv k={t("booking.passengers.fullName")} v={result.passenger.fullName} />
                  <Kv k="Phone" v={result.passenger.phone} />
                  <Kv k={t("booking.passengers.idNumber")} v={result.passenger.idNumber} />
                  <Kv k={t("common.seat")} v={result.passenger.seat} />
                  <Kv k="Route" v={`${tj(cityById(route.from).name)} → ${tj(cityById(route.to).name)}`} />
                  <Kv k="Departure" v={`${date(result.booking.departure)} · ${time(result.booking.departure)}`} />
                  <Kv k={t("admin.table.amount")} v={money(result.booking.total)} />
                </dl>
              </div>
              <div>
                <div className="text-biftu-ink-soft mb-3 text-[11px] font-bold tracking-wider uppercase">{t("admin.verify.pass")}</div>
                <BoardingPass booking={result.booking} seat={result.passenger.seat} compact onOpen={() => setViewer({ booking: result.booking, seat: result.passenger.seat })} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={result.booking.checkedIn || result.booking.status !== "confirmed"}
                    onClick={() => {
                      updateBooking(result.booking.ref, { checkedIn: true, status: "completed" });
                      toast({ title: "Passenger boarded", body: `${result.passenger.fullName} · seat ${result.passenger.seat}`, tone: "success" });
                    }}
                  >
                    <Check className="h-4 w-4" /> {result.booking.checkedIn ? t("admin.verify.boarded") : t("admin.table.checkin")}
                  </Button>
                  {profile.role === "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateBooking(result.booking.ref, { status: "cancelled" });
                        toast({ title: "Refund issued", body: `${money(result.booking.total)} → ${result.passenger.phone}`, tone: "error" });
                      }}
                    >
                      <RotateCcw className="h-4 w-4" /> {t("admin.table.refund")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setViewer({ booking: result.booking, seat: result.passenger.seat })}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </motion.div>
      )}

      <Panel>
        <PanelHead title={t("admin.verify.queue")} hint={t("admin.verify.queueHint")} icon={Users} />
        <div className="scroll-thin -mx-1 max-h-[340px] overflow-auto px-1">
          {bookings.length === 0 ? (
            <Empty text={t("admin.verify.empty")} />
          ) : (
            <table className="w-full min-w-[620px] text-left text-[12.5px]">
              <thead className="text-biftu-ink-soft border-biftu-border sticky top-0 z-10 bg-white text-[10px] tracking-wider uppercase">
                <tr>
                  <th className="border-biftu-border border-b py-2.5 pr-3">{t("admin.table.ref")}</th>
                  <th className="border-biftu-border border-b py-2.5 pr-3">{t("admin.table.passenger")}</th>
                  <th className="border-biftu-border border-b py-2.5 pr-3">{t("admin.table.phone")}</th>
                  <th className="border-biftu-border border-b py-2.5 pr-3">{t("admin.table.seats")}</th>
                  <th className="border-biftu-border border-b py-2.5 pr-3">{t("admin.table.status")}</th>
                  <th className="border-biftu-border border-b py-2.5 text-right">{t("admin.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-biftu-border divide-y">
                {bookings.flatMap((b) =>
                  b.passengers.map((p) => (
                    <tr key={b.ref + p.seat} className="hover:bg-biftu-paper/60 transition">
                      <td className="tnum py-2.5 pr-3 font-extrabold">{b.ref}</td>
                      <td className="py-2.5 pr-3 font-bold">{p.fullName}</td>
                      <td className="tnum text-biftu-ink-soft py-2.5 pr-3">{p.phone}</td>
                      <td className="py-2.5 pr-3">
                        <span className="bg-biftu-blue-tint text-biftu-blue tnum rounded-md px-2 py-0.5 text-[11px] font-extrabold">{p.seat}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Chip tone={b.checkedIn ? "green" : b.status === "confirmed" ? "blue" : "red"}>{b.checkedIn ? "boarded" : b.status}</Chip>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => run(`${b.ref}|${p.seat}|${p.phone}|${p.idNumber}`)} className="text-biftu-blue hover:bg-biftu-blue-tint rounded-lg px-2.5 py-1 text-[11.5px] font-extrabold transition">
                          {t("admin.verify.scan")}
                        </button>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      <AnimatePresence>
        {cam && <CameraScanner onResult={(v: string) => run(v)} onClose={() => setCam(false)} />}
        {viewer && <TicketViewer booking={viewer.booking} initialSeat={viewer.seat} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </div>
  );
}

function parse(v: string) {
  const parts = v.trim().split("|");
  if (parts.length < 2) return null;
  const [a, b] = parts[0].startsWith("BIFTU") ? [parts[1], parts[2]] : [parts[0], parts[1]];
  return a && b ? { ref: a, seat: b } : null;
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-biftu-ink-soft shrink-0 text-[11.5px] font-bold">{k}</dt>
      <dd className="text-biftu-ink truncate text-right text-[13px] font-extrabold">{v}</dd>
    </div>
  );
}

/* ============================ 4. Trips & schedule ============================ */
export function TripsPanel() {
  const { t, tj, money, time } = useI18n();
  const { adminRoutes, adminBuses, profile } = useStore();
  const toast = useToast();
  const [routeId, setRouteId] = useState(adminRoutes[0]?.id ?? "r1");
  const [day, setDay] = useState(todayISO(1));
  const [bulk, setBulk] = useState(7);
  const [sel, setSel] = useState<string[]>([]);

  const trips = useMemo(() => getTrips(routeId, day), [routeId, day]);
  const route = adminRoutes.find((x) => x.id === routeId);

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHead
          title={t("admin.trips.title")}
          hint={t("admin.trips.hint")}
          icon={CalendarClock}
          right={
            <div className="flex flex-wrap items-center gap-2">
              <select value={routeId} onChange={(e) => setRouteId(e.target.value)} className={cn(inputCls, "w-auto py-2 text-[12.5px]")}>
                {adminRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {tj(r.origin)} → {tj(r.destination)}
                  </option>
                ))}
              </select>
              <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={cn(inputCls, "tnum w-auto py-2 text-[12.5px]")} />
            </div>
          }
        />

        <div className="border-biftu-border mb-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-biftu-paper p-3">
          <span className="text-biftu-ink-soft flex items-center gap-1.5 text-[11px] font-bold uppercase">
            <RefreshCw className="h-3.5 w-3.5" /> {t("admin.trips.recurring")}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-biftu-ink text-[12px] font-bold">{t("admin.trips.repeatFor")}</span>
            {[1, 7, 14, 30].map((n) => (
              <Chip key={n} active={bulk === n} onClick={() => setBulk(n)}>
                {n}d
              </Chip>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            {profile.role === "admin" && <Button
              size="sm"
              onClick={() => {
                toast({ title: "Schedule generated", body: `${trips.length} departures × ${bulk} days on ${route ? `${tj(route.origin)} → ${tj(route.destination)}` : routeId}`, tone: "success" });
              }}
            >
              <Plus className="h-4 w-4" /> {t("admin.trips.generate")}
            </Button>}
            {profile.role === "admin" && <Button
              size="sm"
              variant="outline"
              disabled={!sel.length}
              onClick={() => {
                toast({ title: `${sel.length} trip(s) blocked`, body: "Seats released, passengers notified by SMS", tone: "error" });
                setSel([]);
              }}
            >
              <Ban className="h-4 w-4" /> {t("admin.trips.block")} {sel.length ? `(${sel.length})` : ""}
            </Button>}
          </div>
        </div>

        <div className="scroll-thin -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead className="text-biftu-ink-soft text-[10px] tracking-wider uppercase">
              <tr>
                <th className="py-2 pr-2"></th>
                <th className="py-2 pr-3">{t("admin.table.departure")}</th>
                <th className="py-2 pr-3">{t("admin.table.bus")}</th>
                <th className="py-2 pr-3">{t("admin.table.seats")}</th>
                <th className="py-2 pr-3">{t("admin.table.occupancy")}</th>
                <th className="py-2 pr-3">{t("admin.table.status")}</th>
                <th className="py-2 pr-3 text-right">{t("routes.table.fare")}</th>
                <th className="py-2 text-right">{t("admin.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-biftu-border divide-y">
              {trips.map((tr) => {
                const used = tr.seatsTotal - tr.seatsLeft;
                const pct = Math.round((used / tr.seatsTotal) * 100);
                const bus = adminBuses.find((b) => b.class === tr.busClass);
                return (
                  <tr key={tr.id} className={cn("transition", sel.includes(tr.id) && "bg-biftu-blue-tint/50")}>
                    <td className="py-2.5 pr-2">
                      <input type="checkbox" checked={sel.includes(tr.id)} onChange={() => toggle(tr.id)} className="accent-biftu-blue h-4 w-4 rounded" />
                    </td>
                    <td className="tnum py-2.5 pr-3 font-extrabold">
                      {time(tr.departure)}
                      <span className="text-biftu-ink-soft ml-2 text-[10.5px] font-bold">→ {time(tr.arrival)}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-biftu-blue/8 text-biftu-blue grid h-7 w-7 place-items-center rounded-lg">
                          <Bus className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <span className="block text-[12px] font-bold">{bus ? tj(bus.name) : tr.busClass}</span>
                          <span className="text-biftu-ink-soft tnum block text-[10.5px]">{tr.plate}</span>
                        </span>
                      </div>
                    </td>
                    <td className="tnum text-biftu-ink-soft py-2.5 pr-3 font-bold">
                      {used}/{tr.seatsTotal}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-biftu-paper h-1.5 w-20 overflow-hidden rounded-full">
                          <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: EASE }}
                            className={cn("block h-full rounded-full", pct > 90 ? "bg-biftu-red" : pct > 70 ? "bg-amber-400" : "bg-biftu-blue")}
                          />
                        </span>
                        <span className="tnum text-[11px] font-extrabold">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      {tr.seatsLeft <= 5 ? <Chip tone="red">{t("common.seatsLeft", { count: tr.seatsLeft })}</Chip> : <Chip tone="green">scheduled</Chip>}
                    </td>
                    <td className="tnum text-biftu-red py-2.5 pr-3 text-right font-extrabold">{money(tr.price)}</td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => toast({ title: "Trip editor", body: `${time(tr.departure)} · ${tr.plate}`, tone: "info" })} className="text-biftu-ink-soft hover:bg-biftu-blue-tint hover:text-biftu-blue rounded-lg p-1.5 transition">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => toast({ title: "Manifest exported", body: `${used} passengers · PDF in ${tj({ en: "English", am: "አማ", om: "OM" })}`, tone: "success" })} className="text-biftu-ink-soft hover:bg-biftu-blue-tint hover:text-biftu-blue rounded-lg p-1.5 transition">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}



/* ============================ 5. Bookings ============================ */
export function BookingsPanel() {
  const { t, tj, money, time, date } = useI18n();
  const { bookings, updateBooking, cancelBooking, profile } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Booking | null>(null);
  const per = 8;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return bookings.filter((b) => {
      const hay = (b.ref + b.routeId + b.passengers.map((p) => p.fullName + p.phone + p.idNumber).join("")).toLowerCase();
      const okQ = !needle || hay.includes(needle);
      const okS = status === "all" || b.status === status;
      return okQ && okS;
    });
  }, [bookings, q, status]);

  const pages = Math.max(1, Math.ceil(rows.length / per));
  const view = rows.slice(page * per, page * per + per);

  const exportCsv = () => {
    const head = ["ref", "passenger", "phone", "id", "seat", "route", "departure", "amount", "status", "checkedIn"].join(",");
    const body = bookings.flatMap((b) =>
      b.passengers.map((p) => [b.ref, q1(p.fullName), q1(p.phone), p.idNumber, p.seat, b.routeId, b.departure, b.total, b.status, b.checkedIn ? "yes" : "no"].join(",")),
    );
    const url = URL.createObjectURL(new Blob([head + "\n" + body.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `biftu-bookings-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", body: `${bookings.length} rows · manifest saved`, tone: "success" });
  };

  return (
    <>
      <Panel>
        <PanelHead
          title={t("admin.bookings.title")}
          hint={t("admin.bookings.hint")}
          icon={Ticket}
          right={
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-biftu-paper flex gap-1 rounded-full p-1">
                {["all", "confirmed", "completed", "cancelled"].map((s) => (
                  <button key={s} onClick={() => { setStatus(s); setPage(0); }} className={cn("rounded-full px-3 py-1.5 text-[11.5px] font-bold capitalize transition", status === s ? "bg-biftu-blue text-white" : "text-biftu-ink-soft hover:text-biftu-blue")}>
                    {s === "all" ? t("common.all") : s}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4" /> {t("admin.table.export")}
              </Button>
            </div>
          }
        />

        <div className="relative mb-4">
          <Search className="text-biftu-ink-soft absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={t("admin.bookings.search")} className={cn(inputCls, "pl-10")} />
          {q && (
            <button onClick={() => setQ("")} className="text-biftu-ink-soft absolute top-1/2 right-3 -translate-y-1/2">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <Empty text={bookings.length ? t("admin.bookings.noMatch") : t("admin.bookings.none")} action={<Button size="sm" onClick={() => setStatus("all")}>{t("common.reset")}</Button>} />
        ) : (
          <>
            <div className="scroll-thin -mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[820px] text-left text-[12.5px]">
                <thead className="text-biftu-ink-soft border-biftu-border border-b text-[10px] tracking-wider uppercase">
                  <tr>
                    <th className="py-2.5 pr-3">{t("admin.table.ref")}</th>
                    <th className="py-2.5 pr-3">{t("admin.table.passenger")}</th>
                    <th className="py-2.5 pr-3">{t("admin.table.route")}</th>
                    <th className="py-2.5 pr-3">{t("admin.table.departure")}</th>
                    <th className="py-2.5 pr-3">{t("admin.table.seats")}</th>
                    <th className="py-2.5 pr-3">{t("admin.table.status")}</th>
                    <th className="py-2.5 pr-3 text-right">{t("admin.table.amount")}</th>
                    <th className="py-2.5 text-right">{t("admin.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-biftu-border divide-y">
                  <AnimatePresence initial={false}>
                    {view.map((b) => {
                      const r = routeFor(b.routeId);
                      return (
                        <motion.tr key={b.ref} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-biftu-border hover:bg-biftu-paper/70 group cursor-pointer transition">
                          <td className="py-3 pr-3" onClick={() => setOpen(b)}>
                            <span className="tnum text-biftu-blue font-extrabold">{b.ref}</span>
                            {b.checkedIn && <span className="bg-emerald-50 text-emerald-700 ml-1.5 rounded px-1.5 py-0.5 text-[9.5px] font-extrabold">IN</span>}
                          </td>
                          <td className="py-3 pr-3" onClick={() => setOpen(b)}>
                            <div className="text-[12.5px] font-bold">{b.passengers[0]?.fullName || "—"}</div>
                            <div className="text-biftu-ink-soft tnum text-[10.5px]">{b.passengers[0]?.phone}</div>
                          </td>
                          <td className="py-3 pr-3 font-semibold" onClick={() => setOpen(b)}>
                            {r ? `${tj(cityById(r.from).name)} → ${tj(cityById(r.to).name)}` : b.routeId}
                          </td>
                          <td className="py-3 pr-3" onClick={() => setOpen(b)}>
                            <div className="text-[12px] font-bold">{date(b.departure)}</div>
                            <div className="tnum text-biftu-ink-soft text-[10.5px]">{time(b.departure)}</div>
                          </td>
                          <td className="py-3 pr-3" onClick={() => setOpen(b)}>
                            <span className="flex gap-1">
                              {b.seats.slice(0, 3).map((s) => (
                                <span key={s} className="bg-biftu-blue-tint text-biftu-blue tnum rounded px-1.5 py-0.5 text-[10.5px] font-extrabold">
                                  {s}
                                </span>
                              ))}
                              {b.seats.length > 3 && <span className="text-biftu-ink-soft text-[10.5px] font-bold">+{b.seats.length - 3}</span>}
                            </span>
                          </td>
                          <td className="py-3 pr-3" onClick={() => setOpen(b)}>
                            <Chip tone={b.status === "confirmed" ? "green" : b.status === "cancelled" ? "red" : "blue"}>{b.status}</Chip>
                          </td>
                          <td className="tnum text-biftu-red py-3 pr-3 text-right font-extrabold" onClick={() => setOpen(b)}>
                            {money(b.total)}
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-flex gap-1 opacity-0 transition group-hover:opacity-100">
                              <button onClick={() => setOpen(b)} className="text-biftu-ink-soft hover:bg-biftu-blue-tint hover:text-biftu-blue rounded-lg p-1.5" aria-label="View">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  updateBooking(b.ref, { checkedIn: true, status: "completed" });
                                  toast({ title: "Checked in", body: `${b.ref} · all seats`, tone: "success" });
                                }}
                                className="text-biftu-ink-soft hover:bg-emerald-50 hover:text-emerald-600 rounded-lg p-1.5"
                                aria-label="Check in"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              {profile.role === "admin" && (
                                <button
                                  onClick={() => {
                                    cancelBooking(b.ref);
                                    toast({ title: "Booking cancelled", body: `${money(b.total)} queued for refund`, tone: "error" });
                                  }}
                                  className="text-biftu-ink-soft hover:bg-biftu-red-tint hover:text-biftu-red rounded-lg p-1.5"
                                  aria-label="Refund"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="border-biftu-border text-biftu-ink-soft mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-[11.5px] font-bold">
              <span>
                {rows.length} rows · page {page + 1} / {pages}
              </span>
              <div className="flex gap-1.5">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="border-biftu-border hover:border-biftu-blue grid h-8 w-8 place-items-center rounded-lg border disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="border-biftu-border hover:border-biftu-blue grid h-8 w-8 place-items-center rounded-lg border disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>

      {/* detail drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="bg-biftu-ink/40 fixed inset-0 z-[80] backdrop-blur-sm" />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="border-biftu-border fixed inset-y-0 right-0 z-[90] flex w-full max-w-[520px] flex-col border-l bg-white shadow-[0_0_60px_rgba(14,47,99,.25)]"
            >
              <div className="bg-biftu-blue-dark flex items-center justify-between gap-3 p-5 text-white">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.16em] text-white/55 uppercase">{t("admin.bookings.detail")}</div>
                  <div className="font-display tnum text-[24px] leading-tight font-extrabold">{open.ref}</div>
                </div>
                <button onClick={() => setOpen(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-2">
                  <Stat label={t("admin.table.route")} value={(() => { const r = routeFor(open.routeId); return r ? `${tj(cityById(r.from).name)} → ${tj(cityById(r.to).name)}` : open.routeId; })()} />
                  <Stat label={t("admin.table.amount")} value={money(open.total)} tone="red" />
                  <Stat label={t("admin.table.status")} value={open.status} tone={open.status === "confirmed" ? "green" : "red"} />
                  <Stat label={t("booking.payment.method")} value={open.method.toUpperCase()} />
                </div>
                {/* payment settlement + uploaded proof */}
                <div className={cn("rounded-2xl border p-4", open.payStatus === "due_on_arrival" ? "border-amber-200 bg-amber-50" : open.payStatus === "paid" ? "border-emerald-200 bg-emerald-50" : "border-biftu-blue/20 bg-biftu-blue-tint")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-biftu-ink-soft text-[10.5px] font-bold tracking-wider uppercase">{t("admin.pay.title")}</div>
                      <div className="mt-1 text-[13.5px] font-extrabold">
                        {open.settlement === "on_arrival" ? t("booking.payment.onArrival.title") : t("booking.payment.transfer.title")}
                      </div>
                      <div className="text-biftu-ink-soft mt-0.5 text-[11.5px] font-semibold">
                        {open.payStatus === "paid" ? t("admin.pay.paid") : open.payStatus === "due_on_arrival" ? t("admin.pay.due") : t("admin.pay.review")}
                      </div>
                    </div>
                    {open.proof && (
                      <a href={open.proof} target="_blank" rel="noopener noreferrer" title={open.proofName}>
                        <img src={open.proof} alt="receipt" className="border-biftu-border h-20 w-20 rounded-xl border object-cover transition hover:scale-105" />
                      </a>
                    )}
                  </div>
                  {open.payStatus !== "paid" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateBooking(open.ref, { payStatus: "paid" });
                          setOpen({ ...open, payStatus: "paid" });
                          toast({ title: t("admin.pay.approved"), body: `${open.ref} · ${money(open.total)}`, tone: "success" });
                        }}
                      >
                        <Check className="h-4 w-4" /> {t("admin.pay.approve")}
                      </Button>
                      {open.settlement === "transfer" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            updateBooking(open.ref, { payStatus: "due_on_arrival", settlement: "on_arrival" });
                            setOpen({ ...open, payStatus: "due_on_arrival", settlement: "on_arrival" });
                            toast({ title: t("admin.pay.rejected"), body: t("admin.pay.rejectedBody"), tone: "error" });
                          }}
                        >
                          <Ban className="h-4 w-4" /> {t("admin.pay.reject")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">{t("admin.verify.pass")}</div>
                  <div className="space-y-3">
                    {open.passengers.map((p) => (
                      <BoardingPass key={p.seat} booking={open} seat={p.seat} compact />
                    ))}
                  </div>
                </div>
                <div className="border-biftu-border rounded-2xl border p-4">
                  <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">{t("admin.table.ref")} · payload</div>
                  <code className="text-biftu-blue block font-mono text-[10.5px] break-all">BIFTU1|{open.ref}|{open.passengers[0]?.seat}|{open.passengers[0]?.phone}|{open.passengers[0]?.idNumber}|{open.routeId}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`BIFTU1|${open.ref}|${open.passengers[0]?.seat ?? ""}|${open.passengers[0]?.phone ?? ""}|${open.passengers[0]?.idNumber ?? ""}|${open.routeId}`);
                      toast({ title: "Payload copied", body: "Paste into the scan console to verify", tone: "info" });
                    }}
                    className="text-biftu-blue hover:bg-biftu-blue-tint mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-extrabold transition"
                  >
                    <Copy className="h-3.5 w-3.5" /> copy
                  </button>
                </div>
              </div>
              <div className="border-biftu-border flex gap-2 border-t p-4">
                <Button full disabled={open.checkedIn} onClick={() => { updateBooking(open.ref, { checkedIn: true, status: "completed" }); setOpen({ ...open, checkedIn: true, status: "completed" }); toast({ title: "Checked in", tone: "success" }); }}>
                  <Check className="h-4 w-4" /> {open.checkedIn ? t("admin.verify.boarded") : t("admin.table.checkin")}
                </Button>
                {profile.role === "admin" && (
                  <Button variant="outline" onClick={() => { cancelBooking(open.ref); setOpen(null); toast({ title: "Refund issued", body: money(open.total), tone: "error" }); }}>
                    <RotateCcw className="h-4 w-4" /> {t("admin.table.refund")}
                  </Button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function q1(s: string) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

/* ============================ 6. Fleet ============================ */
export function FleetPanel() {
  const { t, tj } = useI18n();
  const { adminBuses, setAdminBuses, bookings } = useStore();
  const toast = useToast();
  const [sel, setSel] = useState(adminBuses[0]?.id ?? "");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const bus = adminBuses.find((b) => b.id === sel);
  const assigned = bus ? bookings.filter((b) => b.busClass === bus.class).length : 0;

  const patch = (id: string, p: Partial<AdminBus>) => setAdminBuses((arr) => arr.map((b) => (b.id === id ? { ...b, ...p } : b)));
  const patchTL = (id: string, key: "name" | "description", lang: "en" | "am" | "om", v: string) =>
    setAdminBuses((arr) => arr.map((b) => (b.id === id ? { ...b, [key]: { ...b[key], [lang]: v } } : b)));

  const add = () => {
    const id = "bus-" + Date.now().toString(36);
    setAdminBuses((arr) => [
      ...arr,
      {
        id,
        plate: `3-${Math.random().toString(36).slice(2, 4).toUpperCase()}${Math.floor(10000 + Math.random() * 89999)} ET`,
        class: "standard",
        name: { en: "New coach", am: "አዲስ አውቶብስ", om: "Konkolaa haaraa" },
        description: { en: "", am: "", om: "" },
        amenities: ["ac", "usb"],
        totalSeats: 40,
        active: true,
      },
    ]);
    setSel(id);
    toast({ title: "Coach added", body: "Fill the translations, then publish", tone: "success" });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
      <div className="space-y-3">
        <Panel pad={false}>
          <div className="flex items-center justify-between gap-2 p-4 pb-3">
            <h3 className="font-display text-biftu-ink text-[15px] font-extrabold">{t("admin.nav.fleet")}</h3>
            <Button size="sm" onClick={add}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="scroll-thin max-h-[420px] space-y-1.5 overflow-y-auto p-3 pt-0">
            {adminBuses.map((b) => {
              const missing = !b.description.en || !b.description.am || !b.description.om;
              return (
                <button
                  key={b.id}
                  onClick={() => setSel(b.id)}
                  className={cn("w-full rounded-xl border p-3 text-left transition", sel === b.id ? "border-biftu-blue bg-biftu-blue-tint" : "border-biftu-border hover:border-biftu-blue/50")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-extrabold">{tj(b.name)}</span>
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", b.active ? "bg-emerald-500" : "bg-biftu-border")} />
                  </div>
                  <div className="text-biftu-ink-soft tnum mt-1 flex items-center gap-2 text-[10.5px] font-bold">
                    <span>{b.plate}</span>·<span>{b.totalSeats} seats</span>
                  </div>
                  {missing && <span className="bg-biftu-red-tint text-biftu-red mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9.5px] font-extrabold">{t("common.missingTranslation")}</span>}
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="in service" value={String(adminBuses.filter((b) => b.active).length)} tone="green" />
            <Stat label="off / garage" value={String(adminBuses.filter((b) => !b.active).length)} tone="red" />
            <Stat label="bookings today" value={String(bookings.length)} />
            <Stat label="this class" value={String(assigned)} />
          </div>
        </Panel>
      </div>

      {bus ? (
        <div className="space-y-4">
          <Panel>
            <PanelHead
              title={tj(bus.name)}
              hint={`${bus.plate} · ${bus.class.toUpperCase()} · ${bus.totalSeats} seats`}
              icon={Bus}
              right={
                <div className="flex items-center gap-2">
                  <span className="text-biftu-ink-soft text-[11.5px] font-bold">{bus.active ? "Published" : "Hidden"}</span>
                  <Toggle on={bus.active} onChange={(v) => { patch(bus.id, { active: v }); toast({ title: v ? "Coach published" : "Coach pulled from sale", body: tj(bus.name), tone: v ? "success" : "info" }); }} label="Active" />
                  <button
                    onClick={() => setConfirmDel(bus.id)}
                    className="text-biftu-ink-soft hover:bg-biftu-red-tint hover:text-biftu-red rounded-lg p-2 transition"
                    aria-label="Delete coach"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              }
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Plate number">
                <input className={inputCls} value={bus.plate} onChange={(e) => patch(bus.id, { plate: e.target.value })} />
              </Field>
              <Field label="Class">
                <select className={inputCls} value={bus.class} onChange={(e) => patch(bus.id, { class: e.target.value as AdminBus["class"] })}>
                  <option value="vip">VIP</option>
                  <option value="business">Business</option>
                  <option value="standard">Standard</option>
                </select>
              </Field>
              <Field label="Total seats">
                <input type="number" className={cn(inputCls, "tnum")} value={bus.totalSeats} onChange={(e) => patch(bus.id, { totalSeats: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="mt-4">
              <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">Amenities</div>
              <div className="flex flex-wrap gap-1.5">
                {["recline", "ac", "usb", "screen", "wifi", "snack"].map((a) => {
                  const on = bus.amenities.includes(a);
                  return (
                    <Chip
                      key={a}
                      active={on}
                      onClick={() => patch(bus.id, { amenities: on ? bus.amenities.filter((x) => x !== a) : [...bus.amenities, a] })}
                    >
                      {tj(FLEET[0] && { [a]: { en: a, am: a, om: a } } ? { en: aLabel(a), am: aLabel(a), om: aLabel(a) } : { en: a })}
                    </Chip>
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel>
            <TranslationTabs
              fields={{ name: bus.name, description: bus.description }}
              onChange={(key, lang, v) => patchTL(bus.id, key as "name" | "description", lang, v)}
            />
          </Panel>
        </div>
      ) : (
        <Panel>
          <Empty text="Select a coach to edit" />
        </Panel>
      )}

      <AnimatePresence>
        {confirmDel && (
          <ConfirmDelete
            name={tj(adminBuses.find((b) => b.id === confirmDel)?.name ?? { en: "this coach" })}
            onCancel={() => setConfirmDel(null)}
            onConfirm={() => {
              setAdminBuses((arr) => arr.filter((b) => b.id !== confirmDel));
              setSel(adminBuses.find((b) => b.id !== confirmDel)?.id ?? "");
              setConfirmDel(null);
              toast({ title: "Coach removed", body: "Sales disabled, trips re-assigned", tone: "error" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function aLabel(a: string) {
  return { recline: "Reclining seats", ac: "Air conditioning", usb: "USB charging", screen: "Entertainment", wifi: "Onboard Wi-Fi", snack: "Refreshments" }[a] ?? a;
}

/* ============================ 7. Routes ============================ */
export function RoutesPanel() {
  const { t, tj, money } = useI18n();
  const { adminRoutes, setAdminRoutes } = useStore();
  const toast = useToast();
  const [sel, setSel] = useState(adminRoutes[0]?.id ?? "");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const r = adminRoutes.find((x) => x.id === sel);

  const patch = (id: string, p: Partial<AdminRoute>) => setAdminRoutes((arr) => arr.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const patchTL = (id: string, key: "origin" | "destination", lang: "en" | "am" | "om", v: string) =>
    setAdminRoutes((arr) => arr.map((x) => (x.id === id ? { ...x, [key]: { ...x[key], [lang]: v } } : x)));

  const add = () => {
    const id = "route-" + Date.now().toString(36);
    setAdminRoutes((arr) => [
      ...arr,
      {
        id,
        from: "addis",
        to: "hawassa",
        distanceKm: 275,
        durationMinutes: 300,
        basePrice: 1100,
        active: true,
        origin: { en: "Addis Ababa", am: "አዲስ አበባ", om: "Finfinnee" },
        destination: { en: "New destination", am: "አዲስ መድረሻ", om: "Bakka haaraa" },
      },
    ]);
    setSel(id);
    toast({ title: "Route created", body: "Set the fare, then publish", tone: "success" });
  };

  const tiers = r ? FLEET.map((f) => ({ cls: f.name, price: Math.round(r.basePrice * f.priceFactor) })) : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <Panel pad={false}>
          <div className="flex items-center justify-between gap-2 p-4 pb-3">
            <h3 className="font-display text-biftu-ink text-[15px] font-extrabold">{t("admin.nav.routes")}</h3>
            <Button size="sm" onClick={add}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="scroll-thin max-h-[460px] space-y-1.5 overflow-y-auto p-3 pt-0">
            {adminRoutes.map((x) => (
              <button
                key={x.id}
                onClick={() => setSel(x.id)}
                className={cn("w-full rounded-xl border p-3 text-left transition", sel === x.id ? "border-biftu-blue bg-biftu-blue-tint" : "border-biftu-border hover:border-biftu-blue/50")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12.5px] font-extrabold">
                    {tj(x.origin)} → {tj(x.destination)}
                  </span>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", x.active ? "bg-emerald-500" : "bg-biftu-border")} />
                </div>
                <div className="text-biftu-ink-soft tnum mt-1 flex items-center gap-2 text-[10.5px] font-bold">
                  <span>{x.distanceKm} km</span>·<span>{Math.round(x.durationMinutes / 60)}h</span>·<span>{money(x.basePrice)}</span>
                </div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHead title={t("admin.routes.mapTitle")} icon={MapPin} />
          <RouteMini activeId={sel} routes={adminRoutes} onPick={setSel} />
        </Panel>
      </div>

      {r && (
        <div className="space-y-4">
          <Panel>
            <PanelHead
              title={`${tj(r.origin)} → ${tj(r.destination)}`}
              hint={`${r.distanceKm} km · ${Math.floor(r.durationMinutes / 60)}h ${r.durationMinutes % 60}m`}
              icon={Filter}
              right={
                <div className="flex items-center gap-2">
                  <span className="text-biftu-ink-soft text-[11.5px] font-bold">{r.active ? "On sale" : "Off sale"}</span>
                  <Toggle on={r.active} onChange={(v) => { patch(r.id, { active: v }); toast({ title: v ? "Route on sale" : "Route suspended", tone: v ? "success" : "info" }); }} label="Active" />
                  <button onClick={() => setConfirmDel(r.id)} className="text-biftu-ink-soft hover:bg-biftu-red-tint hover:text-biftu-red rounded-lg p-2 transition" aria-label="Delete route">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Origin code">
                <select className={inputCls} value={r.from} onChange={(e) => patch(r.id, { from: e.target.value })}>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.en}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Destination code">
                <select className={inputCls} value={r.to} onChange={(e) => patch(r.id, { to: e.target.value })}>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.en}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Distance (km)">
                <input type="number" className={cn(inputCls, "tnum")} value={r.distanceKm} onChange={(e) => patch(r.id, { distanceKm: Number(e.target.value) })} />
              </Field>
              <Field label="Duration (min)">
                <input type="number" className={cn(inputCls, "tnum")} value={r.durationMinutes} onChange={(e) => patch(r.id, { durationMinutes: Number(e.target.value) })} />
              </Field>
            </div>

            <div className="border-biftu-border mt-5 rounded-2xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-biftu-ink-soft flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider uppercase">
                  <Percent className="h-3.5 w-3.5" /> {t("admin.routes.fareLadder")}
                </span>
                <button onClick={() => { patch(r.id, { basePrice: Math.round(r.basePrice * 1.05) }); toast({ title: "Base fare +5%", body: money(Math.round(r.basePrice * 1.05)), tone: "info" }); }} className="text-biftu-blue hover:bg-biftu-blue-tint rounded-lg px-2 py-1 text-[11px] font-extrabold transition">
                  <TrendingUp className="mr-1 inline h-3 w-3" /> raise 5%
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
                <Field label="Base fare (Standard)">
                  <input type="number" className={cn(inputCls, "tnum")} value={r.basePrice} onChange={(e) => patch(r.id, { basePrice: Number(e.target.value) })} />
                </Field>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {tiers.map((x) => (
                    <div key={x.cls.en} className="bg-biftu-paper rounded-xl p-3">
                      <div className="text-biftu-ink-soft text-[10px] font-bold uppercase">{tj(x.cls)}</div>
                      <div className="tnum text-biftu-ink mt-1 text-[16px] font-extrabold">{money(x.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <TranslationTabs fields={{ origin: r.origin, destination: r.destination }} onChange={(key, lang, v) => patchTL(r.id, key as "origin" | "destination", lang, v)} />
          </Panel>
        </div>
      )}

      <AnimatePresence>
        {confirmDel && (
          <ConfirmDelete
            name={tj(adminRoutes.find((x) => x.id === confirmDel)?.origin ?? { en: "this route" })}
            onCancel={() => setConfirmDel(null)}
            onConfirm={() => {
              setAdminRoutes((arr) => arr.filter((x) => x.id !== confirmDel));
              setSel(adminRoutes.find((x) => x.id !== confirmDel)?.id ?? "");
              setConfirmDel(null);
              toast({ title: "Route deleted", body: "Upcoming trips cancelled, passengers refunded", tone: "error" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RouteMini({ routes, activeId, onPick }: { routes: AdminRoute[]; activeId: string; onPick: (id: string) => void }) {
  const lats = CITIES.map((c) => c.lat);
  const lngs = CITIES.map((c) => c.lng);
  const minLat = Math.min(...lats) - 0.6,
    maxLat = Math.max(...lats) + 0.6,
    minLng = Math.min(...lngs) - 0.6,
    maxLng = Math.max(...lngs) + 0.6;
  const px = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
  const py = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * 100;
  return (
    <div className="from-biftu-blue-dark to-biftu-blue relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {routes.map((r) => {
          const a = CITIES.find((c) => c.id === r.from)!;
          const b = CITIES.find((c) => c.id === r.to)!;
          if (!a || !b) return null;
          return (
            <line
              key={r.id}
              x1={px(a.lng)}
              y1={py(a.lat)}
              x2={px(b.lng)}
              y2={py(b.lat)}
              stroke={sel2(r.id, activeId) ? "#D71A21" : "rgba(255,255,255,.3)"}
              strokeWidth={sel2(r.id, activeId) ? 1 : 0.4}
            />
          );
        })}
      </svg>
      {CITIES.map((c) => (
        <span key={c.id} className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" style={{ left: `${px(c.lng)}%`, top: `${py(c.lat)}%` }} />
      ))}
      <button onClick={() => routes[0] && onPick(routes[0].id)} className="absolute right-2 bottom-2 rounded-lg bg-white/10 px-2 py-1 text-[9.5px] font-bold text-white backdrop-blur">
        {routes.length} routes
      </button>
    </div>
  );
}
function sel2(id: string, active: string) {
  return id === active;
}

/* ============================ 8. Customers ============================ */
export function CustomersPanel() {
  const { t, tj, money, time } = useI18n();
  const { bookings } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  const customers = useMemo(() => {
    const m = new Map<string, { name: string; phone: string; trips: number; spent: number; seats: number; locale: string; last: string; status: string }>();
    bookings.forEach((b) =>
      b.passengers.forEach((p) => {
        const cur = m.get(p.phone) ?? { name: p.fullName, phone: p.phone, trips: 0, spent: 0, seats: 0, locale: b.locale, last: b.departure, status: b.status };
        cur.trips += 1;
        cur.spent += Math.round(b.total / Math.max(1, b.passengers.length));
        cur.seats += 1;
        cur.locale = b.locale;
        if (+new Date(b.departure) > +new Date(cur.last)) cur.last = b.departure;
        cur.status = b.status;
        m.set(p.phone, cur);
      }),
    );
    return [...m.values()].sort((a, b) => b.spent - a.spent);
  }, [bookings]);

  const drill = customers.find((c) => c.phone === open);
  const drillBookings = drill ? bookings.filter((b) => b.passengers.some((p) => p.phone === drill.phone)) : [];

  return (
    <>
      <Panel>
        <PanelHead title={t("admin.customers.title")} hint={t("admin.customers.hint")} icon={Users} right={<Chip tone="blue">{customers.length} travellers</Chip>} />
        {customers.length === 0 ? (
          <Empty text={t("admin.customers.empty")} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((c, i) => (
              <motion.button
                key={c.phone}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                onClick={() => setOpen(c.phone)}
                className="border-biftu-border hover:border-biftu-blue shadow-card hover:shadow-card-hover group rounded-2xl border bg-white p-4 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <span className="from-biftu-blue to-biftu-blue-dark grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-[15px] font-extrabold text-white">
                    {c.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-extrabold">{c.name}</div>
                    <div className="text-biftu-ink-soft tnum text-[11px] font-semibold">{c.phone}</div>
                  </div>
                  <ChevronRight className="text-biftu-border group-hover:text-biftu-blue h-4 w-4 transition" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Stat label="trips" value={String(c.trips)} />
                  <Stat label="seats" value={String(c.seats)} />
                  <Stat label="ltv" value={money(c.spent)} tone="red" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Chip tone="blue">{c.locale.toUpperCase()}</Chip>
                  <span className="text-biftu-ink-soft tnum text-[10.5px] font-bold">last {time(c.last)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {drill && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="bg-biftu-ink/40 fixed inset-0 z-[80] backdrop-blur-sm" />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="border-biftu-border fixed inset-y-0 right-0 z-[90] flex w-full max-w-[480px] flex-col border-l bg-white"
            >
              <div className="bg-biftu-blue-dark flex items-start justify-between gap-3 p-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="bg-biftu-red grid h-12 w-12 place-items-center rounded-xl text-[18px] font-extrabold">{drill.name.charAt(0)}</span>
                  <div>
                    <div className="text-[16px] font-extrabold">{drill.name}</div>
                    <div className="tnum text-[12px] text-white/70">{drill.phone}</div>
                  </div>
                </div>
                <button onClick={() => setOpen(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-5">
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="trips" value={String(drill.trips)} />
                  <Stat label="lifetime" value={money(drill.spent)} tone="red" />
                  <Stat label="points" value={String(drill.trips * 120)} tone="green" />
                </div>
                <div>
                  <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">Booking history</div>
                  <div className="space-y-2">
                    {drillBookings.map((b) => {
                      const r = routeFor(b.routeId);
                      return (
                        <div key={b.ref} className="border-biftu-border flex items-center justify-between gap-3 rounded-xl border p-3">
                          <div className="min-w-0">
                            <div className="tnum text-[12.5px] font-extrabold">{b.ref}</div>
                            <div className="text-biftu-ink-soft truncate text-[11px] font-semibold">
                              {r ? `${tj(cityById(r.from).name)} → ${tj(cityById(r.to).name)}` : b.routeId} · {date(b.departure)}
                            </div>
                          </div>
                          <Chip tone={b.status === "cancelled" ? "red" : "green"}>{b.seats.join(",")}</Chip>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="border-biftu-border flex gap-2 border-t p-4">
                <a href={`tel:${drill.phone.replace(/\s/g, "")}`} className="flex-1">
                  <Button full>
                    <Icon name="phone" className="h-4 w-4" /> Call
                  </Button>
                </a>
                <Button variant="outline" onClick={() => setOpen(null)}>
                  <User className="h-4 w-4" /> Notes
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* date helper local to the drill-down */
function date(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ============================ 9. Offices & staff ============================ */
export function OfficesPanel() {
  const { t, tj } = useI18n();
  const { bookings } = useStore();
  const toast = useToast();
  const [staff, setStaff] = useState(STAFF);
  const [drivers, setDrivers] = useState(CREW);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {OFFICES.map((o, i) => {
          const c = cityById(o.city);
          const load = bookings.filter((b) => b.routeId.includes(c.id.slice(0, 3))).length + i;
          return (
            <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Panel className="h-full">
                <div className="bg-biftu-blue-tint text-biftu-blue mb-3 flex items-center justify-between rounded-xl px-3 py-2">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-wider uppercase">
                    <MapPin className="h-3.5 w-3.5" /> {c.name.en}
                  </span>
                  <span className="tnum text-[11px] font-extrabold">{load} today</span>
                </div>
                <h4 className="text-[13.5px] leading-snug font-extrabold">{tj(o.name)}</h4>
                <p className="text-biftu-ink-soft mt-1.5 text-[12px] leading-snug">{tj(o.address)}</p>
                <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="text-biftu-blue tnum mt-3 flex items-center gap-1.5 text-[12.5px] font-extrabold">
                  <Icon name="phone" className="h-3.5 w-3.5" /> {o.phone}
                </a>
                <div className="border-biftu-border mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                  <Stat label="open" value="06–20" />
                  <Stat label="window" value="cash" />
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHead title={t("admin.offices.staff")} hint={t("admin.offices.staffHint")} icon={Users} right={<Chip tone="blue">{staff.filter((s) => s.active).length} active</Chip>} />
          <div className="space-y-2">
            {staff.map((s) => (
              <div key={s.id} className="border-biftu-border hover:bg-biftu-paper/60 flex items-center gap-3 rounded-xl border p-3 transition">
                <span className="bg-biftu-blue/8 text-biftu-blue grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold">{s.name.split(" ").map((x) => x[0]).join("")}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-extrabold">{s.name}</div>
                  <div className="text-biftu-ink-soft truncate text-[11px] font-semibold">
                    {s.office} · {s.phone}
                  </div>
                </div>
                <Chip tone={s.role === "supervisor" ? "red" : s.role === "ops" ? "gray" : "blue"}>{s.role}</Chip>
                <Toggle
                  on={s.active}
                  onChange={(v) => {
                    setStaff((arr) => arr.map((x) => (x.id === s.id ? { ...x, active: v } : x)));
                    toast({ title: v ? "Access granted" : "Access revoked", body: s.name, tone: v ? "success" : "error" });
                  }}
                  label="Access"
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHead title={t("admin.offices.drivers")} hint={t("admin.offices.driversHint")} icon={ShieldCheck} />
          <div className="space-y-2">
            {drivers.map((d) => (
              <div key={d.id} className="border-biftu-border flex items-center gap-3 rounded-xl border p-3">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold", d.status === "delayed" ? "bg-biftu-red-tint text-biftu-red" : d.status === "rest" ? "bg-biftu-paper text-biftu-ink-soft" : "bg-emerald-50 text-emerald-600")}>
                  <Bus className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-extrabold">{d.name}</div>
                  <div className="text-biftu-ink-soft tnum text-[11px] font-semibold">
                    {d.license} · {d.years}y · {d.trips} trips
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11.5px] font-extrabold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" /> {d.rating}
                </span>
                <button onClick={() => setDrivers((arr) => arr.map((x) => (x.id === d.id ? { ...x, status: x.status === "rest" ? "on-trip" : "rest" } : x)))} className="text-biftu-ink-soft hover:text-biftu-blue" aria-label="Toggle duty">
                  <CircleDot className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================ 10. Reports ============================ */
export function ReportsPanel() {
  const { t, money } = useI18n();
  const { bookings, adminRoutes } = useStore();
  const toast = useToast();
  const [from, setFrom] = useState(todayISO(-30));
  const [to, setTo] = useState(todayISO());
  const [metric, setMetric] = useState<"revenue" | "occupancy">("revenue");

  const confirmed = bookings.filter((b) => b.status !== "cancelled");
  const total = confirmed.reduce((s, b) => s + b.total, 0);
  const refunds = bookings.filter((b) => b.status === "cancelled").reduce((s, b) => s + b.total, 0);
  const byClass = FLEET.map((f) => ({ cls: f.name.en, value: confirmed.filter((b) => b.busClass === f.id).reduce((s, b) => s + b.total, 0), count: confirmed.filter((b) => b.busClass === f.id).length }));
  const byRoute = adminRoutes.map((r) => ({ name: `${r.origin.en.slice(0, 5)}→${r.destination.en.slice(0, 5)}`, value: confirmed.filter((b) => b.routeId === r.id).reduce((s, b) => s + b.total, 0) }));

  const exportReport = () => {
    const rows = [
      ["metric", "value"],
      ["period_from", from],
      ["period_to", to],
      ["gross_revenue", String(total)],
      ["refunds", String(refunds)],
      ["bookings", String(confirmed.length)],
      ...byClass.map((c) => [`revenue_${c.cls}`, String(c.value)]),
    ];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `biftu-report-${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report generated", body: `${from} → ${to}`, tone: "success" });
  };

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHead
          title={t("admin.reports.title")}
          hint={t("admin.reports.hint")}
          icon={BarChart3}
          right={
            <div className="flex flex-wrap items-end gap-2">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(inputCls, "tnum w-auto py-2 text-[12px]")} />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={cn(inputCls, "tnum w-auto py-2 text-[12px]")} />
              <Button size="sm" onClick={exportReport}>
                <Download className="h-4 w-4" /> {t("admin.table.export")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> PDF
              </Button>
            </div>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Big label={t("admin.kpi.revenue")} value={money(total)} delta="+12.4%" />
          <Big label={t("admin.reports.refunds")} value={money(refunds)} delta="-2.1%" tone="red" />
          <Big label={t("admin.reports.tickets")} value={String(confirmed.reduce((s, b) => s + b.seats.length, 0))} delta="+6.8%" />
          <Big label={t("admin.reports.avgTicket")} value={money(confirmed.length ? Math.round(total / confirmed.length) : 0)} delta="+1.9%" />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHead
            title={metric === "revenue" ? t("admin.charts.revenue") : t("admin.reports.occTrend")}
            icon={TrendingUp}
            right={
              <div className="bg-biftu-paper flex gap-1 rounded-full p-1">
                {(["revenue", "occupancy"] as const).map((m) => (
                  <button key={m} onClick={() => setMetric(m)} className={cn("rounded-full px-3 py-1.5 text-[11.5px] font-bold", metric === m ? "bg-biftu-blue text-white" : "text-biftu-ink-soft")}>
                    {m}
                  </button>
                ))}
              </div>
            }
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="rp-a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metric === "revenue" ? "#1B4F9C" : "#D71A21"} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={metric === "revenue" ? "#1B4F9C" : "#D71A21"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} interval={4} stroke="#E5E7EB" />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} stroke="#E5E7EB" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={40} />
                <Tooltip contentStyle={{ borderRadius: 14, fontSize: 12, border: "1px solid #E5E7EB" }} formatter={tip(metric, (v) => (metric === "revenue" ? money(v) : v))} />
                <Area type="monotone" dataKey={metric === "revenue" ? "revenue" : "bookings"} stroke={metric === "revenue" ? "#1B4F9C" : "#D71A21"} strokeWidth={2.4} fill="url(#rp-a)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHead title={t("admin.reports.byClass")} icon={Bus} />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="cls" tick={{ fontSize: 10.5, fill: "#4B5563" }} stroke="#E5E7EB" />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} stroke="#E5E7EB" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} width={38} />
                <Tooltip contentStyle={{ borderRadius: 14, fontSize: 12, border: "1px solid #E5E7EB" }} formatter={tip("Revenue", (v) => money(v))} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {byClass.map((_, i) => (
                    <Cell key={i} fill={["#0E2F63", "#1B4F9C", "#8FB2E0"][i % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHead title={t("admin.reports.routeTable")} icon={Filter} />
          <div className="space-y-2">
            {byRoute.map((r) => {
              const pct = total ? Math.round((r.value / total) * 100) : 0;
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-biftu-ink w-[112px] shrink-0 truncate text-[11.5px] font-bold">{r.name}</span>
                  <span className="bg-biftu-paper h-2.5 flex-1 overflow-hidden rounded-full">
                    <motion.span initial={{ width: 0 }} animate={{ width: `${Math.max(2, pct)}%` }} transition={{ duration: 0.9, ease: EASE }} className="bg-biftu-blue block h-full rounded-full" />
                  </span>
                  <span className="tnum text-biftu-ink-soft w-[76px] shrink-0 text-right text-[11px] font-extrabold">{money(r.value)}</span>
                </div>
              );
            })}
            {byRoute.length === 0 && <p className="text-biftu-ink-soft text-[12px] font-semibold">No routes yet.</p>}
          </div>
        </Panel>
        <Panel>
          <PanelHead title={t("admin.reports.payments")} icon={Ticket} />
          <div className="space-y-2.5">
            {[
              { p: "Telebirr", v: 0.52, amt: Math.round(total * 0.52), c: "#1B4F9C" },
              { p: "Chapa", v: 0.28, amt: Math.round(total * 0.28), c: "#D71A21" },
              { p: "CBE Birr", v: 0.14, amt: Math.round(total * 0.14), c: "#0E2F63" },
              { p: "Card", v: 0.06, amt: Math.round(total * 0.06), c: "#8FB2E0" },
            ].map((m) => (
              <div key={m.p} className="border-biftu-border flex items-center gap-3 border-b pb-2.5 last:border-0">
                <span className="h-7 w-1.5 rounded-full" style={{ background: m.c }} />
                <span className="flex-1 text-[12.5px] font-bold">{m.p}</span>
                <span className="tnum text-biftu-ink-soft text-[11.5px] font-extrabold">{Math.round(m.v * 100)}%</span>
                <span className="tnum w-[92px] text-right text-[12.5px] font-extrabold">{money(m.amt)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Big({ label, value, delta, tone = "blue" }: { label: string; value: string; delta: string; tone?: "blue" | "red" }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-4", tone === "red" ? "bg-biftu-red" : "from-biftu-blue-dark to-biftu-blue bg-gradient-to-br")}>
      <div className="stripe-motif pointer-events-none absolute inset-y-0 -right-4 w-16 opacity-20" />
      <div className="relative z-10">
        <div className="text-[10px] font-bold tracking-wider text-white/65 uppercase">{label}</div>
        <div className="font-display tnum mt-1.5 text-[clamp(19px,2.2vw,26px)] leading-none font-extrabold text-white">{value}</div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-extrabold text-white">
          {delta.startsWith("-") ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />} {delta}
        </div>
      </div>
    </div>
  );
}

/* ============================ 11. Settings ============================ */
export function SettingsPanel() {
  const { t } = useI18n();
  const { profile, setProfile, setRole } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<"brand" | "pricing" | "comms" | "roles">("pricing");
  const [s, setS] = useState({ fee: 35, hold: 10, margin: 12, sms: true, email: true, whatsapp: false, telebirr: true, chapa: true, cbe: true, card: false, tax: 15, defaultLocale: profile.preferredLocale });

  const save = () => {
    setProfile({ ...profile, preferredLocale: s.defaultLocale });
    toast({ title: "Settings saved", body: "Live across the booking engine in 12s", tone: "success" });
  };

  const N = ({ k }: { k: string }) => <span className="text-biftu-ink block text-[12.5px] font-bold">{t(`admin.settings.items.${k}.t`)}</span>;
  const D = ({ k }: { k: string }) => <span className="text-biftu-ink-soft mt-0.5 block text-[11px] leading-snug">{t(`admin.settings.items.${k}.d`)}</span>;

  return (
    <div className="grid gap-4 xl:grid-cols-[210px_1fr]">
      <Panel pad={false} className="h-fit">
        <div className="p-3">
          {(["brand", "pricing", "comms", "roles"] as const).map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={cn("relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-bold capitalize transition", tab === x ? "text-biftu-blue" : "text-biftu-ink-soft hover:text-biftu-blue")}
            >
              {tab === x && <motion.span layoutId="set-pill" className="bg-biftu-blue-tint absolute inset-0 rounded-xl" />}
              <span className="relative z-10">
                {x === "brand" ? "Brand" : x === "pricing" ? "Pricing" : x === "comms" ? "Notifications" : "Roles & access"}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="space-y-4">
        {tab === "pricing" && (
          <Panel>
            <PanelHead title={t("admin.settings.pricing")} hint={t("admin.settings.pricingHint")} icon={Percent} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t("admin.settings.fee")}>
                <div className="relative">
                  <input type="number" className={cn(inputCls, "tnum pr-12")} value={s.fee} onChange={(e) => setS({ ...s, fee: Number(e.target.value) })} />
                  <span className="text-biftu-ink-soft absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-bold">ETB</span>
                </div>
              </Field>
              <Field label={t("admin.settings.hold")}>
                <div className="relative">
                  <input type="number" className={cn(inputCls, "tnum pr-14")} value={s.hold} onChange={(e) => setS({ ...s, hold: Number(e.target.value) })} />
                  <span className="text-biftu-ink-soft absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-bold">min</span>
                </div>
              </Field>
              <Field label={t("admin.settings.tax")}>
                <div className="relative">
                  <input type="number" className={cn(inputCls, "tnum pr-9")} value={s.tax} onChange={(e) => setS({ ...s, tax: Number(e.target.value) })} />
                  <span className="text-biftu-ink-soft absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-bold">%</span>
                </div>
              </Field>
            </div>
            <div className="border-biftu-border mt-4 grid gap-2 rounded-2xl border bg-biftu-paper p-4 sm:grid-cols-3">
              {FLEET.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <span className="text-[12px] font-extrabold">{f.name.en}</span>
                  <span className="tnum text-biftu-blue text-[12px] font-extrabold">×{f.priceFactor}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2.5">
                <Toggle on={s.margin === 12} onChange={(v) => setS({ ...s, margin: v ? 12 : 8 })} label="Dynamic margin" />
                <span>
                  <N k="dynamic" />
                  <D k="dynamic" />
                </span>
              </label>
              <Button onClick={save}>{t("common.save")}</Button>
            </div>
          </Panel>
        )}

        {tab === "comms" && (
          <Panel>
            <PanelHead title={t("admin.settings.comms")} hint={t("admin.settings.commsHint")} icon={ScanLine} />
            <div className="space-y-1">
              {([
                ["sms", "sms"],
                ["email", "email"],
                ["whatsapp", "whatsapp"],
              ] as const).map(([key, label]) => (
                <div key={key} className="border-biftu-border flex items-center justify-between gap-4 border-b py-3 last:border-0">
                  <span>
                    <N k={label} />
                    <D k={label} />
                  </span>
                  <Toggle on={(s as unknown as Record<string, boolean>)[key]} onChange={(v) => { (setS as unknown as (o: Record<string, unknown>) => void)({ ...s, [key]: v }); toast({ title: `${label} ${v ? "enabled" : "disabled"}`, tone: "info" }); }} label={label} />
                </div>
              ))}
            </div>
            <div className="border-biftu-border mt-4 rounded-2xl border p-4">
              <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">SMS template · Amharic</div>
              <p className="border-biftu-bg-biftu-ink rounded-xl border bg-biftu-paper p-3 text-[12px] leading-relaxed">
                ቢፍቱ ልክዕ። {`{{name}}`}፣ {`{{route)}}`} በ{`{{date}}`} ሰዓት {`{{time}}`} · ወንበር {`{{seat}}`} · {`{{ref}}`}
              </p>
              <div className="text-biftu-ink-soft mt-2 text-[10.5px] font-semibold">158 chars · 1 SMS segment · variables auto-localise</div>
            </div>
          </Panel>
        )}

        {tab === "brand" && (
          <Panel>
            <PanelHead title={t("admin.settings.brand")} hint={t("admin.settings.brandHint")} icon={ShieldCheck} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Support line">
                <input className={cn(inputCls, "tnum")} defaultValue="8477" />
              </Field>
              <Field label="Ticket prefix">
                <input className={cn(inputCls, "font-mono")} defaultValue="BFT-" />
              </Field>
            </div>
            <div className="mt-4">
              <div className="text-biftu-ink-soft mb-2 text-[10.5px] font-bold tracking-wider uppercase">Livery</div>
              <div className="flex gap-2">
                {["#1B4F9C", "#0E2F63", "#D71A21", "#EAF1FB", "#FFFFFF"].map((c) => (
                  <span key={c} className="border-biftu-border flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold">
                    <span className="h-5 w-5 rounded-md border border-black/10" style={{ background: c }} /> {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["en", "am", "om"] as const).map((l) => (
                <label key={l} className={cn("border rounded-2xl p-3 transition cursor-pointer", s.defaultLocale === l ? "border-biftu-blue bg-biftu-blue-tint" : "border-biftu-border")}>
                  <input type="radio" name="locale" checked={s.defaultLocale === l} onChange={() => setS({ ...s, defaultLocale: l })} className="accent-biftu-blue mr-2" />
                  <span className="text-[12.5px] font-extrabold">{{ en: "English", am: "አማርኛ", om: "Afaan Oromoo" }[l]}</span>
                  <div className="text-biftu-ink-soft mt-1 text-[11px]">default ticket + SMS language</div>
                </label>
              ))}
            </div>
            <Button className="mt-4" onClick={save}>
              {t("common.save")}
            </Button>
          </Panel>
        )}

        {tab === "roles" && (
          <Panel>
            <PanelHead title={t("admin.settings.roles")} hint={t("admin.settings.rolesHint")} icon={Users} />
            <div className="grid gap-3 md:grid-cols-3">
              {([
                { id: "admin", can: ["Fare + schedule edits", "Refunds", "Delete routes", "Payouts"], tone: "red" },
                { id: "agent", can: ["Create bookings", "Check-in", "Re-send tickets"], tone: "blue" },
                { id: "customer", can: ["Own bookings", "Own e-tickets", "Profile"], tone: "gray" },
              ] as const).map((r) => (
                <div key={r.id} className={cn("rounded-2xl border p-4", profile.role === r.id ? "border-biftu-blue bg-biftu-blue-tint" : "border-biftu-border")}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold capitalize">{r.id}</span>
                    {profile.role === r.id && <Chip tone={r.tone}>current</Chip>}
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {r.can.map((c) => (
                      <li key={c} className="text-biftu-ink-soft flex items-start gap-1.5 text-[11.5px] font-semibold">
                        <Check className="text-emerald-600 mt-0.5 h-3.5 w-3.5 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" full className="mt-3" onClick={() => { setRole(r.id as never); toast({ title: `Role switched to ${r.id}`, body: "Permissions applied instantly", tone: "info" }); }}>
                    Use this role
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-biftu-border mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-biftu-paper p-4">
              <span className="text-biftu-ink-soft text-[11.5px] font-semibold">RLS enforced in Postgres — this panel mirrors the policy matrix; nothing here expands real database rights.</span>
              <Button size="sm" variant="outline">
                View policy SQL
              </Button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* ============================ shared: translation tabs + confirm ============================ */
const TL = ["en", "am", "om"] as const;
export function TranslationTabs({
  fields,
  onChange,
}: {
  fields: Record<string, Record<string, string>>;
  onChange: (key: string, lang: (typeof TL)[number], value: string) => void;
}) {
  const { t } = useI18n();
  const [lang, setLang] = useState<(typeof TL)[number]>("en");
  const missing = (key: string) => TL.filter((l) => !fields[key]?.[l]?.trim());
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-biftu-ink text-[15px] font-extrabold">{t("admin.editor.title")}</h3>
          <p className="text-biftu-ink-soft mt-0.5 text-[11.5px]">{t("admin.editor.hint")}</p>
        </div>
        <div className="bg-biftu-paper flex gap-1 rounded-full p-1">
          {TL.map((l) => {
            const anyMissing = Object.keys(fields).some((k) => !fields[k]?.[l]?.trim());
            return (
              <button key={l} onClick={() => setLang(l)} className={cn("relative rounded-full px-3.5 py-1.5 text-[11.5px] font-bold", lang === l ? "text-white" : "text-biftu-ink-soft")}>
                {lang === l && <motion.span layoutId="tl-lang" className="bg-biftu-blue absolute inset-0 rounded-full" />}
                <span className="relative z-10 flex items-center gap-1">
                  {{ en: "EN", am: "አማ", om: "OM" }[l]}
                  {anyMissing && <span className="bg-biftu-red h-1.5 w-1.5 rounded-full" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(fields).map(([key, val]) => {
          const miss = missing(key);
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-biftu-ink-soft text-[10.5px] font-bold tracking-wider uppercase">{key}</span>
                {miss.length > 0 && (
                  <span className="bg-biftu-red-tint text-biftu-red rounded-full px-2 py-0.5 text-[9.5px] font-extrabold">
                    {t("common.missingTranslation")} · {miss.map((m) => m.toUpperCase()).join(" ")}
                  </span>
                )}
                <span className="ml-auto flex gap-1">
                  {TL.map((l) => (
                    <span key={l} className={cn("h-1 w-4 rounded-full", val[l]?.trim() ? "bg-emerald-500" : "bg-biftu-border")} />
                  ))}
                </span>
              </div>
              <textarea
                rows={key === "description" || key === "address" ? 3 : 1}
                className={cn(inputCls, "resize-none")}
                value={val[lang] ?? ""}
                onChange={(e) => onChange(key, lang, e.target.value)}
                placeholder={lang === "am" ? "አማርኛ ይጻፉ…" : lang === "om" ? "Afaan Oromoo barreessi…" : "Write in English…"}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm">
          <Check className="h-4 w-4" /> {t("admin.editor.save")}
        </Button>
      </div>
    </div>
  );
}

function ConfirmDelete({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="bg-biftu-ink/50 fixed inset-0 z-[95] backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="fixed inset-x-4 top-1/2 z-[100] mx-auto max-w-sm -translate-y-1/2 rounded-[22px] bg-white p-6 shadow-[0_24px_70px_rgba(14,47,99,.3)] sm:inset-x-auto sm:left-1/2 sm:-ml-[102px]"
      >
        <span className="bg-biftu-red-tint text-biftu-red grid h-11 w-11 place-items-center rounded-xl">
          <Trash2 className="h-5 w-5" />
        </span>
        <h3 className="font-display mt-4 text-[18px] leading-tight font-extrabold">{t("admin.confirm.title")}</h3>
        <p className="text-biftu-ink-soft mt-2 text-[13px] leading-snug">
          {t("admin.confirm.body", { name })}
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" full onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button full onClick={onConfirm} className="bg-biftu-red">
            {t("common.delete")}
          </Button>
        </div>
      </motion.div>
    </>
  );
}


