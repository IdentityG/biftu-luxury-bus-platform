export type TL = Record<string, string>;

export type City = { id: string; name: TL; lat: number; lng: number };

export const CITIES: City[] = [
  { id: "addis", name: { en: "Addis Ababa", am: "አዲስ አበባ", om: "Finfinnee" }, lat: 9.03, lng: 38.74 },
  { id: "hawassa", name: { en: "Hawassa", am: "ሀዋሳ", om: "Hawaasaa" }, lat: 7.06, lng: 38.48 },
  { id: "hosaina", name: { en: "Hosaina", am: "ሆሳዕና", om: "Hoosaa'inaa" }, lat: 7.55, lng: 37.85 },
  { id: "sodo", name: { en: "Wolayta Sodo", am: "ወላይታ ሶዶ", om: "Wolayitaa Sodoo" }, lat: 6.9, lng: 37.75 },
  { id: "arbaminch", name: { en: "Arba Minch", am: "አርባ ምንጭ", om: "Arbaa Mincii" }, lat: 6.04, lng: 37.55 },
  { id: "robe", name: { en: "Robe", am: "ሮቤ", om: "Roobee" }, lat: 7.12, lng: 40.0 },
  { id: "harar", name: { en: "Harar", am: "ሐረር", om: "Harar" }, lat: 9.31, lng: 42.12 },
  { id: "diredawa", name: { en: "Dire Dawa", am: "ድሬዳዋ", om: "Dirre Dhawaa" }, lat: 9.6, lng: 41.86 },
  { id: "jijiga", name: { en: "Jijiga", am: "ጅጅጋ", om: "Jigjiga" }, lat: 9.35, lng: 42.79 },
  { id: "negelle", name: { en: "Negelle Borena", am: "ነገሌ ቦረና", om: "Nageellee Booranaa" }, lat: 5.33, lng: 39.58 },
];

export const cityById = (id: string) => CITIES.find((c) => c.id === id)!;

export type BusClass = "vip" | "business" | "standard";

export type Route = {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  durationMinutes: number;
  basePrice: number;
  popular?: boolean;
};

export const ROUTES: Route[] = [
  { id: "r1", from: "addis", to: "hawassa", distanceKm: 275, durationMinutes: 300, basePrice: 1100, popular: true },
  { id: "r2", from: "addis", to: "sodo", distanceKm: 330, durationMinutes: 390, basePrice: 1250, popular: true },
  { id: "r3", from: "addis", to: "arbaminch", distanceKm: 445, durationMinutes: 510, basePrice: 1600, popular: true },
  { id: "r4", from: "addis", to: "diredawa", distanceKm: 445, durationMinutes: 480, basePrice: 1550, popular: true },
  { id: "r5", from: "addis", to: "harar", distanceKm: 515, durationMinutes: 540, basePrice: 1750, popular: true },
  { id: "r6", from: "addis", to: "jijiga", distanceKm: 625, durationMinutes: 660, basePrice: 2100, popular: true },
  { id: "r7", from: "addis", to: "hosaina", distanceKm: 232, durationMinutes: 270, basePrice: 950 },
  { id: "r8", from: "addis", to: "robe", distanceKm: 430, durationMinutes: 480, basePrice: 1500 },
  { id: "r9", from: "addis", to: "negelle", distanceKm: 600, durationMinutes: 660, basePrice: 1950 },
  { id: "r10", from: "hawassa", to: "arbaminch", distanceKm: 270, durationMinutes: 300, basePrice: 900 },
  { id: "r11", from: "sodo", to: "arbaminch", distanceKm: 125, durationMinutes: 150, basePrice: 520 },
  { id: "r12", from: "hawassa", to: "sodo", distanceKm: 145, durationMinutes: 180, basePrice: 600 },
  { id: "r13", from: "diredawa", to: "jijiga", distanceKm: 180, durationMinutes: 200, basePrice: 700 },
  { id: "r14", from: "hawassa", to: "negelle", distanceKm: 400, durationMinutes: 450, basePrice: 1300 },
];

export type FleetClass = {
  id: BusClass;
  name: TL;
  description: TL;
  priceFactor: number;
  rows: number;
  config: "2-1" | "2-2";
  amenities: string[];
  legroom: string;
};

