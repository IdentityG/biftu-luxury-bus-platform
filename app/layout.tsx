import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biftu Luxury Bus — Premium Intercity Coach Travel',
  description:
    "Ethiopia's premium intercity coach network. GPS-tracked buses, verified drivers, instant e-tickets in English, Amharic & Afaan Oromoo.",
  keywords: [
    'Ethiopia bus',
    'intercity bus Ethiopia',
    'Addis Ababa bus',
    'luxury bus Ethiopia',
    'online bus booking',
  ],
  openGraph: {
    title: 'Biftu Luxury Bus',
    description: 'Premium intercity coach travel across Ethiopia',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
