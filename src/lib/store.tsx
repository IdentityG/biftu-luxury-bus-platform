"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BusClass } from "./data";

export type Passenger = { fullName: string; phone: string; gender: string; idNumber: string; seat: string };

export type Booking = {
  ref: string;
  tripId: string;
  routeId: string;
  busClass: BusClass;
  departure: string;
  seats: string[];
  passengers: Passenger[];
  total: number;
  locale: string;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: string;
  method: string;
  checkedIn?: boolean;
  /** "transfer" = proof uploaded, awaiting ops review · "on_arrival" = pay at the office/gate */
  settlement?: "transfer" | "on_arrival";
  /** data-URL of the uploaded bank/Telebirr receipt (demo: kept on-device) */
  proof?: string;
  proofName?: string;
  payStatus?: "pending_review" | "due_on_arrival" | "paid";
};

type Draft = {
  tripId?: string;
  seats: string[];
  passengers: Passenger[];
  holdUntil?: number;
};

export type AdminBus = {
  id: string;
  plate: string;
  class: BusClass;
  name: { en: string; am: string; om: string };
  description: { en: string; am: string; om: string };
  amenities: string[];
  totalSeats: number;
  active: boolean;
};

export type AdminRoute = {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  durationMinutes: number;
  basePrice: number;
  active: boolean;
  origin: { en: string; am: string; om: string };
  destination: { en: string; am: string; om: string };
};

export type Role = "customer" | "agent" | "admin";
export type Profile = { fullName: string; phone: string; email: string; preferredLocale: string; role: Role };

type StoreValue = {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (ref: string) => void;
  updateBooking: (ref: string, patch: Partial<Booking>) => void;
  adminBuses: AdminBus[];
  setAdminBuses: React.Dispatch<React.SetStateAction<AdminBus[]>>;
  adminRoutes: AdminRoute[];
  setAdminRoutes: React.Dispatch<React.SetStateAction<AdminRoute[]>>;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  setRole: (r: Role) => void;
  savedPassengers: Omit<Passenger, "seat">[];
  addSavedPassenger: (p: Omit<Passenger, "seat">) => void;
  removeSavedPassenger: (idNumber: string) => void;
};

const Ctx = createContext<StoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const SEED_BUSES: AdminBus[] = [
  { id: "vip", plate: "3-A4VIP22", class: "vip", name: { en: "VIP Lounge", am: "ቪአይፒ ላውንጅ", om: "VIP Lounge" }, description: { en: "27 seats, 140° recline, seat-back screens.", am: "27 ወንበር፣ 140° ማጠፊያ፣ የወንበር ስክሪን።", om: "Barcumoota 27, dabsamu 140°." }, amenities: ["recline", "ac", "usb", "screen", "wifi", "snack"], totalSeats: 27, active: true },
  { id: "business", plate: "3-B4BSN17", class: "business", name: { en: "Business", am: "ቢዝነስ", om: "Business" }, description: { en: "39 wide seats with USB.", am: "39 ሰፊ ወንበሮች።", om: "Barcumoota bal'aa 39." }, amenities: ["recline", "ac", "usb", "snack"], totalSeats: 39, active: true },
  { id: "standard", plate: "3-S4STD03", class: "standard", name: { en: "Standard", am: "ስታንዳርድ", om: "Standard" }, description: { en: "47 comfortable seats.", am: "47 ምቹ ወንበሮች።", om: "Barcumoota mijataa 47." }, amenities: ["ac", "usb"], totalSeats: 47, active: true },
];

const SEED_ROUTES: AdminRoute[] = [
  { id: "r1", from: "addis", to: "hawassa", distanceKm: 275, durationMinutes: 300, basePrice: 1100, active: true, origin: { en: "Addis Ababa", am: "አዲስ አበባ", om: "Finfinnee" }, destination: { en: "Hawassa", am: "ሀዋሳ", om: "Hawaasaa" } },
  { id: "r2", from: "addis", to: "sodo", distanceKm: 330, durationMinutes: 390, basePrice: 1250, active: true, origin: { en: "Addis Ababa", am: "አዲስ አበባ", om: "Finfinnee" }, destination: { en: "Wolayta Sodo", am: "ወላይታ ሶዶ", om: "Wolayitaa Sodoo" } },
  { id: "r3", from: "addis", to: "diredawa", distanceKm: 445, durationMinutes: 480, basePrice: 1550, active: true, origin: { en: "Addis Ababa", am: "አዲስ አበባ", om: "Finfinnee" }, destination: { en: "Dire Dawa", am: "ድሬዳዋ", om: "Dirre Dhawaa" } },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>({ seats: [], passengers: [] });
  const [bookings, setBookings] = useState<Booking[]>(() => load("biftu.bookings", [] as Booking[]));
  const [adminBuses, setAdminBuses] = useState<AdminBus[]>(() => load("biftu.buses", SEED_BUSES));
  const [adminRoutes, setAdminRoutes] = useState<AdminRoute[]>(() => load("biftu.routes", SEED_ROUTES));
  const [profile, setProfile] = useState<Profile>(() =>
    load("biftu.profile", {
      fullName: "Selam Bekele",
      phone: "+251 911 220 118",
      email: "selam@example.com",
      preferredLocale: "en",
      role: "customer" as Role,
    }),
  );
  const [savedPassengers, setSavedPassengers] = useState<Omit<Passenger, "seat">[]>(() =>
    load("biftu.passengers", [
      { fullName: "Selam Bekele", phone: "+251 911 220 118", gender: "female", idNumber: "ET-2291045" },
      { fullName: "Naol Bekele", phone: "+251 912 665 004", gender: "male", idNumber: "ET-8830127" },
    ]),
  );

  useEffect(() => localStorage.setItem("biftu.bookings", JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem("biftu.buses", JSON.stringify(adminBuses)), [adminBuses]);
  useEffect(() => localStorage.setItem("biftu.routes", JSON.stringify(adminRoutes)), [adminRoutes]);
  useEffect(() => localStorage.setItem("biftu.profile", JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem("biftu.passengers", JSON.stringify(savedPassengers)), [savedPassengers]);

  const value = useMemo<StoreValue>(
    () => ({
      draft,
      setDraft,
      bookings,
      addBooking: (b) => setBookings((prev) => [b, ...prev]),
      cancelBooking: (ref) => setBookings((prev) => prev.map((b) => (b.ref === ref ? { ...b, status: "cancelled" } : b))),
      updateBooking: (ref, patch) =>
        setBookings((prev) => prev.map((b) => (b.ref === ref ? { ...b, ...patch } : b))),
      adminBuses,
      setAdminBuses,
      adminRoutes,
      setAdminRoutes,
      profile,
      setProfile,
      setRole: (role) => setProfile((p) => ({ ...p, role })),
      savedPassengers,
      addSavedPassenger: (p) => setSavedPassengers((prev) => [...prev, p]),
      removeSavedPassenger: (idNumber) => setSavedPassengers((prev) => prev.filter((p) => p.idNumber !== idNumber)),
    }),
    [draft, bookings, adminBuses, adminRoutes, profile, savedPassengers],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

export { slug };
