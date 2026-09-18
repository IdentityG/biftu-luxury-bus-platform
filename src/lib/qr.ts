import QRCode from "qrcode";

/**
 * Biftu e-ticket payload
 * Format: BIFTU1|<ref>|<seat>|<phone>|<id>|<route>|<date>|<sig>
 * <sig> is a base36 checksum so a scanner (driver app / admin console) can tell a
 * genuine ticket from a screenshot of a partial code.
 */
export type QRPayload = {
  ref: string;
  seat: string;
  name: string;
  phone: string;
  id: string;
  route: string;
  date: string;
};

const digits = (s: string) => s.replace(/[^0-9]/g, "");

export function sign(p: Pick<QRPayload, "ref" | "seat" | "phone" | "id" | "date">): string {
  const body = `${p.ref}|${p.seat}|${digits(p.phone)}|${p.id}|${p.date}`;
  let h = 7;
  for (let i = 0; i < body.length; i++) h = (h * 33 + body.charCodeAt(i)) >>> 0;
  return h.toString(36).toUpperCase().slice(0, 5).padStart(5, "0");
}

export function passengerPayload(p: QRPayload): string {
  return `BIFTU1|${p.ref}|${p.seat}|${p.phone}|${p.id}|${p.route}|${p.date}|${sign(p)}`;
}

export async function passengerQR(p: QRPayload, size = 160): Promise<string> {
  return QRCode.toDataURL(passengerPayload(p), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: size,
    color: { dark: "#0E2F63", light: "#FFFFFF" },
  });
}

export type ScanResult =
  | { ok: true; legacy: boolean; data: QRPayload }
  | { ok: false; reason: "malformed" | "signature" };

/** Parse + verify any scanned/pasted code. Tolerates the legacy bare reference too. */
export function parsePassengerPayload(raw: string): ScanResult | { bare: string } {
  const s = raw.trim().replace(/\s+/g, "");
  const parts = s.split("|");
  if (parts.length < 2 || !/^BIFTU1?$/i.test(parts[0])) {
    // bare booking reference, e.g. BFT-8A24K1 (staff may type it manually)
    return { bare: s.toUpperCase() };
  }
  const [ref, seat, phone, id, route, date, sig] = parts.slice(1);
  if (!ref || !seat) return { ok: false, reason: "malformed" };
  const legacy = !/^BIFTU1$/i.test(parts[0]);
  if (!legacy) {
    const expected = sign({ ref, seat, phone, id, date });
    if (String(sig).toUpperCase() !== expected) return { ok: false, reason: "signature" };
  }
  return { ok: true, legacy, data: { ref, seat, phone, id, route, date, name: "" } };
}

export function maskPhone(phone: string) {
  const d = digits(phone);
  if (d.length < 4) return phone;
  return `+${d.slice(0, d.length - 7)} ••• ${d.slice(-4)}`;
}
