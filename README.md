# Layne Baby

A multi-caregiver baby tracker PWA. Parents and partners log Feed (breastfeed / bottle / solids / combo), Pump, Diaper, and Sleep for one or more children in a shared family account, with everyone's entries syncing in real time.

React + TypeScript + Vite, backed by Supabase (Postgres, Auth, Realtime), styled to the Layne Baby design system (dark by default, warm neutrals, four fixed tracker accents).

## Stack

- Vite + React 19 + TypeScript
- React Router (client-side auth stack + tab navigator)
- Supabase (`@supabase/supabase-js`) for auth, Postgres data, and Realtime subscriptions
- `vite-plugin-pwa` for installability and offline caching
- Plain CSS with design tokens as CSS custom properties — no UI framework

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev
```

The app expects a Supabase project with the schema described below already applied (tables, RLS policies, the `create_family` / `join_family` / `current_family_id` / `update_display_name` RPCs, the `handle_new_user` auth trigger, and `activities`/`children`/`caregivers` added to the `supabase_realtime` publication).

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable (or legacy anon) API key |

## Data model

- `families` — one row per family, with a shareable `invite_code`
- `caregivers` — one row per auth user, linked to a family; created automatically on sign-up via an `auth.users` trigger
- `children` — babies belonging to a family
- `activities` — every logged entry (feed/pump/diaper/sleep), with a `type` column and a flexible `data` jsonb column for type-specific fields (e.g. `left_min`/`right_min` for breastfeeding, `amount_oz` for bottles, `left_oz`/`right_oz` for pumps, `wet`/`dirty`/`flags` for diapers)
- `foods` / `child_foods` — a shared + family-custom food list for the solids logger

All tables are scoped to the caller's family via row-level security using a `current_family_id()` helper function.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint
