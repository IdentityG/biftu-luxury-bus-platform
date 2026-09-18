"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/hooks";
import { useRouter } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { AdminShell, canAccessAdminTab, type AdminTab } from "@/admin/AdminShell";
import {
  BookingsPanel,
  CustomersPanel,
  FleetPanel,
  LivePanel,
  OfficesPanel,
  OverviewPanel,
  ReportsPanel,
  RoutesPanel,
  SettingsPanel,
  TripsPanel,
  VerifyPanel,
} from "@/admin/panels";
import { Button, Icon } from "@/components/ui";

const TITLES: Record<AdminTab, { titleKey: string; subKey: string }> = {
  overview: { titleKey: "admin.nav.overview", subKey: "admin.sub.overview" },
  live: { titleKey: "admin.nav.live", subKey: "admin.sub.live" },
  verify: { titleKey: "admin.nav.verify", subKey: "admin.sub.verify" },
  trips: { titleKey: "admin.nav.trips", subKey: "admin.sub.trips" },
  bookings: { titleKey: "admin.nav.bookings", subKey: "admin.sub.bookings" },
  fleet: { titleKey: "admin.nav.fleet", subKey: "admin.sub.fleet" },
  routes: { titleKey: "admin.nav.routes", subKey: "admin.sub.routes" },
  customers: { titleKey: "admin.nav.customers", subKey: "admin.sub.customers" },
  offices: { titleKey: "admin.nav.offices", subKey: "admin.sub.offices" },
  reports: { titleKey: "admin.nav.reports", subKey: "admin.sub.reports" },
  settings: { titleKey: "admin.nav.settings", subKey: "admin.sub.settings" },
};

export function Admin() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { profile, setRole } = useStore();
  const [tab, setTab] = useState<AdminTab>("overview");

  useEffect(() => {
    if (profile.role !== "customer" && !canAccessAdminTab(profile.role, tab)) {
      setTab("overview");
    }
  }, [profile.role, tab]);

  if (profile.role === "customer") {
    return (
      <div className="from-biftu-blue-dark to-biftu-blue grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br px-5 py-24">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="border-white/15 bg-white/[0.08] overflow-hidden rounded-[28px] border p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            <div className="stripe-motif pointer-events-none absolute -top-10 -right-10 h-40 w-40 rotate-12 opacity-25" />
            <span className="bg-biftu-red relative z-10 grid h-12 w-12 place-items-center rounded-2xl">
              <Icon name="shield" className="h-6 w-6" />
            </span>
            <h1 className="font-display relative z-10 mt-5 text-[27px] leading-tight font-extrabold tracking-[-0.02em]">{t("admin.gate.title")}</h1>
            <p className="text-white/70 relative z-10 mt-2.5 text-[14px] leading-relaxed">{t("admin.gate.subtitle")}</p>
            <div className="relative z-10 mt-7 space-y-2.5">
              {(["admin", "agent"] as const).map((r) => (
                <Button key={r} full size="lg" variant={r === "admin" ? "red" : "white"} onClick={() => setRole(r)}>
                  {t("admin.gate.signInAs")} {r === "admin" ? "Administrator" : "Agent"}
                </Button>
              ))}
              <button onClick={() => navigate("/account")} className="text-white/70 hover:text-white relative z-10 w-full py-2 text-[13px] font-bold transition">
                {t("nav.account")} →
              </button>
            </div>
            <div className="border-white/10 relative z-10 mt-6 flex items-center justify-between border-t pt-4 text-[11px] font-bold text-white/50">
              <span>Phone OTP · RLS guarded</span>
              <span className="flex items-center gap-1.5">
                <span className="bg-emerald-400 h-1.5 w-1.5 animate-pulse rounded-full" /> control room live
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const meta = TITLES[tab];

  return (
    <AdminShell
      tab={tab}
      onTab={(next) => {
        if (canAccessAdminTab(profile.role, next)) setTab(next);
      }}
      title={t(meta.titleKey)}
      subtitle={t(meta.subKey)}
      actions={
        <>
          <Button size="sm" variant="white" onClick={() => setTab("verify")}>
            <Icon name="ticket" className="h-4 w-4" /> {t("admin.nav.verify")}
          </Button>
          <Button size="sm" onClick={() => navigate("/book/search")}>
            + {t("admin.actions.manualBooking")}
          </Button>
        </>
      }
    >
      {tab === "overview" && (
        <OverviewPanel
          onJump={(x) => {
            const next = x as AdminTab;
            setTab(canAccessAdminTab(profile.role, next) ? next : "overview");
          }}
        />
      )}
      {tab === "live" && <LivePanel />}
      {tab === "verify" && <VerifyPanel />}
      {tab === "trips" && <TripsPanel />}
      {tab === "bookings" && <BookingsPanel />}
      {tab === "fleet" && <FleetPanel />}
      {tab === "routes" && <RoutesPanel />}
      {tab === "customers" && <CustomersPanel />}
      {tab === "offices" && <OfficesPanel />}
      {tab === "reports" && <ReportsPanel />}
      {tab === "settings" && <SettingsPanel />}
    </AdminShell>
  );
}
