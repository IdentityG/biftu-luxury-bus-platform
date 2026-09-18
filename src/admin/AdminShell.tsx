import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  Bus,
  CalendarClock,
  ChevronLeft,
  ExternalLink,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Route as RouteIcon,
  ScanLine,
  Server,
  Settings,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useI18n, useRouter } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { LIVE_FLEET, routeFor } from "@/lib/data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui";
import { cn } from "@/utils/cn";

export type AdminTab =
  | "overview"
  | "live"
  | "verify"
  | "trips"
  | "bookings"
  | "fleet"
  | "routes"
  | "customers"
  | "offices"
  | "reports"
  | "settings";

export const ROLE_TABS: Record<"admin" | "agent", AdminTab[]> = {
  admin: ["overview", "live", "verify", "trips", "bookings", "fleet", "routes", "customers", "offices", "reports", "settings"],
  agent: ["overview", "live", "verify", "trips", "bookings", "customers"],
};

export function canAccessAdminTab(role: string, tab: AdminTab) {
  return role === "admin" || (role === "agent" && ROLE_TABS.agent.includes(tab));
}

const GROUPS: { label: string; items: { id: AdminTab; key: string; icon: typeof Gauge }[] }[] = [
  {
    label: "Command",
    items: [
      { id: "overview", key: "admin.nav.overview", icon: LayoutDashboard },
      { id: "live", key: "admin.nav.live", icon: Gauge },
      { id: "verify", key: "admin.nav.verify", icon: ScanLine },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "trips", key: "admin.nav.trips", icon: CalendarClock },
      { id: "bookings", key: "admin.nav.bookings", icon: Ticket },
      { id: "customers", key: "admin.nav.customers", icon: Users },
    ],
  },
  {
    label: "Network",
    items: [
      { id: "fleet", key: "admin.nav.fleet", icon: Bus },
      { id: "routes", key: "admin.nav.routes", icon: RouteIcon },
      { id: "offices", key: "admin.nav.offices", icon: Building2 },
    ],
  },
  {
    label: "Insight",
    items: [
      { id: "reports", key: "admin.nav.reports", icon: BarChart3 },
      { id: "settings", key: "admin.nav.settings", icon: Settings },
    ],
  },
];

