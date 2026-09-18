import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/messages";

type RouteCtx = {
  locale: Locale;
  segments: string[]; // after the locale
  path: string; // e.g. "/routes"
  query: Record<string, string>;
  navigate: (path: string, query?: Record<string, string | number | undefined>) => void;
  setLocale: (l: Locale) => void;
};

const Ctx = createContext<RouteCtx | null>(null);

const LOCALE_CODES = ["en", "am", "om"];

function parseHash(): { locale: Locale; path: string; query: Record<string, string> } {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  let locale: Locale = "en";
  if (parts.length && LOCALE_CODES.includes(parts[0])) {
    locale = parts.shift() as Locale;
  } else {
    const stored = localStorage.getItem("NEXT_LOCALE");
    const nav = navigator.language?.slice(0, 2);
    if (stored && LOCALE_CODES.includes(stored)) locale = stored as Locale;
    else if (nav && LOCALE_CODES.includes(nav)) locale = nav as Locale;
  }
  const query: Record<string, string> = {};
  new URLSearchParams(queryPart || "").forEach((v, k) => (query[k] = v));
  return { locale, path: "/" + parts.join("/"), query };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setState(parseHash());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = `#/${state.locale}`;
    return () => window.removeEventListener("hashchange", onHash);
  }, []); // eslint-disable-line

  useEffect(() => {
    localStorage.setItem("NEXT_LOCALE", state.locale);
    document.documentElement.lang = state.locale;
  }, [state.locale]);

  const navigate = useCallback(
    (path: string, query?: Record<string, string | number | undefined>) => {
      const qs = query
        ? Object.entries(query)
            .filter(([, v]) => v !== undefined && v !== "")
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
            .join("&")
        : "";
      const cur = parseHash();
      window.location.hash = `#/${cur.locale}${path === "/" ? "" : path}${qs ? "?" + qs : ""}`;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    [],
  );

  const setLocale = useCallback((l: Locale) => {
    const cur = parseHash();
    const qs = Object.entries(cur.query)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    window.location.hash = `#/${l}${cur.path === "/" ? "" : cur.path}${qs ? "?" + qs : ""}`;
  }, []);

  const value = useMemo<RouteCtx>(
    () => ({
      locale: state.locale,
      segments: state.path.split("/").filter(Boolean),
      path: state.path,
      query: state.query,
      navigate,
      setLocale,
    }),
    [state, navigate, setLocale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRouter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRouter outside provider");
  return ctx;
}
