# Project Brief — Zenith

## What It Is
Zenith is a personal life management mobile app. It gives a single person a unified place to track four domains of their daily life: Habits, Finance, Diary, and Leisure.

## Core Goals
1. Track time spent on habits with a built-in timer
2. Log financial transactions and view spending analytics
3. Write diary entries with rich text, mood tagging, and image attachments
4. Track leisure activities (games, shows, books, etc.) with time logging

## Target User
A single user (personal app). No multi-user or team features planned.

## Platform
React Native (iOS + Android) via Expo. Dark-themed UI.

## Success Criteria
- All four domains are functional with local data persistence ✅ (v0.2.0)
- App works fully offline ✅ (WatermelonDB)
- Data syncs to Supabase when online 🔄 (sync layer built; Edge Functions unverified)
- Data is tied to a user account via Supabase Auth ❌ (auth removed — planned for v0.3.0)
