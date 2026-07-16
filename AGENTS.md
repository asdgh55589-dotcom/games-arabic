# AGENTS.md

## What this is

Arabic game localization (تعريب) platform — a Next.js 16 single-page app. Users browse/download Arabic translation mods for games across PC, Nintendo Switch, and PlayStation (PS1–PS4). Full RTL Arabic interface.

## Quick commands

```bash
npm install                      # install deps (use npm, not bun)
npm run dev                      # dev server on port 3000
npm run build                    # production build (Vercel uses this)
npm run lint                     # eslint
npx prisma generate              # regenerate Prisma client
npx prisma db push               # push schema to PostgreSQL (Neon)
npx tsx scripts/seed.ts          # seed sample data (28 games, 123+ mods)
```

## IMPORTANT: Do NOT install node_modules locally

**DO NOT run `npm install` or any package installer locally.** The `node_modules` directory causes problems (corrupted state, ENOTEMPTY errors). All installation happens on Vercel during build. The build script in `package.json` handles `prisma generate` and `prisma db push` automatically.

If you need to test locally, use a container or fresh environment — never install in the project root.

## Architecture (the part that will trip you up)

**Query-param routing, not file-based.** The entire front-end lives under `src/app/page.tsx` which reads `?view=<name>` from search params and renders the matching component from `src/views/`. There is only one actual page route (`/`). All navigation is client-side via URL query params.

Views: `home`, `mod`, `search`, `upload`, `profile`, `login`, `register`, `series`, `series-detail`, `platform`, `support`, `explore`, `community`, `about`, `problems`, `terms`, `privacy`.

**Admin panel** uses real file-based routes under `src/app/admin/` with its own layout (`src/app/admin/layout.tsx`). Protected by `src/middleware.ts` — requires JWT cookie `ga_admin_session` with role `moderator|admin|owner`.

**API routes** under `src/app/api/` — these are standard Next.js Route Handlers.

## Stack quirks

- **TypeScript build errors are ignored** — `next.config.ts` sets `typescript.ignoreBuildErrors: true`. `noImplicitAny` is `false` despite `strict: true`. You must run `tsc --noEmit` separately to catch type issues; the build won't fail on them.
- **ESLint is very permissive** — nearly all rules disabled (unused vars, console, no-explicit-any, exhaustive-deps all off). Lint passes trivially.
- **No test framework** — no test scripts, no test files. If you add tests, pick the framework yourself.
- **Tailwind CSS v4** with PostCSS (`@tailwindcss/postcss`), not the old `tailwindcss` plugin. Config file at `tailwind.config.ts` may be vestigial — the real styling entry is `src/app/globals.css`.
- **shadcn/ui** — new-york style, lucide icons, configured in `components.json`. Components live in `src/components/ui/`. Aliases: `@/components`, `@/lib`, `@/hooks`.
- **Prisma + PostgreSQL (Neon)** — cloud database on Neon. Schema managed via `npx prisma db push`. `prisma generate` runs automatically during build.
- **Runtime**: Production runs on **Bun** (not Node). Dev also uses Bun.

## Platform gotcha

The canonical platform list is split across multiple files and **not all are in sync**:
- `src/lib/constants.ts` — `PLATFORMS` array (PC, PS4, PS3, PS2, PS1 — **missing NS**)
- `src/views/home.tsx` and `src/components/navbar.tsx` — have their own `PLATFORMS` arrays that include NS
- `src/app/api/home/route.ts` — has `PLATFORMS_ORDER` with NS
- `src/app/api/mods/route.ts` — has `PLATFORM_KEYS` with NS

When adding/removing platforms, update **all** of these locations. `src/lib/constants.ts` is the intended source of truth but currently lags behind.

## Dev environment

- `.zscripts/dev.sh` — full dev bootstrap: `bun install` → `db:push` → `bun run dev` → optional mini-services
- `.zscripts/build.sh` and `scripts/start-dev.sh` reference `/home/z/my-project` (deployed environment path, not local)
- Caddyfile runs a reverse proxy on port 81 → port 3000

## File layout

```
src/
  app/
    page.tsx          # SPA entry — query-param router
    layout.tsx        # Root layout (RTL, dark mode, ThemeProvider)
    api/              # Route handlers (home, mods, games, auth, admin, etc.)
    admin/            # Admin panel (file-based routes, JWT-protected)
  views/              # All "page" components rendered by page.tsx
  components/
    ui/               # shadcn/ui components
    navbar.tsx        # Main nav (has its own PLATFORMS list)
    footer.tsx
    mod-card.tsx      # Mod card (has GAME_ARABIC_NAMES map — keep in sync)
    platform-icons.tsx # SVG icons per platform
  lib/
    constants.ts      # PLATFORMS, GAME_ARABIC_NAMES — canonical but not complete
    types.ts          # Shared TypeScript interfaces
    db.ts             # Prisma client singleton
    auth.ts           # Server-side auth helpers
  hooks/              # Custom React hooks
scripts/
  seed.ts             # Database seeder — edit to add games/mods
```

## RTL notes

- HTML is `<html lang="ar" dir="rtl">` — the entire UI is right-to-left
- Components use Tailwind RTL conventions; `tailwindcss-animate` plugin is active
- Dark mode is default and locked (`enableSystem: false`)
