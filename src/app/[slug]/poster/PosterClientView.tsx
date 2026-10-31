"use client";

import { useEffect, useState } from "react";
import type { Site } from "@/lib/sites";
import { PRAYERS, T, displayDate, displayTime, pick } from "@/lib/i18n";
import { StarPattern, type PatternVariant } from "@/components/StarPattern";

const PRAYER_ORDER = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;

export type PosterBgStyle = "emerald" | "gold" | "sapphire" | "parchment" | "sultan" | "madinah";

const BG_PRESETS: { id: PosterBgStyle; label: string; icon: string; patternColor: string; accentColor: string }[] = [
  { id: "emerald",   label: "પવિત્ર ઇમરાલ્ડ (Emerald)",     icon: "🌿", patternColor: "#059669", accentColor: "#064e3b" },
  { id: "gold",      label: "શાહી સોનેરી (Imperial Gold)",   icon: "📜", patternColor: "#ca8a04", accentColor: "#78350f" },
  { id: "sapphire",  label: "રોયલ અંદલુસ (Sapphire)",       icon: "🔷", patternColor: "#2563eb", accentColor: "#1e3a8a" },
  { id: "parchment", label: "એન્ટિક પાર્ચમેન્ટ (Parchment)",   icon: "🏺", patternColor: "#78716c", accentColor: "#44403c" },
  { id: "sultan",    label: "શાહી સુલતાન (Sultan Amber)",   icon: "👑", patternColor: "#d97706", accentColor: "#78350f" },
  { id: "madinah",   label: "પવિત્ર મદીના (Madinah Rose)",   icon: "🌹", patternColor: "#e11d48", accentColor: "#881337" },
];

const PATTERN_OPTIONS: { id: PatternVariant; label: string }[] = [
  { id: "andalus",    label: "Andalus Zellige" },
  { id: "noor",       label: "Noor Arabesque" },
  { id: "girih",      label: "Isfahan Girih" },
  { id: "mashrabiya", label: "Mashrabiya" },
  { id: "damascus",   label: "Damascus Inlay" },
];

