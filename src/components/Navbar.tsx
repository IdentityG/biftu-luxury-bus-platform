"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n, useRouter } from "@/lib/hooks";
import { cn } from "@/utils/cn";
import { Button, Icon, Logo } from "./ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccountMenu } from "./AccountMenu";
import { useStore } from "@/lib/store";

const LINKS = [
  { path: "/", key: "nav.home" },
  { path: "/routes", key: "nav.routes" },
  { path: "/fleet", key: "nav.fleet" },
  { path: "/track", key: "nav.track" },
  { path: "/about", key: "nav.about" },
];

export function Navbar({ overHero }: { overHero: boolean }) {
  const { t } = useI18n();
  const { path, navigate } = useRouter();
  const { profile, setRole, bookings } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isStaff = profile.role === "admin" || profile.role === "agent";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  const solid = !overHero || scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "bg-white/92 shadow-[0_2px_20px_rgba(14,47,99,0.08)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="container-biftu flex items-center justify-between gap-6 py-4 lg:py-5">
          <button onClick={() => navigate("/")} aria-label="Biftu home">
            <Logo light={!solid} />
          </button>

          <nav className="hidden items-center gap-7 xl:flex">
            {LINKS.map((l) => {
              const active = path === l.path;
              return (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className={cn(
                    "relative py-1 text-[14px] font-semibold whitespace-nowrap transition-colors",
                    solid
                      ? active
                        ? "text-biftu-blue"
                        : "text-biftu-ink-soft hover:text-biftu-blue"
                      : active
                        ? "text-white"
                        : "text-white/85 hover:text-white",
                  )}
                >
                  {t(l.key)}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className={cn("absolute -bottom-1 left-0 h-[2px] w-full", solid ? "bg-biftu-blue" : "bg-white")}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitcher hero={!solid} />
            </div>
            <div className="hidden lg:block">
              <AccountMenu solid={solid} />
            </div>
            <Button size="sm" onClick={() => navigate("/book/search")} className="whitespace-nowrap">
              {t("nav.bookNow")}
            </Button>
            <button
              onClick={() => setOpen(true)}
              aria-label={t("nav.menu")}
              className={cn("grid h-10 w-10 place-items-center rounded-xl xl:hidden", solid ? "text-biftu-ink" : "text-white")}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-biftu-ink/40 backdrop-blur-sm xl:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 right-0 flex w-[86vw] max-w-sm flex-col gap-6 bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} aria-label="Close" className="text-biftu-ink-soft">
                  <Icon name="close" />
                </button>
              </div>
              <LanguageSwitcher block />
              <nav className="flex flex-col">
                {LINKS.map((l) => (
                  <button
                    key={l.path}
                    onClick={() => navigate(l.path)}
                    className={cn(
                      "border-biftu-border border-b py-4 text-left text-[16px] font-bold",
                      path === l.path ? "text-biftu-blue" : "text-biftu-ink",
                    )}
                  >
                    {t(l.key)}
                  </button>
                ))}
                <button onClick={() => navigate("/account")} className="border-biftu-border text-biftu-ink flex items-center justify-between border-b py-4 text-left text-[16px] font-bold">
                  {t("nav.account")}
                  <span className="bg-biftu-blue-tint text-biftu-blue rounded-full px-2 py-0.5 text-[10px] font-extrabold">
                    {bookings.length}
                  </span>
                </button>
                {isStaff && (
                  <button onClick={() => navigate("/admin")} className="border-biftu-border text-biftu-ink flex items-center justify-between border-b py-4 text-left text-[16px] font-bold">
                    {t("admin.title")}
                    <span className="bg-biftu-red rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                      {profile.role}
                    </span>
                  </button>
                )}
              </nav>
              <div className="bg-biftu-paper rounded-2xl p-3">
                <div className="text-biftu-ink-soft mb-2 text-[10px] font-bold tracking-wider uppercase">
                  {t("nav.language")} / role demo
                </div>
                <div className="flex gap-1.5">
                  {(["customer", "agent", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        if (r !== "customer") setTimeout(() => navigate("/admin"), 200);
                      }}
                      className={cn(
                        "flex-1 rounded-lg px-2 py-2 text-[11px] font-bold capitalize transition",
                        profile.role === r ? "bg-biftu-blue text-white" : "bg-white text-biftu-ink-soft",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <Button full onClick={() => navigate("/book/search")}>
                {t("nav.bookNow")}
              </Button>
              <a href="tel:8477" className="text-biftu-blue mt-auto flex items-center gap-2 text-[14px] font-bold">
                <Icon name="phone" /> {t("common.callCenter")}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
