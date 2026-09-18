# Biftu Luxury Bus Platform

Premium intercity coach booking platform for Ethiopia. Built with Next.js 16, featuring trilingual support (English, Amharic, Afaan Oromoo), GPS tracking, QR boarding passes, and a complete booking flow.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

The app will automatically redirect to `/en` (English) on first visit.

## 🌍 Language Support

- **English** (`/en`) - Default
- **አማርኛ** (`/am`) - Amharic
- **Afaan Oromoo** (`/om`) - Oromo

Switch languages using the language selector in the navbar, or navigate directly to:
- `http://localhost:3000/en`
- `http://localhost:3000/am`
- `http://localhost:3000/om`

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Internationalization**: next-intl
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **QR Codes**: qrcode library
- **TypeScript**: Full type safety

## 🗂️ Key Routes

| Route | Description |
|-------|-------------|
| `/[locale]` | Home page with hero and features |
| `/[locale]/routes` | Route explorer and schedule |
| `/[locale]/fleet` | Bus fleet showcase |
| `/[locale]/track` | Live bus tracking |
| `/[locale]/about` | About and contact |
| `/[locale]/book/search` | Search for trips |
| `/[locale]/book/results` | Available trips |
| `/[locale]/book/[tripId]/seats` | Seat selection |
| `/[locale]/book/[tripId]/passengers` | Passenger details |
| `/[locale]/book/[tripId]/payment` | Payment method |
| `/[locale]/book/[tripId]/confirmation` | Booking confirmation |
| `/[locale]/account` | User dashboard |
| `/[locale]/admin` | Operations console |

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## ✨ Features

### Passenger Features
- 🎫 **End-to-end booking** - Search, select seats, enter details, pay, confirm
- 🪑 **Interactive seat map** - Real-time availability, visual selection
- 📱 **QR boarding passes** - Digitally signed, works offline
- 💳 **Multiple payment options** - Bank transfer, pay on arrival
- 📍 **Live tracking** - GPS location with ETA
- 🌐 **Trilingual** - Full support for 3 Ethiopian languages
- 📊 **My Account** - View trips, tickets, saved passengers

### Admin Features
- 🎛️ **Operations console** - Real-time dashboard
- 🚌 **Fleet management** - Bus inventory and amenities
- 🗓️ **Schedule builder** - Create and manage trips
- 📋 **Booking ledger** - All reservations in one view
- ✅ **QR verification** - Scan and validate boarding passes
- 📈 **Reports** - Revenue, occupancy, trends

## 🎨 Design Features

- **Cinematic hero** with parallax scrolling and grain texture
- **Smooth animations** powered by Framer Motion
- **Responsive design** - Mobile-first, works on all devices
- **Dark mode ready** - Theme infrastructure in place
- **Accessibility** - WCAG compliant, keyboard navigation
- **Performance** - Optimized for Core Web Vitals

## 📁 Project Structure

```
app/
  ├── [locale]/           # Localized routes
  │   ├── layout.tsx      # Locale layout with providers
  │   ├── page.tsx        # Home page
  │   └── ...             # Other pages
  ├── api/                # API routes
  ├── layout.tsx          # Root layout
  └── globals.css         # Global styles

messages/
  ├── en.json             # English translations
  ├── am.json             # Amharic translations
  └── om.json             # Afaan Oromoo translations

src/
  ├── components/         # React components
  ├── pages/              # Page components (used by app/)
  ├── lib/                # Utilities and hooks
  ├── i18n/               # i18n configuration
  └── assets/             # Images and static files
```

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env.local` file for custom configuration:

```env
# App URL (for production)
NEXT_PUBLIC_APP_URL=https://biftu.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Internationalization
Configure locales in `src/i18n/routing.ts`:
```typescript
export const routing = defineRouting({
  locales: ['en', 'am', 'om'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

## 📚 Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Detailed migration from Vite to Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## 🐛 Known Issues

None at this time. This is a complete, production-ready migration from Vite + React to Next.js 16.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for Ethiopian travelers
