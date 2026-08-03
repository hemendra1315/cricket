# Cricket Academy Manager

Multi-tenant SaaS for cricket academies: batches, sessions, attendance, drills, coach feedback, match stats, fees and reports.

**Status: Phase 0 (Foundation) complete.** No domain features are implemented yet — see `docs/ROADMAP.md`.
The approved design documents in `docs/` are the source of truth: `PRD.md`, `DB-SCHEMA.sql`, `API-PLAN.md`, `FOLDER-STRUCTURE.md`, `ROADMAP.md`.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router · TanStack Query · Zustand · React Hook Form + Zod · Supabase (Auth/Postgres/Storage/Edge Functions) · Vitest + Testing Library · Playwright · vite-plugin-pwa

## Requirements

- Node **22.12+** (`.nvmrc` pins 22.12.0; Vite 8 requires ≥ 20.19)
- npm 10+
- Docker (optional, for the containerised dev server)

## Getting started

```bash
nvm use                 # Node 22.12.0
npm install
cp .env.example .env    # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev             # http://localhost:5173
```

`src/lib/env.ts` validates the environment with Zod at startup, so a missing variable fails fast with a readable message.

### Docker

```bash
cp .env.example .env
npm run docker:dev      # docker compose up --build → http://localhost:5173
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) + production build + service worker |
| `npm run preview` | Serve the production build |
| `npm run lint` / `lint:fix` | ESLint (zero warnings allowed) |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | TypeScript project references, no emit |
| `npm run test` / `test:coverage` | Vitest unit/component tests |
| `npm run test:e2e` | Playwright (builds and previews automatically) |
| `npm run db:types` | Regenerate `src/lib/supabase/database.types.ts` |

Husky + lint-staged run ESLint and Prettier on staged files before each commit. CI (`.github/workflows/ci.yml`) runs format check → lint → typecheck → unit tests → build, then Playwright.

## Architecture

Feature-sliced: each domain lives in `src/features/<domain>` with its own `api/`, `hooks/`, `components/`, `pages/`. Cross-feature imports go through a feature's `index.ts` barrel only, and data access is confined to `features/*/api` plus `src/lib`.

```
src/
  app/          router, providers, guards (RequireAuth/RequireRole/RequireAcademy), layouts
  components/   ui/ primitives, feedback/ states, form/ RHF helpers, charts/, data/
  features/     auth, onboarding, academies, members, dashboard, admin (+ dirs reserved per phase)
  lib/          env, logger, api (client + error normalisation), query, rbac, supabase, utils, validators
  stores/       Zustand: auth, academy (active tenant), theme, ui/toasts
  hooks/        useDebounce, useMediaQuery, useOnlineStatus, useLocalStorage, useThemeEffect
supabase/       config.toml, migrations/, seed/, functions/, tests/
```

### Permissions

`src/lib/rbac` holds the capability map from the PRD permission matrix, exposed as `useCan()` and `<Can do="…">`, with `RequireRole` gating routes. This is **UI gating only** — Postgres RLS is the authority.

Roles come from *active* memberships in the currently selected academy, so a pending join request grants nothing; `super_admin` comes from `profiles.is_super_admin`, which RLS reads too.

## Database

Migrations in `supabase/migrations` are applied in order (`supabase db reset` locally):

| File | Contents |
| --- | --- |
| `0001_init_identity_tenancy.sql` | enums, `profiles`, `academies`, `academy_members`, `academy_join_codes`, `join_requests`, the `auth.users` → `profiles` trigger |
| `0002_rls_identity_tenancy.sql` | `SECURITY DEFINER` helpers (`is_member`, `is_staff`, `is_owner`, `is_super_admin`) and RLS on every table |
| `0003_tenancy_rpcs.sql` | `create_academy`, `request_join_by_code`, `regenerate_join_code`, `academy_active_join_code`, `my_memberships`, `my_join_requests` |
| `0004_people.sql` | `skill_level`, `players`, `coaches`, plus a backfill for members who predate the tables |
| `0005_rls_people.sql` | RLS on `players` (staff, or the player themselves) and `coaches` (any member; owner or self writes) |
| `0006_people_rpcs.sql` | `approve_join_request`, `reject_join_request`, `academy_join_requests`, `set_member_role`, `update_my_player_profile`, `ensure_person_row` |
| `0007_batches.sql` | `venues`, `batches`, `batch_coaches`, `batch_players`, plus triggers asserting every child row's `academy_id` matches its parents |
| `0008_rls_batches.sql` | RLS on the batch tables and a tightened `players_select` (a coach now sees only players sharing a batch) |
| `0009_batch_rpcs.sql` | `add_players_to_batch`, `remove_player_from_batch`, `assign_player_to_batches`, `assign_coach_to_batch`, `remove_coach_from_batch`, `delete_batch` |

Every academy-scoped row carries `academy_id` and is readable only through an active membership, so isolation does not depend on client-side filtering. Multi-table writes (creating an academy with its owner membership and first join code, redeeming a code) run inside RPCs so they cannot half-apply. Join codes are never readable by non-staff: a player redeems one through `request_join_by_code`, which creates a **pending** request that the owner approves on `/members`. `approve_join_request` creates the membership *and* the matching `players`/`coaches` row in one transaction, and `set_member_role` does the same when a role changes, so a roster never contains a member without their profile.

Batch rosters follow the same rule: `batches` and `venues` are readable by any member and writable only by an owner, while multi-row roster changes go through RPCs so a capacity check and its insert cannot race. Removing a player stamps `left_at` instead of deleting the row, and `delete_batch` soft-deletes a batch while releasing its roster in the same transaction. Batch membership is also what makes "a coach sees their assigned players" true — `players_select` now matches a coach only through a shared batch.

A player may edit their own contact details through `update_my_player_profile` rather than a wider RLS policy: the writable column set is fixed in the function, so skill level, player code and medical notes stay academy-controlled.

`src/lib/supabase/database.types.ts` is generated — run `SUPABASE_PROJECT_ID=<ref> npm run db:types` after any migration, never edit it by hand.

### Connecting to a hosted project

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` come from the environment (a git-ignored `.env` locally, secrets in CI/Devin); no credential belongs in source. Only the anon key ever reaches the browser — RLS is what protects the data. A `SUPABASE_ACCESS_TOKEN` is needed for the CLI (`db:types`, `db push`) and stays server-side.

Google sign-in additionally requires the Google provider to be enabled in Dashboard → Authentication → Providers with a Google Cloud OAuth client, whose **Authorized redirect URI** must be `https://<project-ref>.supabase.co/auth/v1/callback`. The app's own redirect (`/auth/callback`) must be in the Supabase URL allow list.

### Theming

Semantic CSS variables in `src/styles/index.css` are swapped by a `.dark` class on `<html>`. The choice (light/dark/system) is persisted by `themeStore` and applied by `useThemeEffect`.

### Errors and logging

`src/lib/logger.ts` is the only module allowed to touch `console`; everything unexpected funnels through `reportError` (the future Sentry hook). `src/lib/api/errors.ts` normalises Postgrest/network failures into `ApiError` codes with user-facing copy, which the query client uses to decide what is retryable.

## Known issue

`npm audit` reports a high-severity advisory in `react-router` for **RSC mode** (`GHSA-qwww-vcr4-c8h2`). This app is a client-side SPA and does not use RSC mode; every older 7.x release carries strictly more (and applicable) advisories, so 7.18.2 is the safest available version. Revisit when a patched release ships.
