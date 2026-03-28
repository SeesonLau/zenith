# Tech Context — Zenith

## Core Stack
| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | ~54.0.30 |
| Runtime | React Native | 0.81.5 |
| Language | TypeScript | ~5.9.2 |
| Routing | Expo Router | ~6.0.21 |
| Local DB | WatermelonDB | ^0.28.0 |
| Backend | Supabase | ^2.89.0 |
| Styling | NativeWind | ^4.2.1 |
| CSS Engine | Tailwind CSS | **^3.4.17 (v3 — NOT v4)** |
| Animations | React Native Reanimated | ~4.1.1 |
| Icons | @expo/vector-icons (Ionicons) | ^15.0.3 |
| Images | expo-image-picker | ~17.0.10 |

## Key Runtime Dependencies
- `@react-native-async-storage/async-storage` — theme preference + device_id persistence
- `@react-native-netinfo/netinfo` — network connectivity check before sync
- `expo-file-system` — local image downloads (supabaseStorage.ts)
- `react-native-safe-area-context` — SafeAreaView on all screens
- `react-native-css-interop` — NativeWind bridge

## Key Dev Dependencies
- `babel-preset-expo`, `@babel/core`
- `patch-package` — WatermelonDB patches for Expo SDK 54 compatibility
- `react-native-worklets` — required by Reanimated v4

## Setup Steps
1. `npm install`
2. `app/global.css` contains `@tailwind base; @tailwind components; @tailwind utilities;`
3. `metro.config.js` uses `withNativeWind({ input: './app/global.css' })`
4. `babel.config.js` includes `react-native-reanimated/plugin` and `nativewind/babel`
5. `tailwind.config.js` points content to `app/**/*.{ts,tsx}` and `src/**/*.{ts,tsx}`
6. WatermelonDB requires native build — use `expo run:android` / `expo run:ios` (not Expo Go)
7. Set Supabase URL + anon key in `app.config.js` extra (or env)

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## Supabase Auth Status
**Auth is DISABLED.** The Supabase client is initialized with:
```ts
auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
```
The app runs without any user authentication. There is no login/signup flow. This is a critical gap — the app cannot be shipped without re-enabling auth.

## WatermelonDB Notes
- Schema current version: **6**
- Single migrations file: `src/database/migrations.ts` (not split per version)
- `migrationsEnabledAtVersion: 5` in database setup
- Requires patch-package due to Expo SDK 54 compatibility
- All domain tables have: `is_synced`, `device_id`, `deleted_at`, `created_at`, `updated_at`

## Tailwind v3 Note
Despite NativeWind being v4, Tailwind CSS itself is **v3.4.x** (package.json: `"tailwindcss": "^3.4.17"`). The `tailwind.config.js` uses the v3 config format. The `global.css` uses v3 directives. Do not upgrade to Tailwind v4 without validating NativeWind compatibility.

## Supabase Notes
- Tables need Row Level Security (RLS) — currently all set to `Allow all (public)` (CRITICAL bug)
- No `user_id` column on any table — RLS policies cannot filter by owner
- Sync via RPC calls: `pull_changes` and `push_changes` Edge Functions (server status unknown)
- Supabase Storage bucket: `diary-images` (for diary entry images)
- `sync_metadata` table does NOT exist in Supabase — only local
