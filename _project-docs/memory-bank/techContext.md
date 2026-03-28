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
| Styling | NativeWind + Tailwind CSS | ^4.2.1 / ^4.1.18 |
| Animations | React Native Reanimated | ~4.1.1 |
| Icons | @expo/vector-icons (Ionicons) | ^15.0.3 |
| Images | expo-image-picker | ~17.0.10 |

## Key Dev Dependencies
- babel-preset-expo, @babel/core
- patch-package (for WatermelonDB patches)
- react-native-css-interop (NativeWind bridge)
- react-native-worklets (required by Reanimated v4)

## Setup Steps
1. `npm install`
2. Ensure `global.css` imports Tailwind (`@import "tailwindcss"`)
3. `metro.config.js` must use `withNativeWind`
4. `babel.config.js` must include `react-native-reanimated/plugin`
5. WatermelonDB requires native build — use `expo run:android` / `expo run:ios` (not Expo Go)
6. Set Supabase URL + anon key in env (not committed)

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## WatermelonDB Notes
- Requires patch-package due to Expo SDK 54 compatibility
- Sync uses custom `SyncManager` wrapping `synchronize()` from `@nozbe/watermelondb/sync`
- Models must extend `Model` and be registered in the database schema

## Supabase Notes
- Auth: email/password via `supabase.auth`
- Tables need Row Level Security (RLS) enabled with user_id policies
- Edge Functions in `supabase/functions/` handle server-side sync logic
