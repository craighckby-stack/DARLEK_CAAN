# Commit Archaeology Engine

Analyze git repositories or raw commit logs to surface correct commits, fixed
failures, and cross-commit intelligence — powered by Gemini.

You can point it at a public GitHub repository (or your own, with a token)
and it will pull the commit history, classify commits (e.g. broken vs. fixed
attempts at the same problem), extract themes, and let you export findings
as Markdown or a zip archive.

## Stack

- **Frontend:** React 19 + Vite + Tailwind, in `src/`
- **Backend:** Express server (`server.ts`) that proxies GitHub API calls and
  Gemini analysis requests
- **AI:** Google Gemini via `@google/genai`

## Setup

```bash
bun install   # or npm install
cp .env.example .env
```

Fill in `.env`:

| Variable         | Purpose                                                    |
| ---------------- | ----------------------------------------------------------- |
| `GEMINI_API_KEY` | Required for Gemini AI analysis calls                       |
| `APP_URL`        | URL this app is hosted at (used for self-referential links) |

A GitHub personal access token can optionally be added from within the app's
Settings panel to raise API rate limits and enable pushing results back to a
repo — it isn't required to try the app against public repos.

## Running

```bash
bun run dev       # start the dev server (tsx server.ts)
bun run build     # build frontend (vite) + bundle server (esbuild)
bun run start     # run the built server
bun run lint      # typecheck (tsc --noEmit)
```

## Project layout

```
server.ts           Express API: GitHub proxying + Gemini analysis routes
src/
  App.tsx            Main application component
  components/        Shared UI components
  hooks/             Shared React hooks (e.g. rate-limit cooldown state)
  types.ts           Shared TypeScript types
scripts/             Standalone manual debug scripts (not part of the app or CI)
```

## Debug scripts

`scripts/` contains small standalone Node scripts for manually poking the
GitHub API outside the app (e.g. checking recent push events or testing
commit search queries). They aren't wired into a test runner — run them
directly with `node scripts/<name>.cjs`.
