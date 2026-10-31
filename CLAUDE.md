# Project rules for the AI coding agent

You are helping a product owner build Mihrab.
Explain changes in plain language. Make small changes, one at a time, and say how to test each one.

## What this project is
- One Next.js (App Router, TypeScript) website serving one page per masjid, in Gujarati (`/<slug>`) and English (`/<slug>/en`).
- All masjid profiles, Jammat prayer times, themes, and subscription plans are managed directly from the built-in admin dashboard at `/admin`.
- Data is stored in `data/sites.json` and syncs instantly to public pages.

## Hard rules
- Data lives in `data/sites.json` and is updated via `/admin` (password-protected via `ADMIN_PASSWORD`).
- Google Sheets dependency has been removed per product owner instruction.
- Never put secrets in code or commit `.env.local`.
- Treat user input as untrusted text: render as text only, never as HTML; keep links restricted to https.

- All fixed wording lives in `src/lib/i18n.ts`, in both languages.
- Pin exact dependency versions; do not add packages without a clear reason.
- Run `npm run build` after every change and report the result.

## Design
- Noor style: ivory background, emerald jamaat-times panel, thin gold geometric pattern as the only decoration.
- One font family: Hind Vadodara (Gujarati + Latin).
- Mobile first; touch targets at least 44px; text contrast at least 4.5:1.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
