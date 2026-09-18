import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

type QRPayload = {
  ref: string;
  seat: string;
  name: string;
  phone: string;
  id: string;
  route: string;
  date: string;
};

const digits = (s: string) => s.replace(/[^0-9]/g, '');

function sign(p: Pick<QRPayload, 'ref' | 'seat' | 'phone' | 'id' | 'date'>): string {
  const body = `${p.ref}|${p.seat}|${digits(p.phone)}|${p.id}|${p.date}`;
  let h = 7;
  for (let i = 0; i < body.length; i++) h = (h * 33 + body.charCodeAt(i)) >>> 0;
  return h.toString(36).toUpperCase().slice(0, 5).padStart(5, '0');
}

function passengerPayload(p: QRPayload): string {
  return `BIFTU1|${p.ref}|${p.seat}|${p.phone}|${p.id}|${p.route}|${p.date}|${sign(p)}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload: QRPayload & { size?: number } = await request.json();
    
    if (!payload.ref || !payload.seat || !payload.phone || !payload.id || !payload.route || !payload.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const size = payload.size || 160;
    const qrDataUrl = await QRCode.toDataURL(passengerPayload(payload), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size,
      color: { dark: '#0E2F63', light: '#FFFFFF' },
    });

    return NextResponse.json({ qr: qrDataUrl });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