export function PosterClientView({ site }: { site: Site }) {
  const [hostUrl, setHostUrl] = useState(`https://mihrab.in/${site.slug}`);

  // Default colored background and pattern matching the masjid's assigned aesthetics
  const defaultBg: PosterBgStyle =
    site.theme === "sultan"
      ? "sultan"
      : site.theme === "madinah"
      ? "madinah"
      : site.theme === "andalus"
      ? "sapphire"
      : site.theme === "midnight"
      ? "gold"
      : "emerald";

  const [bgStyle, setBgStyle] = useState<PosterBgStyle>(defaultBg);
  const [patternVariant, setPatternVariant] = useState<PatternVariant>(site.pattern || "andalus");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfToast, setPdfToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostUrl(`${window.location.origin}/${site.slug}`);
    }
  }, [site.slug]);

  const currentPreset = BG_PRESETS.find((p) => p.id === bgStyle) || BG_PRESETS[0];

  const nameGu = pick(site.name, "gu");
  const nameEn = site.name.en || "";
  const areaGu = pick(site.area, "gu");
  const addressGu = pick(site.address, "gu");
  const noteGu = pick(site.timesNote, "gu");
  const announcementGu = pick(site.announcement, "gu");

  // Ultra-crisp 300x300 QR code rendered at 135px for maximum scan precision
  const qrWebsiteUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
    hostUrl
  )}`;

  const qrWhatsAppUrl = site.whatsappGroupLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
        site.whatsappGroupLink
      )}`
    : "";

  async function handleDownloadPdf() {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setPdfToast("⏳ હાઈ-ક્વોલિટી PDF બની રહ્યું છે... (Generating PDF...)");

    try {
      const sheet = document.querySelector<HTMLElement>(".a4-poster-sheet");
      if (!sheet) {
        window.print();
        return;
      }

      // Dynamic import to prevent SSR issues and keep initial bundle featherweight
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Render the poster sheet to high-DPI canvas (scale 2.2 produces crisp 300dpi printout)
      const canvas = await html2canvas(sheet, {
        scale: 2.2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc: Document) => {
          const clonedSheet = clonedDoc.querySelector(".a4-poster-sheet") as HTMLElement | null;
          if (clonedSheet) {
            clonedSheet.style.boxShadow = "none";
            clonedSheet.style.maxWidth = "800px";
            clonedSheet.style.margin = "0 auto";
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Standard A4 dimensions in mm: 210 x 297
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 4; // 4mm margin
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(maxWidth / (imgWidth / 3.7795), maxHeight / (imgHeight / 3.7795));

      const finalWidth = (imgWidth / 3.7795) * ratio;
      const finalHeight = (imgHeight / 3.7795) * ratio;

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight, undefined, "FAST");
      const filename = `${site.slug}-notice-board-a4.pdf`;
      pdf.save(filename);

      setPdfToast(`✓ PDF સફળતાપૂર્વક ડાઉનલોડ થઈ ગયું! (${filename})`);
      setTimeout(() => setPdfToast(null), 4000);
    } catch (err) {
      console.error("PDF export error, falling back to print dialog:", err);
      setPdfToast("ℹ️ પ્રિન્ટ વિન્ડો ખુલી રહી છે – Destination માં 'Save as PDF' પસંદ કરો");
      setTimeout(() => setPdfToast(null), 4500);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <div className="poster-viewport" data-poster-bg={bgStyle}>
      {/* Full-Page Ambient Islamic Pattern Backdrop across the entire browser page */}
      <div className="poster-page-pattern-backdrop no-print" aria-hidden="true">
        <StarPattern
          id={`page-pattern-${patternVariant}-${bgStyle}`}
          variant={patternVariant}
          color={currentPreset.patternColor}
          className="poster-page-pattern-svg"
          strokeWidth={1.1}
        />
        <div className="poster-page-radial-glow" />
      </div>

      {/* Non-printing Luxury Customization & Control Bar */}
      <div className="poster-control-bar no-print">
        <div className="poster-control-top-row">
          <a href={`/${site.slug}`} className="poster-back-btn">
            ← {T.backToDirectory.gu.replace("← ", "")}
          </a>

          <div className="poster-control-actions">
            <span className="poster-size-hint">📄 A4 Size</span>

            {/* Direct Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="poster-download-pdf-cta"
              title="A4 સાઈઝનું હાઈ-ક્વોલિટી કલર PDF ડાઉનલોડ કરો"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>PDF બની રહ્યું છે...</span>
                </>
              ) : (
                <>
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>PDF ડાઉનલોડ (Download PDF)</span>
                </>
              )}
            </button>

            {/* Print A4 Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="poster-print-cta"
              title="A4 પ્રિન્ટ કરો અથવા બ્રાઉઝરમાં Save as PDF કરો"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>{T.printBtn.gu} (Print A4)</span>
            </button>
          </div>
        </div>

        {/* Color Background & Pattern Selectors Row */}
        <div className="poster-theme-customizer">
          <div className="customizer-group">
            <span className="customizer-label">🎨 બેકગ્રાઉન્ડ રંગ:</span>
            <div className="customizer-pills">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBgStyle(preset.id)}
                  className={`bg-toggle-pill ${bgStyle === preset.id ? "active" : ""}`}
                  title={preset.label}
                >
                  <span>{preset.icon}</span>
                  <span className="pill-name">{preset.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="customizer-group">
            <span className="customizer-label">✦ પેટર્ન:</span>
            <select
              value={patternVariant}
              onChange={(e) => setPatternVariant(e.target.value as PatternVariant)}
              className="pattern-select-dropdown"
            >
              {PATTERN_OPTIONS.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* A4 Sheet Container with Colored Background & Islamic Pattern */}
      <div className="a4-poster-sheet" data-poster-bg={bgStyle}>
        {/* Full-sheet Authentic Islamic Geometric Star Pattern Backdrop */}
        <div className="poster-pattern-backdrop" aria-hidden="true">
          <StarPattern
            id={`poster-pattern-${patternVariant}-${bgStyle}`}
            variant={patternVariant}
            color={currentPreset.patternColor}
            className="poster-full-pattern-svg"
            strokeWidth={1.25}
          />
          <div className="poster-pattern-radial-fade" />
        </div>

        {/* Double Gold / Emerald Border Container with Corner Ornaments */}
        <div className="poster-inner-frame">
          {/* Architectural 8-point star corner rosettes */}
          <span className="poster-corner-star top-left" aria-hidden="true">۞</span>
          <span className="poster-corner-star top-right" aria-hidden="true">۞</span>
          <span className="poster-corner-star bottom-left" aria-hidden="true">۞</span>
          <span className="poster-corner-star bottom-right" aria-hidden="true">۞</span>

          {/* Top Bismillah Calligraphy with Gold Arch */}
          <div className="poster-bismillah-bar">
            <span className="bismillah-flourish-left">❧</span>
            <div className="poster-bismillah" aria-hidden="true">
              بِسْمِ اللَّهِ الرَّحْمَٰનِ الرَّحِيمِ
            </div>
            <span className="bismillah-flourish-right">☙</span>
          </div>

          {/* Mosque Name & Location Header with Islamic Arch Emblem */}
          <header className="poster-header">
            <div className="poster-header-pre">
              <span className="poster-verified-seal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                સત્તાવાર ડિજિટલ સૂચના બોર્ડ • OFFICIAL NOTICE BOARD
              </span>
            </div>

            <div className="poster-arch-emblem" aria-hidden="true">
              <img src="/logo-emblem.svg" alt="Mihrab Emblem" style={{ height: "32px", width: "32px", objectFit: "contain", display: "inline-block" }} />
            </div>

            <h1 className="poster-masjid-title">{nameGu}</h1>
            {nameEn && nameEn !== nameGu && (
              <p className="poster-masjid-subtitle">{nameEn}</p>
            )}

            {(areaGu || addressGu) && (
              <div className="poster-location-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{areaGu ? `${areaGu}, અમદાવાદ` : addressGu}</span>
              </div>
            )}
          </header>

          {/* Timetable Section Title with Gold Ribbon */}
          <div className="poster-section-heading">
            <span className="heading-ornament">✦</span>
            <h2>દૈનિક અઝાન અને જમાતનો સમય • JAMAAT PRAYER TIMETABLE</h2>
            <span className="heading-ornament">✦</span>
          </div>

          {/* Premium Prayer Times Table */}
          <table className="poster-times-table">
            <thead>
              <tr>
                <th className="th-prayer">નમાઝ / PRAYER</th>
                <th className="th-azan text-center">અઝાન / AZAN</th>
                <th className="th-jamaat text-right">જમાત / JAMAAT</th>
              </tr>
            </thead>
            <tbody>
              {PRAYER_ORDER.filter((p) => site.times[p]).map((p) => {
                const azanTime = site.azanTimes?.[p];
                return (
                  <tr key={p} className="poster-prayer-row">
                    <td>
                      <div className="poster-prayer-col">
                        <span className="prayer-symbol-box">
                          {p === "fajr" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M4.93 10.93l2.83-2.83M2 18h20M19.07 10.93l-2.83-2.83M16 18a4 4 0 0 0-8 0"/></svg>
                          )}
                          {p === "zuhr" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                          )}
                          {p === "asr" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
                          )}
                          {p === "maghrib" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v6M12 15l3-3M12 15l-3-3M2 18h20M16 18a4 4 0 0 0-8 0"/></svg>
                          )}
                          {p === "isha" && (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                          )}
                        </span>
                        <div className="prayer-name-stack">
                          <span className="poster-prayer-gu">{PRAYERS[p].gu}</span>
                          <span className="poster-prayer-en">{PRAYERS[p].en}</span>
                        </div>
                      </div>
                    </td>
                    <td className="poster-time-val poster-azan-val text-center">
                      {azanTime ? displayTime(azanTime, "gu") : "—"}
                    </td>
                    <td className="poster-time-val poster-jamaat-val text-right">
                      {displayTime(site.times[p], "gu")}
                    </td>
                  </tr>
                );
              })}

              {site.times.jumuah && (
                <tr className="poster-jumuah-row">
                  <td>
                    <div className="poster-prayer-col">
                      <span className="prayer-symbol-box jumuah-symbol">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V10l6-6 6 6v11M10 21v-4a2 2 0 0 1 4 0v4"/><circle cx="12" cy="7" r="1"/></svg>
                      </span>
                      <div className="prayer-name-stack">
                        <div className="jumuah-title-wrap">
                          <span className="poster-prayer-gu">{PRAYERS.jumuah.gu}</span>
                          <span className="jumuah-special-chip">શુક્રવાર / FRIDAY</span>
                        </div>
                        <span className="poster-prayer-en">Jumu&apos;ah Mubarak</span>
                      </div>
                    </div>
                  </td>
                  <td className="poster-time-val poster-azan-val text-center">
                    {site.azanTimes?.jumuah
                      ? displayTime(site.azanTimes.jumuah, "gu")
                      : "—"}
                  </td>
                  <td className="poster-time-val poster-jamaat-val text-right">
                    {displayTime(site.times.jumuah, "gu")}
                  </td>
                </tr>
              )}

              {/* 🌙 Ramadan Special: Tarawih */}
              {site.ramadan && site.ramadan.enabled && site.ramadan.tarawih ? (
                <tr className="poster-ramadan-row tarawih-row">
                  <td>
                    <div className="poster-prayer-col">
                      <span className="prayer-symbol-box ramadan-symbol">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                          <path d="M19 3v4M21 5h-4" />
                        </svg>
                      </span>
                      <div className="prayer-name-stack">
                        <div className="ramadan-title-wrap">
                          <span className="poster-prayer-gu">તરાવીહ</span>
                          <span className="ramadan-special-chip">🌙 રમઝાન • TARAWIH</span>
                        </div>
                        <span className="poster-prayer-en">Immediately after Isha</span>
                      </div>
                    </div>
                  </td>
                  <td className="poster-time-val poster-azan-val text-center">
                    —
                  </td>
                  <td className="poster-time-val poster-jamaat-val text-right">
                    {displayTime(site.ramadan.tarawih, "gu")}
                  </td>
                </tr>
              ) : null}

              {/* 🌙 Ramadan Special: Qiyamul Lail */}
              {site.ramadan && site.ramadan.enabled && site.ramadan.qiyam ? (
                <tr className="poster-ramadan-row qiyam-row">
                  <td>
                    <div className="poster-prayer-col">
                      <span className="prayer-symbol-box ramadan-symbol">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      </span>
                      <div className="prayer-name-stack">
                        <div className="ramadan-title-wrap">
                          <span className="poster-prayer-gu">કિયામુલ લૈલ</span>
                          <span className="ramadan-special-chip">🌙 તહજ્જુદ • QIYAM</span>
                        </div>
                        <span className="poster-prayer-en">Late Night Tahajjud Jamaat</span>
                      </div>
                    </div>
                  </td>
                  <td className="poster-time-val poster-azan-val text-center">
                    —
                  </td>
                  <td className="poster-time-val poster-jamaat-val text-right">
                    {displayTime(site.ramadan.qiyam, "gu")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          {/* Note or Announcement Banner */}
          {(noteGu || announcementGu || (site.ramadan?.enabled && (site.ramadan.note?.gu || site.ramadan.note?.en))) && (
            <div className="poster-note-box">
              <div className="poster-note-badge">📢 ખાસ સૂચના / NOTICE</div>
              <div className="poster-note-content">
                {site.ramadan?.enabled && (site.ramadan.note?.gu || site.ramadan.note?.en) && (
                  <p className="poster-ramadan-note-text">
                    🌙 <strong>રમઝાન મુબારક:</strong> {site.ramadan.note.gu || site.ramadan.note.en}
                  </p>
                )}
                {announcementGu && (
                  <p className="poster-announcement-text">{announcementGu}</p>
                )}
                {noteGu && <p className="poster-note-text">📌 {noteGu}</p>}
              </div>
            </div>
          )}

          {/* 🌟 HIGHLIGHTED DIGITAL SCAN HUB (COMMANDING QR SHOWCASE) 🌟 */}
          <section className="poster-scan-hub">
            <div className="scan-hub-ambient-glow" aria-hidden="true" />
            <div className="poster-scan-hub-header">
              <div className="scan-hub-pill-tag">
                <span className="scan-live-dot" />
                <span>📲 ડિજિટલ મસ્જિદ કનેક્ટ • DIGITAL SCAN HUB</span>
              </div>
              <h3 className="poster-scan-hub-title">
                રોજના લાઈવ જમાતના સમય અને તમામ અપડેટ્સ મેળવવા માટે સ્કેન કરો
              </h3>
              <p className="poster-scan-hub-desc">
                તમારા મોબાઈલ કેમેરાથી સીધા સ્કેન કરી સમય સાચવો અથવા સત્તાવાર વોટ્સએપ ગ્રૂપમાં જોડાઓ
              </p>
            </div>

            <div className={`poster-scan-pods-grid ${qrWhatsAppUrl ? "dual-pods" : "single-pod"}`}>
              {/* POD 1: Live Timetable & Website */}
              <div className="poster-scan-pod website-scan-pod">
                <div className="pod-header-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>લાઈવ જમાત સમય & વેબ પેજ</span>
                </div>

                {/* Viewfinder Framed QR Code */}
                <div className="pod-viewfinder-frame">
                  <span className="pod-vf-bracket vf-tl" />
                  <span className="pod-vf-bracket vf-tr" />
                  <span className="pod-vf-bracket vf-bl" />
                  <span className="pod-vf-bracket vf-br" />

                  <img
                    src={qrWebsiteUrl}
                    alt="Mihrab Live Timetable QR"
                    width={135}
                    height={135}
                    crossOrigin="anonymous"
                    className="pod-qr-img"
                  />
                  <div className="pod-center-badge">
                    <span>🕌</span>
                  </div>
                </div>

                <div className="pod-body">
                  <strong className="pod-action-title">📱 દૈનિક જમાત સમય</strong>
                  <span className="pod-action-subtitle">
                    રોજના તાજા સમય, અઝાન અને રસ્તો
                  </span>
                  <div className="pod-url-pill">
                    <code>{hostUrl.replace(/^https?:\/\//, "")}</code>
                  </div>
                </div>
              </div>

              {/* POD 2: Official WhatsApp Community Group */}
              {qrWhatsAppUrl && (
                <div className="poster-scan-pod whatsapp-scan-pod">
                  <div className="pod-header-label wa-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span>સત્તાવાર વોટ્સએપ ગ્રૂપ</span>
                  </div>

                  {/* Viewfinder Framed QR Code */}
                  <div className="pod-viewfinder-frame wa-vf-frame">
                    <span className="pod-vf-bracket vf-tl wa" />
                    <span className="pod-vf-bracket vf-tr wa" />
                    <span className="pod-vf-bracket vf-bl wa" />
                    <span className="pod-vf-bracket vf-br wa" />

                    <img
                      src={qrWhatsAppUrl}
                      alt="WhatsApp Group Community QR"
                      width={135}
                      height={135}
                      crossOrigin="anonymous"
                      className="pod-qr-img wa-qr-img"
                    />
                    <div className="pod-center-badge wa-center-badge">
                      <span>💬</span>
                    </div>
                  </div>

                  <div className="pod-body">
                    <strong className="pod-action-title wa-title">💬 વોટ્સએપ કમ્યુનિટી</strong>
                    <span className="pod-action-subtitle">
                      જુમ્મા બયાન અને ખાસ સૂચનાઓ
                    </span>
                    <div className="pod-url-pill wa-pill">
                      <span>✓ સત્તાવાર ગ્રૂપમાં જોડાઓ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="poster-scan-footer-guide">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span>મોબાઈલમાં કેમેરા અથવા Google Lens ચાલુ કરી QR કોડ સ્કેન કરો</span>
            </div>
          </section>

          {/* Bottom Watermark & Verification */}
          <footer className="poster-footer-bar">
            <div className="poster-watermark-left" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <img src="/logo-emblem.svg" alt="Mihrab" style={{ height: "14px", width: "14px" }} />
              <span><strong>Mihrab.in</strong> – અમદાવાદની મસ્જિદો માટે ડિજિટલ નેટવર્ક</span>
            </div>
            {site.updatedOn && (
              <div className="poster-watermark-right">
                છેલ્લી અપડેટ: {displayDate(site.updatedOn, "gu")}
              </div>
            )}
          </footer>
        </div>
      </div>

      {/* Floating Download PDF Status Toast Notification */}
      {pdfToast && (
        <div className="poster-toast-notification no-print" role="status">
          <span className="toast-icon">📄</span>
          <span>{pdfToast}</span>
        </div>
      )}
    </div>
  );
}
