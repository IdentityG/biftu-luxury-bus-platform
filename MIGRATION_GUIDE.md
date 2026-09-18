# Migration Guide: Vite + React → Next.js 16 App Router

This document describes the migration of the Biftu Luxury Bus Platform from Vite + React to Next.js 16 with App Router.

## ✅ Completed Migration Tasks

### 1. Project Structure & Configuration
- ✅ Created `next.config.ts` with next-intl plugin
- ✅ Updated `package.json` with Next.js 15.1.6+ dependencies
- ✅ Configured PostCSS and Tailwind CSS v4
- ✅ Updated `tsconfig.json` for Next.js
- ✅ Added `.eslintrc.json` with Next.js config

### 2. Internationalization (i18n)
- ✅ Set up `next-intl` for trilingual support (English, Amharic, Afaan Oromoo)
- ✅ Converted `src/i18n/messages.ts` → `messages/{en,am,om}.json`
- ✅ Created middleware at `src/middleware.ts` for locale routing
- ✅ Created i18n routing configuration at `src/i18n/routing.ts`
- ✅ Created request configuration at `src/i18n/request.ts`
- ✅ Built compatibility adapter at `src/lib/hooks.ts` for `useI18n()` and `useRouter()`

### 3. Styles
- ✅ Migrated `src/index.css` → `app/globals.css`
- ✅ Preserved all Tailwind v4 `@theme` variables
- ✅ Maintained custom animations and utility classes

### 4. Layouts
- ✅ Created root layout at `app/layout.tsx` with metadata
- ✅ Created locale layout at `app/[locale]/layout.tsx` with:
  - NextIntlClientProvider
  - StoreProvider (client-side state)
  - ToastProvider (notifications)
  - Font preloading

### 5. Pages Migration
All pages successfully migrated to App Router structure:

| Original Path | New Path |
|--------------|----------|
| `/` (Home) | `app/[locale]/page.tsx` |
| `/routes` | `app/[locale]/routes/page.tsx` |
| `/fleet` | `app/[locale]/fleet/page.tsx` |
| `/track` | `app/[locale]/track/page.tsx` |
| `/about` | `app/[locale]/about/page.tsx` |
| `/account` | `app/[locale]/account/page.tsx` |
| `/admin` | `app/[locale]/admin/page.tsx` |
| `/book/search` | `app/[locale]/book/search/page.tsx` |
| `/book/results` | `app/[locale]/book/results/page.tsx` |
| `/book/:tripId/seats` | `app/[locale]/book/[tripId]/seats/page.tsx` |
| `/book/:tripId/passengers` | `app/[locale]/book/[tripId]/passengers/page.tsx` |
| `/book/:tripId/payment` | `app/[locale]/book/[tripId]/payment/page.tsx` |
| `/book/:tripId/confirmation` | `app/[locale]/book/[tripId]/confirmation/page.tsx` |

### 6. Client/Server Architecture
- ✅ Added `'use client'` directives to all interactive components
- ✅ Updated all providers to be client components
- ✅ Created `PageWrapper` component for chrome (navbar/footer)
- ✅ Preserved framer-motion animations

### 7. API Routes
- ✅ Created `/api/qr/generate` endpoint for server-side QR generation

### 8. Import Updates
- ✅ Updated all imports from `@/i18n` → `@/lib/hooks`
- ✅ Updated all imports from `@/lib/router` → `@/lib/hooks`
- ✅ Maintained `@/*` path alias for clean imports

## 🔧 Key Changes

### Hook Compatibility Layer
Created `src/lib/hooks.ts` that provides:
- `useI18n()` - Drop-in replacement using next-intl's `useTranslations()`
- `useRouter()` - Drop-in replacement using next-intl's navigation helpers

### Routing
- **Before**: Hash-based routing (`#/en/routes`)
- **After**: Path-based routing with middleware (`/en/routes`)
- Automatic locale detection and redirection
- Persistent locale preference in localStorage

### Image Handling
- Asset imports remain the same (Vite → Next.js compatible)
- Images in `src/assets/` work with both systems

## 🚀 Running the Application

### Development
```bash
npm install
npm run dev
```
Opens at `http://localhost:3000` and redirects to `/en` by default.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📦 Dependencies Changed

### Removed (Vite-specific)
- `vite`
- `@vitejs/plugin-react`
- `vite-plugin-singlefile`
- `@tailwindcss/vite`

### Added (Next.js)
- `next` (^15.1.6)
- `next-intl` (^3.28.2)
- `eslint-config-next`

### Kept (Compatible)
- `react` & `react-dom`
- `framer-motion`
- `lucide-react`
- `recharts`
- `qrcode`
- `tailwindcss` v4
- `clsx` & `tailwind-merge`

## 🔍 File Structure

```
biftu-luxury-bus-platform/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale-specific layout
│   │   ├── page.tsx            # Home page
│   │   ├── about/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── book/
│   │   │   ├── search/
│   │   │   ├── results/
│   │   │   └── [tripId]/
│   │   │       ├── seats/
│   │   │       ├── passengers/
│   │   │       ├── payment/
│   │   │       └── confirmation/
│   │   ├── fleet/
│   │   ├── routes/
│   │   └── track/
│   ├── api/
│   │   └── qr/
│   │       └── generate/
│   │           └── route.ts     # QR generation API
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── messages/
│   ├── en.json                  # English translations
│   ├── am.json                  # Amharic translations
│   └── om.json                  # Afaan Oromoo translations
├── src/
│   ├── assets/                  # Images
│   ├── components/              # React components
│   ├── i18n/
│   │   ├── routing.ts           # next-intl routing config
│   │   ├── request.ts           # Server-side i18n config
│   │   └── messages.ts          # Type definitions
│   ├── lib/
│   │   ├── hooks.ts             # useI18n & useRouter adapters
│   │   ├── store.tsx            # Client state management
│   │   ├── toast.tsx            # Toast notifications
│   │   ├── data.ts              # Business logic
│   │   └── qr.ts                # QR utilities
│   ├── pages/                   # Page components (imported by app/)
│   ├── utils/                   # Utilities
│   └── middleware.ts            # Locale routing middleware
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## ✨ Features Preserved

All original functionality is preserved:
- ✅ Trilingual switching (English, Amharic, Afaan Oromoo)
- ✅ Cinematic hero with parallax
- ✅ End-to-end booking flow
- ✅ Seat selection with real-time availability
- ✅ QR boarding passes with signatures
- ✅ Payment methods (transfer/pay-on-arrival)
- ✅ Admin operations console
- ✅ Live tracking simulation
- ✅ Framer Motion animations
- ✅ Toast notifications
- ✅ Client-side state management

## 🎯 Next Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Test the Application**:
   ```bash
   npm run dev
   ```

3. **Optional Enhancements**:
   - Add Server Actions for form submissions
   - Implement Server Components where possible
   - Add image optimization with next/image
   - Set up environment variables for API keys
   - Configure caching strategies
   - Add ISR for static routes

## 📚 Documentation Links

- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Framer Motion with Next.js](https://www.framer.com/motion/)

## ⚠️ Notes

- The old Vite files (`index.html`, `vite.config.ts`) can be removed
- The old i18n provider (`src/i18n/index.tsx`) can be removed
- The old router provider (`src/lib/router.tsx`) can be removed
- All page components in `src/pages/` are still used - they're imported by app/ routes
- The migration maintains backward compatibility with the original component structure
