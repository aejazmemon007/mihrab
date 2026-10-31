# Mihrab – build phases

| Phase | Goal | Status |
|---|---|---|
| 1. Data | Public and private Google Sheets | Done (two .xlsx templates) |
| 2. Website | Masjid page reading the sheet, Gujarati + English, preview/off states, SEO basics | Done – test on your computer |
| 3. Go live | GitHub repository, Vercel hosting, domain, `SHEET_CSV_URL` and `SITE_URL` set on the host | Next |
| 4. QR poster | Printable A4 poster page per masjid at `/<slug>/poster` | After Phase 3 |
| 5. Pilot | First real masjid: setup visit, WhatsApp group, UPI payment | After Phase 4 |

## Phase 2 acceptance checklist
- [ ] `npm run dev` works on your computer.
- [ ] `/noor-masjid` shows Gujarati, `/noor-masjid/en` shows English, the switch moves between them.
- [ ] `/off-sample` shows the "not active" message.
- [ ] After connecting your sheet, changing a time in the sheet shows on the page after a restart (locally) or within 5 minutes (live).
- [ ] A native Gujarati speaker has checked `src/lib/i18n.ts` and the sample text.