export const FLEET: FleetClass[] = [
  {
    id: "vip",
    name: { en: "VIP Lounge", am: "ቪአይፒ ላውንጅ", om: "VIP Lounge" },
    description: {
      en: "27 seats in a 2-1 layout, 140° recline, seat-back screens and hot refreshments.",
      am: "27 ወንበሮች በ2-1 አቀማመጥ፣ 140° ማጠፊያ፣ የወንበር ስክሪንና ሙቅ መጠጥ።",
      om: "Barcumoota 27 caasaa 2-1, 140° dabsamu, iskiriinii fi dhugaatii ho'aa.",
    },
    priceFactor: 1.45,
    rows: 9,
    config: "2-1",
    amenities: ["recline", "ac", "usb", "screen", "wifi", "snack"],
    legroom: "92 cm",
  },
  {
    id: "business",
    name: { en: "Business", am: "ቢዝነስ", om: "Business" },
    description: {
      en: "39 wide seats, 2-2 layout, USB at every seat and bottled water on board.",
      am: "39 ሰፊ ወንበሮች፣ 2-2 አቀማመጥ፣ በእያንዳንዱ ወንበር USB።",
      om: "Barcumoota bal'aa 39, caasaa 2-2, barcuma hundatti USB.",
    },
    priceFactor: 1.15,
    rows: 10,
    config: "2-2",
    amenities: ["recline", "ac", "usb", "snack"],
    legroom: "84 cm",
  },
  {
    id: "standard",
    name: { en: "Standard", am: "ስታንዳርድ", om: "Standard" },
    description: {
      en: "47 comfortable seats, air-conditioned, the best value on every corridor.",
      am: "47 ምቹ ወንበሮች፣ በኤሲ የተደገፈ፣ በሁሉም መስመር ምርጥ ዋጋ።",
      om: "Barcumoota mijataa 47, AC qabu, gatii gaarii.",
    },
    priceFactor: 1,
    rows: 12,
    config: "2-2",
    amenities: ["ac", "usb"],
    legroom: "78 cm",
  },
];

export const AMENITY_LABEL: Record<string, TL> = {
  recline: { en: "Reclining seats", am: "ተጠማዘዥ ወንበር", om: "Barcuma dabsamu" },
  ac: { en: "Air conditioning", am: "ኤር ኮንዲሽን", om: "Qilleensa qabbaneessaa" },
  usb: { en: "USB charging", am: "USB ቻርጅ", om: "USB chaarjii" },
  screen: { en: "Entertainment", am: "መዝናኛ", om: "Bashannana" },
  wifi: { en: "Onboard Wi-Fi", am: "ዋይፋይ", om: "Wi-Fi" },
  snack: { en: "Refreshments", am: "መክሰስ", om: "Dhugaatii" },
};

export type Office = { id: string; city: string; name: TL; address: TL; phone: string };

export const OFFICES: Office[] = [
  {
    id: "o1",
    city: "sodo",
    name: { en: "Wolaita Sodo Main Office", am: "ወላይታ ሶዶ ዋና ቢሮ", om: "Waajjira Guddaa Wolayitaa Sodoo" },
    address: { en: "Near Abebe Zeleke Hotel, Sodo", am: "ከአበበ ዘለቀ ሆቴል አጠገብ፣ ሶዶ", om: "Hoteela Abebe Zeleke cinaa, Sodoo" },
    phone: "+251 943 822 619",
  },
  {
    id: "o2",
    city: "addis",
    name: { en: "Addis Ababa — Meskel Square", am: "አዲስ አበባ — መስቀል አደባባይ", om: "Finfinnee — Masqala" },
    address: { en: "Meskel Square, behind Dembel City Center", am: "መስቀል አደባባይ፣ ከደምበል ጀርባ", om: "Masqala, Dembel duubaan" },
    phone: "8477",
  },
  {
    id: "o3",
    city: "hawassa",
    name: { en: "Hawassa Terminal Office", am: "ሀዋሳ ተርሚናል ቢሮ", om: "Waajjira Teerminaalaa Hawaasaa" },
    address: { en: "Piazza, opposite the main bus terminal", am: "ፒያሳ፣ ከዋናው ተርሚናል ፊት ለፊት", om: "Piyaassaa, teerminaala fuulduraa" },
    phone: "+251 916 440 118",
  },
  {
    id: "o4",
    city: "diredawa",
    name: { en: "Dire Dawa Office", am: "ድሬዳዋ ቢሮ", om: "Waajjira Dirre Dhawaa" },
    address: { en: "Kezira, Ashewa Road", am: "ከዚራ፣ አሸዋ መንገድ", om: "Kezira, Daandii Ashewa" },
    phone: "+251 925 771 004",
  },
];

