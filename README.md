# Mihrab – Live Masjid Community Platform

One simple website for many masjids. Each masjid gets one page in Gujarati and English, at
`yourdomain/<slug>` and `yourdomain/<slug>/en`. All content comes from one Google Sheet.
When you edit the sheet, the website updates by itself within about 5 minutes.

## What is in this folder

| Path | What it is |
|---|---|
| `src/app/[slug]/page.tsx` | The Gujarati masjid page |
| `src/app/[slug]/en/page.tsx` | The English masjid page |
| `src/components/MasjidPage.tsx` | The page design both languages share |
| `src/lib/sites.ts` | Reads the Google Sheet |
| `src/lib/i18n.ts` | Every fixed word in Gujarati and English (ask a native speaker to check it) |
| `src/app/globals.css` | Colors, fonts, spacing |
| `data/sample-sites.csv` | Test data used until you connect your sheet |
| `public/photos/` | Masjid photos, named as in the sheet's `photo` column |
| `CLAUDE.md` | Rules for the AI coding agent working on this project |
| `docs/PHASES.md` | The build plan, phase by phase |

## Run it on your computer (Windows or Mac)

1. Install **Node.js LTS** (version 20 or newer) from https://nodejs.org. Restart your computer afterwards on Windows.
2. Unzip this folder somewhere easy, for example `Documents/masjidweb`.
3. Open a terminal in that folder:
   - **Windows:** open the folder in File Explorer, click the address bar, type `cmd` and press Enter.
   - **Mac:** right-click the folder in Finder → *New Terminal at Folder* (or open Terminal and type `cd ` then drag the folder in).
4. Install the project's packages (once):
   ```
   npm install
   ```
5. Start the website:
   ```
   npm run dev
   ```
6. Open these in your browser:
   - http://localhost:3000/noor-masjid (Gujarati sample)
   - http://localhost:3000/noor-masjid/en (English sample)
   - http://localhost:3000/off-sample (what an inactive site looks like)

Press `Ctrl + C` in the terminal to stop it.

## Connect your Google Sheet

1. In your public Google Sheet: **File → Share → Publish to web → choose the "Sites" tab → Comma-separated values (.csv) → Publish**. Copy the link.
2. In this folder, copy `.env.example` to a new file named `.env.local`.
3. Paste the link after `SHEET_CSV_URL=` and save.
4. Stop and restart `npm run dev`. Your masjids now appear at `localhost:3000/<their slug>`.

Never publish the Private sheet. The website never needs it.

## How the status column works

| status | What visitors see |
|---|---|
| `live` | The full website. Google can list it. |
| `preview` | The website with a "This is a preview" banner. Hidden from Google. Use this to show a committee their free preview. |
| `off` | "This website is not active right now." Use this when a renewal is not paid. |

A slug that is not in the sheet shows a "no masjid at this address" page.

## Adding a photo

Save the photo in `public/photos/` with the exact name you typed in the sheet's `photo` column
(for example `noor-masjid.jpg`), about 1600 px wide and under 400 KB. Photos need a new deploy
(Phase 3) to appear on the live site; sheet text changes do not.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the site on your computer, refreshes as you edit |
| `npm run build` | Checks that everything compiles, as the live host will |
| `npm run typecheck` | Checks the code for type mistakes |