export function AdminShell({
  tab,
  onTab,
  title,
  subtitle,
  actions,
  children,
}: {
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { profile, setRole, bookings } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  // Hydrate collapsed state after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("biftu.admin.collapsed");
      if (stored === "1") setCollapsed(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("biftu.admin.collapsed", collapsed ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, [collapsed, mounted]);

  // live console clock — keeps the shell feeling alive
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => ({ bookings: bookings.length, live: LIVE_FLEET.length }), [bookings]);

  const width = collapsed ? 84 : 264;
  const nav = (
    <SidebarContent
      collapsed={collapsed}
      onCollapse={() => setCollapsed((c) => !c)}
      tab={tab}
      onTab={(id) => {
        onTab(id);
        setDrawer(false);
      }}
      counts={counts}
      role={profile.role}
      profile={profile.fullName}
      onExit={() => {
        setRole("customer");
        navigate("/account");
      }}
    />
  );

  return (
    <div className="bg-biftu-paper min-h-screen">
      {/* desktop: fixed so it can never scroll away from the viewport */}
      <aside
        style={{ width }}
        className="from-biftu-blue-dark to-biftu-blue fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden bg-gradient-to-b transition-[width] duration-300 ease-out lg:flex"
      >
        <div className="stripe-motif pointer-events-none absolute inset-y-0 -right-24 w-40 opacity-[0.18]" />
        <div className="relative z-10 flex h-full flex-col">{nav}</div>
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="bg-biftu-ink/50 fixed inset-0 z-[60] backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="from-biftu-blue-dark to-biftu-blue fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col overflow-hidden bg-gradient-to-b lg:hidden"
            >
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main column */}
      <div className="min-h-screen bg-biftu-paper">
        <ResponsivePad width={width}>
          <header className="border-b/8 bg-white/85 border-biftu-border sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b px-4 py-3 backdrop-blur-xl md:px-8">
            <button onClick={() => setDrawer(true)} className="border-biftu-border text-biftu-ink hover:bg-biftu-paper grid h-10 w-10 place-items-center rounded-xl border transition lg:hidden">
              <Menu className="h-4.5 w-4.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-biftu-ink-soft flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                <span className="bg-emerald-500 h-1.5 w-1.5 animate-pulse rounded-full" />
                {profile.role === "agent" ? t("admin.agentTitle") : t("admin.title")}
                <ChevronLeft className="text-biftu-border h-3 w-3 rotate-180" />
                <span className="text-biftu-blue truncate">{title}</span>
              </div>
              <h1 className="font-display text-biftu-ink truncate text-[clamp(18px,2.2vw,25px)] leading-tight font-extrabold tracking-[-0.02em]">{subtitle}</h1>
            </div>

            <div className="ml-auto hidden items-center gap-3 xl:flex">
              <Ticker />
            </div>

            <div className="flex items-center gap-2">
              <span className="border-biftu-border text-biftu-ink-soft tnum hidden rounded-xl border bg-white px-3 py-2 text-[12px] font-bold md:block">
                {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                <span className="text-biftu-ink-soft/60 ml-1.5 text-[10px]">EAT</span>
              </span>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <NotifButton count={counts.bookings} onOpen={() => onTab("bookings")} />
              <button onClick={() => navigate("/")} className="border-biftu-border text-biftu-blue hover:bg-biftu-blue-tint hidden h-10 items-center gap-2 rounded-xl border bg-white px-3 text-[12.5px] font-bold transition sm:flex">
                <ExternalLink className="h-4 w-4" /> {t("admin.nav.site")}
              </button>
            </div>
            {actions && <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:justify-normal">{actions}</div>}
          </header>

      <div className="bg-biftu-paper min-h-full">
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="text-biftu-ink-soft px-4 pb-10 text-[11px] font-semibold md:px-8">
          Biftu Ops · {t("admin.footnote")}
        </footer>
      </div>
        </ResponsivePad>
      </div>
    </div>
  );
}

/* keeps padding correct across the lg breakpoint without hydration quirks */
function ResponsivePad({ width, children }: { width: number; children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return (
    <div ref={ref} style={{ paddingLeft: isDesktop ? width : 0 }} className="min-h-screen transition-[padding] duration-300">
      {children}
    </div>
  );
}

function SidebarContent({
  collapsed,
  onCollapse,
  tab,
  onTab,
  counts,
  role,
  profile,
  onExit,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  counts: { bookings: number; live: number };
  role: string;
  profile: string;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const visibleGroups = GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessAdminTab(role, item.id)),
  })).filter((group) => group.items.length > 0);
  return (
    <>
      <div className={cn("flex items-center gap-2.5 px-4 pt-5 pb-4", collapsed && "flex-col px-2")}>
        <button onClick={() => navigate("/")} className={cn("min-w-0 flex-1", collapsed && "flex-none")}>
          {collapsed ? (
            <span className="bg-biftu-red grid h-9 w-9 place-items-center rounded-[11px] font-display text-[15px] font-extrabold text-white">B</span>
          ) : (
            <Logo light />
          )}
        </button>
        {!collapsed ? (
          <span className="border-white/10 bg-white/[0.06] text-white/60 hover:bg-white/[0.12] flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[9px] font-extrabold tracking-widest uppercase transition">
            OPS
            <span className="bg-emerald-400 h-1.5 w-1.5 animate-pulse rounded-full" />
          </span>
        ) : null}
        <button
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="border-white/10 bg-white/[0.06] text-white/70 hover:bg-biftu-red hover:text-white hidden h-8 w-8 place-items-center rounded-lg border transition lg:grid"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="scroll-thin flex-1 space-y-5 overflow-y-auto px-3 pb-4" style={{ overscrollBehavior: "contain" }}>
        {visibleGroups.map((g) => (
          <div key={g.label}>
            {!collapsed && <div className="text-white/35 px-3 pb-2 text-[9.5px] font-extrabold tracking-[0.18em] uppercase">{g.label}</div>}
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = tab === it.id;
                const Icon = it.icon;
                return (
                  <button
                    key={it.id}
                    onClick={() => onTab(it.id)}
                    title={collapsed ? t(it.key) : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition",
                      active ? "text-white" : "text-white/55 hover:bg-white/[0.07] hover:text-white",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && (
                      <>
                        <motion.span layoutId="admin-nav-pill" transition={{ type: "spring", stiffness: 400, damping: 34 }} className="bg-biftu-red/18 absolute inset-0 rounded-xl ring-1 ring-biftu-red/40" />
                        <span className="bg-biftu-red absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
                      </>
                    )}
                    <Icon className={cn("relative z-10 h-4.5 w-4.5 shrink-0 transition", active ? "text-white" : "text-white/50 group-hover:text-white")} />
                    {!collapsed && <span className="relative z-10 truncate">{t(it.key)}</span>}
                    {!collapsed && it.id === "bookings" && counts.bookings > 0 && (
                      <span className="tnum bg-biftu-red relative z-10 ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-extrabold text-white">{counts.bookings}</span>
                    )}
                    {!collapsed && it.id === "live" && (
                      <span className="relative z-10 ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                        <span className="bg-emerald-400 h-1.5 w-1.5 animate-pulse rounded-full" /> {counts.live}
                      </span>
                    )}
                    {collapsed && it.id === "verify" && <span className="bg-biftu-red absolute top-1 right-1 h-1.5 w-1.5 rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-white/10 space-y-2 border-t p-3">
        {!collapsed && (
          <div className="border-white/10 bg-white/[0.04] flex items-center gap-2 rounded-xl border px-3 py-2">
            <Server className="text-emerald-300 h-3.5 w-3.5 shrink-0" />
            <span className="text-white/60 flex-1 text-[10px] font-bold tracking-wide uppercase">Supabase · RLS enforced</span>
            <span className="bg-emerald-400 pulse-dot h-1.5 w-1.5 rounded-full" />
          </div>
        )}
        {!collapsed ? (
          <div className="bg-white/[0.06] rounded-xl p-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-biftu-red grid h-9 w-9 place-items-center rounded-lg font-extrabold text-white">{profile.slice(0, 1) || "A"}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-extrabold text-white">{role === "agent" ? "Agent console" : "Hanna Girma"}</div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> {role.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <button onClick={() => navigate("/account")} className="flex-1 rounded-lg bg-white/10 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20">
                {t("nav.account")}
              </button>
              <button onClick={onExit} className="grid h-7 w-8 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-biftu-red" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="bg-biftu-red grid h-8 w-8 place-items-center rounded-lg text-[12px] font-extrabold text-white">H</span>
            <button onClick={onExit} aria-label="Sign out" className="text-white/60 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Ticker() {
  const lines = useMemo(
    () =>
      LIVE_FLEET.map((b) => {
        const r = routeFor(b.routeId);
        const routeName = r ? `${r.from}→${r.to}` : b.routeId;
        return `${b.call} · ${routeName} · ${b.status === "delayed" ? "+" + b.delayMin + "m late" : Math.round(b.progress * 100) + "% done"} · ${Math.round(b.occupancy * 100)}% full`;
      }).join("      •      "),
    [],
  );
  return (
    <div className="border-biftu-border bg-biftu-paper relative h-9 w-[300px] overflow-hidden rounded-xl border">
      <div className="bg-biftu-blue absolute inset-y-0 left-0 z-10 flex items-center gap-1.5 px-2.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
        <TrendingUp className="h-3 w-3" /> live
      </div>
      <div className="animate-ticker tnum absolute inset-y-0 left-16 flex items-center whitespace-nowrap text-[11px] font-bold text-biftu-ink-soft">
        {lines}
      </div>
    </div>
  );
}

function NotifButton({ count, onOpen }: { count: number; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const items = [
    { tone: "red", text: `BFT-BUS-19 delayed 35 min — Robe corridor`, icon: Wrench },
    { tone: "blue", text: `${count} new booking${count === 1 ? "" : "s"} in the last hour`, icon: Ticket },
    { tone: "green", text: "Seat-hold sweeper healthy · 0 stale holds", icon: LifeBuoy },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="border-biftu-border text-biftu-ink-soft hover:bg-biftu-paper relative grid h-10 w-10 place-items-center rounded-xl border bg-white transition" aria-label="Notifications">
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && <span className="bg-biftu-red absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-white" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} className="border-biftu-border shadow-card-hover absolute right-0 z-50 mt-2 w-[300px] overflow-hidden rounded-2xl border bg-white">
            <div className="border-biftu-border flex items-center justify-between border-b px-4 py-2.5">
              <span className="text-[12px] font-extrabold">Alerts</span>
              <button onClick={() => setOpen(false)} className="text-biftu-ink-soft hover:text-biftu-ink"><X className="h-3.5 w-3.5" /></button>
            </div>
            {items.map((it) => (
              <div key={it.text} className="border-biftu-border hover:bg-biftu-paper flex items-start gap-2.5 border-b px-4 py-3 last:border-0 transition">
                <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg", it.tone === "red" ? "bg-biftu-red-tint text-biftu-red" : it.tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-biftu-blue-tint text-biftu-blue")}>
                  <it.icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-biftu-ink text-[12px] leading-snug font-semibold">{it.text}</p>
              </div>
            ))}
            <button onClick={() => { setOpen(false); onOpen(); }} className="bg-biftu-blue w-full py-2.5 text-[12px] font-bold text-white transition hover:bg-biftu-blue-dark">
              Open bookings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