export type Testimonial = { id: string; author: string; city: string; rating: number; quote: TL };

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    author: "Selam Bekele",
    city: "Addis Ababa",
    rating: 5,
    quote: {
      en: "I booked from my phone in Amharic in under two minutes, and the bus left Meskel Square exactly on time. The seat was wider than my last flight.",
      am: "በአማርኛ ከስልኬ በሁለት ደቂቃ ውስጥ ያዝኩ፤ አውቶብሱም በትክክለኛው ሰዓት ተነሳ። ወንበሩ ካለፈው በረራዬ ይሰፋል።",
      om: "Afaan Amaariffaan daqiiqaa lama keessatti qabadhe, konkolaataanis yeroodhaan ka'e. Barcumni bal'aa ture.",
    },
  },
  {
    id: "t2",
    author: "Getachew Tolla",
    city: "Wolayta Sodo",
    rating: 5,
    quote: {
      en: "Tracking the bus meant my family knew exactly when to meet me in Sodo. That alone is worth switching for.",
      am: "አውቶብሱን መከታተል በመቻሌ ቤተሰቤ መቼ እንደምደርስ ያውቅ ነበር። ለዚህ ብቻ እንኳ ይበቃል።",
      om: "Konkolaataa hordofuun koo maatiin koo yeroo ani ga'u akka beeku taasise.",
    },
  },
  {
    id: "t3",
    author: "Amina Yusuf",
    city: "Dire Dawa",
    rating: 4,
    quote: {
      en: "Nine hours to Dire Dawa and I actually slept. Clean coach, polite crew, and the QR ticket saved me the queue.",
      am: "ወደ ድሬዳዋ ዘጠኝ ሰዓት ተጉዤ ተኝቻለሁ። ንጹህ አውቶብስ፣ ጨዋ ሰራተኞችና QR ትኬት ወረፋ አዳነኝ።",
      om: "Sa'aatii sagal Dirre Dhawaatti imalee nan rafe. Konkolaataan qulqulluu, hojjettoonni kabajamoo.",
    },
  },
  {
    id: "t4",
    author: "Dawit Haile",
    city: "Arba Minch",
    rating: 5,
    quote: {
      en: "We moved a team of 14 to Arba Minch. The office handled the group booking on the phone and every seat was together.",
      am: "14 ሰዎችን ወደ አርባ ምንጭ አጓጓዝን። ቢሮው በስልክ አስተናገደን፤ ወንበሮቻችንም አንድ ላይ ነበሩ።",
      om: "Garee nama 14 gara Arbaa Mincii geessine. Waajjirri bilbilaan nu tajaajile.",
    },
  },
];

/* ---------- Trips (deterministic mock generator) ---------- */

export type Trip = {
  id: string;
  routeId: string;
  busClass: BusClass;
  departure: Date;
  arrival: Date;
  price: number;
  seatsTotal: number;
  seatsLeft: number;
  plate: string;
  driver: string;
};

