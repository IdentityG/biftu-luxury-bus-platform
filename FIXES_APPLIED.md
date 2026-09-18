# Fixes Applied

## Issues Fixed

### 1. Event Handler Casing (✅ Fixed)
**Error**: `Invalid event handler property 'onmousemove'. Did you mean 'onMouseMove'?`

**Solution**: Updated event handlers in `src/pages/Home.tsx` to use correct camelCase:
- `onmousemove` → `onMouseMove`
- `onmouseleave` → `onMouseLeave`

### 2. Image Imports (✅ Fixed)
**Issue**: Images were imported from `@/assets/` which is Vite-specific

**Solution**: Updated all pages to use Next.js public folder convention:
- Removed image imports: `import heroImg from "@/assets/hero.jpg"`
- Updated to public paths: `src="/images/hero.jpg"`
- Works with images in `/public/images/` folder

**Files Updated**:
- `src/pages/Home.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/FleetPage.tsx`

## Current Status

✅ All event handlers use correct React naming convention
✅ All images now reference `/public/images/` folder
✅ App should run without console errors

## Running the App

```bash
pnpm run dev
```

Visit: `http://localhost:3000`

The app will redirect to `/en` by default and all images should load properly from the public folder.
