# theo0x1337.dev

Personal portfolio and blog for Theo Bernardin, Lead Data Engineer.

A small TypeScript monorepo: a React single-page frontend, an Express API, and a
shared types package. Blog posts are stored in Supabase (Postgres) with a local
JSON fallback so the site runs without any external service in development.

## Stack

- **Frontend** — React 19, Vite, React Router, `react-markdown` + `remark-gfm` +
  `rehype-sanitize` for safe markdown rendering, `lucide-react` icons.
- **Backend** — Express, `@supabase/supabase-js`, `pg`, run with `tsx`.
- **Shared** — TypeScript package of common types (`BlogPost`, etc.) consumed by
  both client and server.
- **Tooling** — npm workspaces, `concurrently`, TypeScript.

## Layout

```
client/   React + Vite frontend
server/   Express API (blog posts, auth)
shared/   Shared TypeScript types
```

## Getting started

```bash
npm install            # installs all workspaces
npm run dev            # runs server + client together (concurrently)
```

Or run them individually:

```bash
npm run dev:client     # Vite dev server
npm run dev:server     # API with tsx watch
```

## Configuration

The server reads its configuration from `server/.env` (git-ignored). Without
Supabase credentials it falls back to a local JSON store, so this is optional in
development.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `CORS_ORIGIN` | Allowed frontend origin |
| `ADMIN_TOKEN` | Password for the admin login that authorizes writes |
| `SUPABASE_URL` | Supabase project base URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-side only, bypasses RLS) |

The Supabase schema for the blog posts table lives in
[`server/supabase-schema.sql`](server/supabase-schema.sql).

## Build

```bash
npm run build          # builds shared + server
npm run build:client   # builds the frontend
```