const DEPART_TIMES = [5.5, 6, 7, 8.5, 10, 13, 15.5, 20, 22];
const CLASSES: BusClass[] = ["vip", "business", "standard"];
const DRIVERS = ["Abiy Mekonnen", "Tariku Gebre", "Hussein Ali", "Yonas Alemu", "Bekele Dinka", "Fitsum Assefa"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function seatCountFor(cls: BusClass) {
  const f = FLEET.find((x) => x.id === cls)!;
  return f.config === "2-1" ? f.rows * 3 : f.rows * 4 - 1;
}

export function getTrips(routeId: string, dateISO: string): Trip[] {
  const route = ROUTES.find((r) => r.id === routeId);
  if (!route) return [];
  const base = new Date(dateISO + "T00:00:00");
  return DEPART_TIMES.map((h, i) => {
    const seed = hash(routeId + dateISO + i);
    const cls = CLASSES[(seed + i) % 3];
    const fleet = FLEET.find((f) => f.id === cls)!;
    const departure = new Date(base);
    departure.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
    const arrival = new Date(departure.getTime() + route.durationMinutes * 60000);
    const total = seatCountFor(cls);
    const left = (seed % (total - 2)) + 1;
    return {
      id: `${routeId}-${dateISO}-${i}`,
      routeId,
      busClass: cls,
      departure,
      arrival,
      price: Math.round((route.basePrice * fleet.priceFactor) / 10) * 10,
      seatsTotal: total,
      seatsLeft: Math.min(left, total),
      plate: `3-A${(seed % 90000) + 10000} ET`,
      driver: DRIVERS[seed % DRIVERS.length],
    };
  }).sort((a, b) => a.departure.getTime() - b.departure.getTime());
}

export function getTripById(id: string): Trip | undefined {
  const parts = id.split("-");
  if (parts.length < 3) return undefined;
  const routeId = parts[0];
  const dateISO = parts.slice(1, parts.length - 1).join("-");
  return getTrips(routeId, dateISO).find((t) => t.id === id);
}

export function bookedSeats(tripId: string, total: number): Set<string> {
  const seed = hash(tripId);
  const set = new Set<string>();
  const count = seed % Math.floor(total * 0.55);
  for (let i = 0; i < count; i++) {
    set.add(String(((seed >> i) % total) + 1));
  }
  return set;
}

export function routeFor(routeId: string) {
  return ROUTES.find((r) => r.id === routeId)!;
}

export function findRoute(from: string, to: string) {
  return ROUTES.find((r) => (r.from === from && r.to === to) || (r.from === to && r.to === from));
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `BFT-${s}`;
}

/* ---------- Admin mock analytics ---------- */

export const REVENUE_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 420000 + Math.sin(i / 3) * 90000 + i * 6000;
  return { day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: Math.round(base), bookings: Math.round(base / 1450) };
});

export const TOP_ROUTES = [
  { name: "Addis → Hawassa", revenue: 2480000 },
  { name: "Addis → Dire Dawa", revenue: 1960000 },
  { name: "Addis → Wolayta Sodo", revenue: 1720000 },
  { name: "Addis → Harar", revenue: 1340000 },
  { name: "Addis → Arba Minch", revenue: 1120000 },
];

export const OCCUPANCY = [
  { cls: "VIP", value: 88 },
  { cls: "Business", value: 81 },
  { cls: "Standard", value: 93 },
];

/* ---------- Ops console datasets ---------- */
export type LiveBus = {
  call: string;
  routeId: string;
  driver: string;
  progress: number;
  speed: number;
  occupancy: number;
  status: "enroute" | "boarding" | "delayed" | "arriving";
  delayMin: number;
};

export const LIVE_FLEET: LiveBus[] = [
  { call: "BFT-VIP-01", routeId: "r1", driver: "Abiy Mekonnen", progress: 0.62, speed: 84, occupancy: 0.93, status: "enroute", delayMin: 0 },
  { call: "BFT-BUS-07", routeId: "r2", driver: "Tariku Gebre", progress: 0.24, speed: 71, occupancy: 0.78, status: "enroute", delayMin: 0 },
  { call: "BFT-STD-12", routeId: "r4", driver: "Hussein Ali", progress: 0.06, speed: 0, occupancy: 0.55, status: "boarding", delayMin: 0 },
  { call: "BFT-VIP-03", routeId: "r5", driver: "Yonas Alemu", progress: 0.81, speed: 66, occupancy: 0.88, status: "arriving", delayMin: 0 },
  { call: "BFT-BUS-19", routeId: "r6", driver: "Bekele Dinka", progress: 0.47, speed: 58, occupancy: 0.64, status: "delayed", delayMin: 35 },
  { call: "BFT-STD-24", routeId: "r3", driver: "Fitsum Assefa", progress: 0.33, speed: 79, occupancy: 0.97, status: "enroute", delayMin: 0 },
];

export const ACTIVITY: { kind: "booking" | "refund" | "checkin" | "edit" | "delay" | "payout"; text: string; meta: string; at: number }[] = [
  { kind: "booking", text: "6 seats sold · Addis → Dire Dawa 20:00", meta: "Telebirr · BFT-QW71TB", at: 2 },
  { kind: "checkin", text: "Selam Bekele checked in at Meskel Square", meta: "seat 3A · VIP Lounge", at: 7 },
  { kind: "delay", text: "BFT-BUS-19 held 35 min — Adama checkpoint", meta: "Robe → Addis", at: 14 },
  { kind: "refund", text: "Refund approved · BFT-ZX19RC", meta: "1,750 ETB · 14h before departure", at: 26 },
  { kind: "edit", text: "Fare +5% on Hawassa → Negelle Borena", meta: "by agent: Hanna G.", at: 41 },
  { kind: "booking", text: "Group booking 14 seats · Wolayta Sodo", meta: "office · +251 943 822 619", at: 58 },
  { kind: "payout", text: "Daily settlement pushed to Chapa", meta: "1,208,400 ETB", at: 96 },
];

