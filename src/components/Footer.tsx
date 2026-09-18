"use client";

import { useI18n, useRouter } from "@/lib/hooks";
import { OFFICES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Icon, Logo } from "./ui";

export function Footer() {
  const { t, tj } = useI18n();
  const { navigate } = useRouter();
  const { profile } = useStore();

  const explore = [
    { k: "nav.home", p: "/" },
    { k: "nav.routes", p: "/routes" },
    { k: "nav.fleet", p: "/fleet" },
    { k: "nav.track", p: "/track" },
    { k: "nav.about", p: "/about" },
  ];

  return (
    <footer className="bg-biftu-blue-dark relative overflow-hidden text-white">
      <div className="stripe-motif pointer-events-none absolute -top-10 right-0 h-40 w-[45%] opacity-25" />
      <div className="container-biftu relative z-10 grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/70">{t("footer.tagline")}</p>
          <a href="tel:8477" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-[14px] font-bold">
            <Icon name="phone" className="h-4 w-4" /> 8477
          </a>
        </div>
        <div>
          <h4 className="text-[12px] font-bold tracking-[0.12em] text-white/50 uppercase">{t("footer.explore")}</h4>
          <ul className="mt-4 space-y-3">
            {explore.map((e) => (
              <li key={e.p}>
                <button onClick={() => navigate(e.p)} className="text-[14px] text-white/80 transition hover:text-white">
                  {t(e.k)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[12px] font-bold tracking-[0.12em] text-white/50 uppercase">{t("footer.support")}</h4>
          <ul className="mt-4 space-y-3 text-[14px] text-white/80">
            <li>
              <button onClick={() => navigate("/account")} className="transition hover:text-white">
                {t("nav.account")}
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/admin")} className="flex items-center gap-2 transition hover:text-white">
                {t("admin.title")}
                <span className="bg-biftu-red rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {profile.role}
                </span>
              </button>
            </li>
            <li>{t("footer.terms")}</li>
            <li>{t("footer.refunds")}</li>
            <li>{t("footer.privacy")}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-[12px] font-bold tracking-[0.12em] text-white/50 uppercase">{t("about.offices.title")}</h4>
          <ul className="mt-4 space-y-4 text-[13px] text-white/75">
            {OFFICES.slice(0, 3).map((o) => (
              <li key={o.id}>
                <div className="font-bold text-white">{tj(o.name)}</div>
                <div>{tj(o.address)}</div>
                <div className="tnum text-white/60">{o.phone}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-biftu relative z-10 flex flex-col gap-3 border-t border-white/10 py-6 text-[12px] text-white/50 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Biftu Luxury Bus S.C. — {t("footer.rights")}</span>
        <span className="flex gap-4">
          <a href="#" className="hover:text-white">Facebook</a>
          <a href="#" className="hover:text-white">Telegram</a>
          <a href="#" className="hover:text-white">TikTok</a>
          <a href="#" className="hover:text-white">Instagram</a>
        </span>
      </div>
    </footer>
  );
}