export const HEATMAP_ROUTES = ["Addis→Hawa", "Addis→Sodo", "Addis→Dire", "Addis→Harar", "Addis→Jijiga", "Hawa→Arba"];
export const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HEATMAP: number[][] = [
  [62, 58, 64, 70, 96, 99, 88],
  [54, 51, 60, 66, 91, 94, 79],
  [70, 66, 72, 78, 99, 97, 90],
  [48, 45, 52, 61, 84, 88, 74],
  [40, 38, 46, 55, 77, 81, 66],
  [35, 33, 41, 49, 72, 90, 68],
];

export const HOURLY_DEMAND = Array.from({ length: 24 }, (_, h) => {
  const morning = Math.exp(-Math.pow(h - 7, 2) / 6);
  const midday = Math.exp(-Math.pow(h - 13, 2) / 10) * 0.55;
  const evening = Math.exp(-Math.pow(h - 19, 2) / 5) * 1.15;
  return { hour: `${String(h).padStart(2, "0")}:00`, seats: Math.round(20 + 320 * (morning + midday + evening)), revenue: Math.round(30000 + 420000 * (morning + midday + evening)) };
});

export const STAFF = [
  { id: "s1", name: "Hanna Girma", role: "agent", office: "Addis Ababa — Meskel Square", phone: "+251 911 402 883", active: true },
  { id: "s2", name: "Muluken Adane", role: "supervisor", office: "Wolaita Sodo", phone: "+251 943 822 619", active: true },
  { id: "s3", name: "Ibrahim Kedir", role: "agent", office: "Dire Dawa", phone: "+251 925 771 004", active: true },
  { id: "s4", name: "Ruth Zeleke", role: "ops", office: "Control room · Addis", phone: "+251 916 440 118", active: false },
];

export const CREW = [
  { id: "d1", name: "Abiy Mekonnen", license: "TR-4A-99231", years: 11, rating: 4.9, trips: 812, status: "on-trip" },
  { id: "d2", name: "Tariku Gebre", license: "TR-2C-55104", years: 7, rating: 4.8, trips: 455, status: "on-trip" },
  { id: "d3", name: "Hussein Ali", license: "TR-7B-31002", years: 14, rating: 4.9, trips: 1203, status: "boarding" },
  { id: "d4", name: "Yonas Alemu", license: "TR-1F-88320", years: 5, rating: 4.6, trips: 210, status: "rest" },
  { id: "d5", name: "Bekele Dinka", license: "TR-9A-10294", years: 9, rating: 4.7, trips: 640, status: "delayed" },
];

export const ADMIN_BOOKINGS = [
  { ref: "BFT-8A24K1", passenger: "Selam Bekele", route: "Addis → Hawassa", departure: "06:00", amount: 1595, status: "confirmed" },
  { ref: "BFT-K93MZ2", passenger: "Getachew Tolla", route: "Addis → Sodo", departure: "07:00", amount: 2500, status: "confirmed" },
  { ref: "BFT-QW71TB", passenger: "Amina Yusuf", route: "Addis → Dire Dawa", departure: "20:00", amount: 1550, status: "pending_payment" },
  { ref: "BFT-LL40XP", passenger: "Dawit Haile", route: "Hawassa → Arba Minch", departure: "13:00", amount: 1035, status: "confirmed" },
  { ref: "BFT-ZX19RC", passenger: "Meron Tesfaye", route: "Addis → Harar", departure: "22:00", amount: 1750, status: "cancelled" },
  { ref: "BFT-HD55NN", passenger: "Ibrahim Kedir", route: "Dire Dawa → Jijiga", departure: "08:30", amount: 700, status: "completed" },
];

/* demo tracking trip */
export const DEMO_TRACK = {
  ref: "BFT-8A24K1",
  routeId: "r1",
  driver: "Abiy Mekonnen",
  plate: "3-A41822 ET",
  busClass: "vip" as BusClass,
  progress: 0.62,
  speed: 78,
  office: "o2",
};
