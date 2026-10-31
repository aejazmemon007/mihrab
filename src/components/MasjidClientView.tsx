"use client";

import { useState, useMemo, useEffect } from "react";
import type { Site } from "@/lib/sites";
import {
  type Lang,
  FACILITIES,
  LANG_LABEL,
  PRAYERS,
  T,
  displayDate,
  displayTime,
  pick,
} from "@/lib/i18n";
import { StarPattern, type PatternVariant } from "./StarPattern";

const PRAYER_ORDER = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;

export function pathFor(slug: string, lang: Lang): string {
  return lang === "gu" ? `/${slug}` : `/${slug}/en`;
}

interface NextPrayerInfo {
  prayer: string;
  minutesRemaining: number;
}

function getNextPrayerInfo(times: Record<string, string>): NextPrayerInfo | null {
  try {
    const now = new Date();
    const indiaTimeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(now);
    const [currH, currM] = indiaTimeStr.split(":").map(Number);
    const currentMinutes = currH * 60 + currM;

    function parseToMinutes(tStr: string, prayer: string): number | null {
      if (!tStr) return null;
      const clean = tStr.trim().toLowerCase();
      if (clean === "sunset") {
        return 18 * 60 + 20; // approximate sunset ~ 6:20 PM
      }
      const match = clean.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (prayer === "zuhr" && h < 11) h += 12;
      if (prayer === "asr" && h < 12) h += 12;
      if (prayer === "maghrib" && h < 12) h += 12;
      if (prayer === "isha" && h < 12) h += 12;
      return h * 60 + m;
    }

    for (const p of PRAYER_ORDER) {
      const mins = parseToMinutes(times[p], p);
      if (mins !== null && mins > currentMinutes) {
        return { prayer: p, minutesRemaining: mins - currentMinutes };
      }
    }

    // After Isha, rolls over to tomorrow's Fajr
    const fajrMins = parseToMinutes(times.fajr, "fajr");
    if (fajrMins !== null) {
      const remaining = 24 * 60 - currentMinutes + fajrMins;
      return { prayer: "fajr", minutesRemaining: remaining };
    }

    return null;
  } catch {
    return null;
  }
}

function formatCountdown(minutes: number, lang: Lang): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h}${T.hours[lang]} ${m}${T.minutes[lang]} ${T.remainingTime[lang]}`;
  }
  return `${m}${T.minutes[lang]} ${T.remainingTime[lang]}`;
}

function PrayerIcon({ prayer }: { prayer: string }) {
  switch (prayer) {
    case "fajr":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v4M4.93 10.93l2.83-2.83M2 18h20M20 18a8 8 0 0 0-16 0" />
        </svg>
      );
    case "zuhr":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case "asr":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v3M12 20v3M2 12h3M20 12h3M12 7v5l3 3" />
        </svg>
      );
    case "maghrib":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M5.22 13.22l1.42 1.42M18.78 13.22l-1.42 1.42M2 18h20M20 18a8 8 0 0 0-16 0" />
        </svg>
      );
    case "isha":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          <path d="M19 3v4M21 5h-4" />
        </svg>
      );
    case "jumuah":
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21h18M5 21V11l7-7 7 7v10M9 21v-6a3 3 0 0 1 6 0v6M12 4V2" />
        </svg>
      );
  }
}

function FacilityIcon({ facilityKey }: { facilityKey: string }) {
  switch (facilityKey) {
    case "wuzu":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case "ladies":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
        </svg>
      );
    case "madrasa":
    case "library":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "parking":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
        </svg>
      );
    case "wheelchair":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="16" cy="4" r="2" />
          <path d="M12 11h4l-2 5 3 4M5 19a5 5 0 1 0 5-5H7" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
  }
}

export function MasjidClientView({
  site,
  lang,
}: {
  site: Site;
  lang: Lang;
}) {
  const currentTheme = site.theme || "noor";
  const resolvedPattern: PatternVariant =
    site.pattern ||
    (currentTheme === "sultan"
      ? "girih"
      : currentTheme === "madinah"
      ? "damascus"
      : (currentTheme as PatternVariant));
  const [heroMode, setHeroMode] = useState<"photo" | "pattern">("photo");
  const [photoError, setPhotoError] = useState(false);
  const nextInfo = useMemo(() => getNextPrayerInfo(site.times), [site.times]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.body.setAttribute("data-theme", currentTheme);
    document.documentElement.style.colorScheme =
      currentTheme === "midnight" ? "dark" : "light";
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.body.removeAttribute("data-theme");
      document.documentElement.style.colorScheme = "";
    };
  }, [currentTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.body.setAttribute("data-theme", currentTheme);
    document.documentElement.style.colorScheme =
      currentTheme === "midnight" ? "dark" : "light";
    return () => {
      document.documentElement.removeAttribute("data-theme");
      document.body.removeAttribute("data-theme");
      document.documentElement.style.colorScheme = "";
    };
  }, [currentTheme]);

  if (site.status === "off") {
    return (
      <main className="page" lang={lang} data-theme={currentTheme}>
        <nav className="topbar" aria-label="Language">
          <a href="/" className="home-nav-link">
            {T.backToDirectory[lang]}
          </a>
          <div className="lang-switch">
            {(["gu", "en"] as const).map((l) => (
              <a
                key={l}
                href={pathFor(site.slug, l)}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "page" : undefined}
              >
                {LANG_LABEL[l]}
              </a>
            ))}
          </div>
        </nav>
        <div className="notice">
          <h1>{T.offTitle[lang]}</h1>
          <p>{T.offBody[lang]}</p>
        </div>
      </main>
    );
  }

  const name = pick(site.name, lang);
  const otherLang: Lang = lang === "gu" ? "en" : "gu";
  const altName =
    site.name[otherLang] && site.name[otherLang] !== name
      ? site.name[otherLang]
      : "";
  const area = pick(site.area, lang);
  const address = pick(site.address, lang);
  const note = pick(site.timesNote, lang);
  const announcement = pick(site.announcement, lang);
  const about = pick(site.about, lang);
  const phone = site.phonePublic.replace(/\D/g, "");
  const whatsapp = site.whatsappPublic.replace(/\D/g, "");

  // Auto-resolve hero photo: custom photo in database, URL, upload, or fallback by slug
  const photoSrc = site.photo
    ? site.photo.startsWith("http://") || site.photo.startsWith("https://") || site.photo.startsWith("/") || site.photo.startsWith("data:")
      ? site.photo
      : `/photos/${site.photo}`
    : `/photos/${site.slug}.jpg`;

  function handleShare() {
    const timeLines = PRAYER_ORDER.filter((p) => site.times[p])
      .map((p) => {
        const azan = site.azanTimes?.[p]
          ? ` (${T.azan[lang]}: ${displayTime(site.azanTimes[p], lang)})`
          : "";
        return `• ${PRAYERS[p][lang]}: ${displayTime(site.times[p], lang)}${azan}`;
      })
      .join("\n");
    const jumuahAzan = site.azanTimes?.jumuah
      ? ` (${T.azan[lang]}: ${displayTime(site.azanTimes.jumuah, lang)})`
      : "";
    const jumuahLine = site.times.jumuah
      ? `\n• ${PRAYERS.jumuah[lang]}: ${displayTime(
          site.times.jumuah,
          lang
        )}${jumuahAzan}`
      : "";

    const fullShare =
      lang === "gu"
        ? `🕌 *${name}*\n📍 ${area || address}\n\n*આજનો જમાતનો સમય:*\n${timeLines}${jumuahLine}\n\nતમામ વિગત અને રસ્તો જુઓ:\n${window.location.href}`
        : `🕌 *${name}*\n📍 ${area || address}\n\n*Today's Jamaat Prayer Times:*\n${timeLines}${jumuahLine}\n\nView details & directions:\n${window.location.href}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullShare)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main
      className="page masjid-detail-page"
      lang={lang}
      data-theme={currentTheme}
    >
      {/* Top Bar Navigation */}
      <nav className="topbar" aria-label="Navigation">
        <a href="/" className="home-nav-link" aria-label={T.backToDirectory[lang]}>
          <img src="/logo-emblem.svg" alt="Mihrab" className="brand-logo-emblem" style={{ height: "22px", width: "22px" }} />
          <span>{T.backToDirectory[lang]}</span>
        </a>

        <div className="topbar-actions">
          <div className="lang-switch">
            {(["gu", "en"] as const).map((l) => (
              <a
                key={l}
                href={pathFor(site.slug, l)}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "page" : undefined}
              >
                {LANG_LABEL[l]}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Preview Banner (only for preview-status masjids) */}
      {site.status === "preview" && (
        <div className="theme-bar-wrapper">
          <div className="preview-container">
            <div className="preview-banner-text">
              <span className="preview-pulse-dot"></span>
              <span>{T.previewBanner[lang]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Visual Media: Photo or Islamic Geometric Pattern Art */}
      <div className="hero-media-wrapper">
        <div className={`hero-media ${heroMode === "pattern" ? "pattern-active-mode" : ""}`}>
          {heroMode === "photo" && !photoError ? (
            <img
              src={photoSrc}
              alt={name}
              width={1600}
              height={900}
              loading="eager"
              onError={() => setPhotoError(true)}
              className="hero-photo-img"
            />
          ) : (
            <div className="hero-pattern-canvas">
              <StarPattern
                id={`hero-pattern-${resolvedPattern}`}
                variant={resolvedPattern}
                className="hero-full-pattern"
              />
              <div className="hero-pattern-glow" aria-hidden="true"></div>
              <div className="hero-pattern-center-emblem" aria-hidden="true">
                <div className="emblem-inner-star"></div>
                <div className="emblem-arabic">﷽</div>
              </div>
            </div>
          )}

          {/* Vignette Shadow Overlay (when in photo mode) */}
          {heroMode === "photo" && (
            <div className="hero-overlay-gradient" aria-hidden="true"></div>
          )}

          {/* Top Badges */}
          <div className="hero-top-badges">
            <span className="frosted-verified-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {T.verifiedBadge[lang]}
            </span>
          </div>

          {/* Floating Frosted Glass Action & Location Badges */}
          <div className="hero-glass-badges">
            {area && (
              <span className="frosted-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {area}
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="frosted-share-btn"
              title={T.shareTimesBtn[lang]}
              aria-label={T.shareTimesBtn[lang]}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{lang === "gu" ? "શેર" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Masjid Title and Subhead */}
      <header className="masjid-masthead">
        <div className="arabic-bismillah-top" aria-hidden="true">
          {T.bismillah[lang]}
        </div>
        <h1 className="masjid-name">{name}</h1>
        {altName && (
          <p className="masjid-name-alt" lang={otherLang}>
            {altName}
          </p>
        )}
        {address && <p className="masjid-address-line">{address}</p>}
      </header>

      {/* Ultra-Premium Jamaat Times Panel */}
      <section className="times" aria-labelledby="times-heading">
        <StarPattern
          id={`times-pattern-tr-${resolvedPattern}`}
          variant={resolvedPattern}
          className="times-pattern times-pattern-tr"
          color={
            currentTheme === "midnight"
              ? "#00e599"
              : currentTheme === "andalus"
              ? "#ecae55"
              : currentTheme === "sultan"
              ? "#d97706"
              : currentTheme === "madinah"
              ? "#e11d48"
              : "#e8c472"
          }
          strokeWidth={1.5}
        />
        <StarPattern
          id={`times-pattern-bl-${resolvedPattern}`}
          variant={resolvedPattern}
          className="times-pattern times-pattern-bl"
          color={
            currentTheme === "midnight"
              ? "#00e599"
              : currentTheme === "andalus"
              ? "#ecae55"
              : currentTheme === "sultan"
              ? "#d97706"
              : currentTheme === "madinah"
              ? "#e11d48"
              : "#e8c472"
          }
          strokeWidth={1.2}
        />

        <div className="times-header-row">
          <div className="times-title-wrap">
            <h2 id="times-heading">{T.jamaatTimes[lang]}</h2>
            <div className="bismillah-subtext" aria-hidden="true">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          </div>

          {nextInfo && (
            <div className="next-prayer-chip">
              <span className="pulsing-emerald-dot" aria-hidden="true"></span>
              <div className="next-prayer-details">
                <span className="next-prayer-name">
                  {PRAYERS[nextInfo.prayer as keyof typeof PRAYERS][lang]} (
                  {displayTime(site.times[nextInfo.prayer as keyof typeof site.times], lang)})
                </span>
                <span className="next-prayer-countdown">
                  • {formatCountdown(nextInfo.minutesRemaining, lang)}
                </span>
              </div>
            </div>
          )}
        </div>

        <ul className="times-list">
          {PRAYER_ORDER.filter((p) => site.times[p]).map((p) => {
            const isNext = nextInfo?.prayer === p;
            return (
              <li
                className={`times-row ${isNext ? "highlight-next-prayer" : ""}`}
                key={p}
              >
                <div className="prayer-label-wrap">
                  <span className="prayer-icon-box" aria-hidden="true">
                    <PrayerIcon prayer={p} />
                  </span>
                  <span className="prayer-name-text">{PRAYERS[p][lang]}</span>
                  {isNext && (
                    <span className="next-indicator-pill">
                      {lang === "gu" ? "આગામી" : "Next"}
                    </span>
                  )}
                </div>
                <span className="times-value">
                  {displayTime(site.times[p], lang)}
                </span>
              </li>
            );
          })}

          {site.times.jumuah && (
            <li className="times-row jumuah">
              <div className="prayer-label-wrap">
                <span className="prayer-icon-box jumuah-icon-box" aria-hidden="true">
                  <PrayerIcon prayer="jumuah" />
                </span>
                <span className="prayer-name-text">{PRAYERS.jumuah[lang]}</span>
                <span className="jumuah-pill">
                  {lang === "gu" ? "શુક્રવાર" : "Friday"}
                </span>
              </div>
              <span className="times-value">
                {displayTime(site.times.jumuah, lang)}
              </span>
            </li>
          )}
        </ul>

        {/* 🌙 RAMADAN SPECIAL: TARAWIH & QIYAMUL LAIL */}
        {site.ramadan && site.ramadan.enabled && (site.ramadan.tarawih || site.ramadan.qiyam) ? (
          <div className="ramadan-special-box" role="region" aria-label={T.ramadanSpecial[lang]}>
            <div className="ramadan-box-top">
              <div className="ramadan-top-badge">
                <span className="ramadan-crescent-emoji" aria-hidden="true">🌙</span>
                <span className="ramadan-badge-title">{T.ramadanSpecial[lang]}</span>
              </div>
              <span className="ramadan-sub-tag">
                {lang === "gu" ? "મુબારક માસ" : "Holy Month"}
              </span>
            </div>

            <div className="ramadan-cards-grid">
              {/* Tarawih Card */}
              {site.ramadan.tarawih ? (
                <div className="ramadan-time-card tarawih-card">
                  <div className="ramadan-card-head">
                    <span className="ramadan-card-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        <path d="M19 3v4M21 5h-4" />
                      </svg>
                    </span>
                    <div className="ramadan-card-info">
                      <strong className="ramadan-card-title">{T.tarawih[lang]}</strong>
                      <span className="ramadan-card-pill">{T.afterIsha[lang]}</span>
                    </div>
                  </div>
                  <div className="ramadan-time-num">
                    <span className="time-sub-tag">{T.jamaat[lang]}</span>
                    <span className="ramadan-num-val">{displayTime(site.ramadan.tarawih, lang)}</span>
                  </div>
                </div>
              ) : null}

              {/* Qiyamul Lail Card */}
              {site.ramadan.qiyam ? (
                <div className="ramadan-time-card qiyam-card">
                  <div className="ramadan-card-head">
                    <span className="ramadan-card-icon qiyam-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    </span>
                    <div className="ramadan-card-info">
                      <strong className="ramadan-card-title">{T.qiyamulLail[lang]}</strong>
                      <span className="ramadan-card-pill">{T.tahajjudTime[lang]}</span>
                    </div>
                  </div>
                  <div className="ramadan-time-num">
                    <span className="time-sub-tag">{T.jamaat[lang]}</span>
                    <span className="ramadan-num-val">{displayTime(site.ramadan.qiyam, lang)}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Ramadan Note / Special Program */}
            {site.ramadan.note && pick(site.ramadan.note, lang) ? (
              <div className="ramadan-note-strip">
                <span className="ramadan-note-sparkle" aria-hidden="true">✨</span>
                <span className="ramadan-note-text">{pick(site.ramadan.note, lang)}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {note && (
          <div className="times-note">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{note}</span>
          </div>
        )}

        {site.updatedOn && (
          <p className="times-updated">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              {T.updated[lang]}: {displayDate(site.updatedOn, lang)}
            </span>
          </p>
        )}
      </section>

      {/* 1-Tap WhatsApp Share Bar */}
      <div className="share-bar-container">
        <button
          type="button"
          onClick={handleShare}
          className="share-timetable-cta"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{T.shareTimesBtn[lang]}</span>
        </button>
      </div>

      {/* Masjid WhatsApp Community Group & QR Section */}
      {site.whatsappGroupLink && (
        <section className="whatsapp-community-section" aria-labelledby="wa-group-heading">
          <div className="wa-group-card">
            <div className="wa-group-content">
              <div className="wa-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>{T.whatsappGroupHeading[lang]}</span>
              </div>
              <h2 id="wa-group-heading" className="wa-group-title">
                {name} {T.whatsappGroupHeading[lang]}
              </h2>
              <p className="wa-group-desc">
                {pick(site.whatsappGroupText, lang) || T.whatsappGroupDesc[lang]}
              </p>
              <div className="wa-actions-row">
                <a
                  href={site.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-join-cta-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>{T.joinGroupBtn[lang]}</span>
                </a>
              </div>
            </div>

            <div className="wa-qr-frame">
              <div className="wa-qr-box">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(
                    site.whatsappGroupLink
                  )}`}
                  alt={`WhatsApp Group QR Code for ${name}`}
                  width={150}
                  height={150}
                  loading="lazy"
                  className="wa-qr-img"
                />
                <div className="wa-qr-center-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
                  </svg>
                </div>
              </div>
              <span className="wa-scan-hint">{T.scanToJoinGroup[lang]}</span>
            </div>
          </div>
        </section>
      )}

      {/* Printable A4 Notice Board Poster & PDF Download Card */}
      <div className="poster-access-card">
        <div className="poster-access-info">
          <span className="poster-access-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>{lang === "gu" ? "પ્રિન્ટેબલ નોટિસ બોર્ડ" : "Printable Notice Board"}</span>
          </span>
          <h4>{lang === "gu" ? "A4 પોસ્ટર & PDF ડાઉનલોડ" : "A4 Poster & PDF Download"}</h4>
          <p>
            {lang === "gu"
              ? "મસ્જિદના બોર્ડ માટે આકર્ષક કલર પોસ્ટર અને QR કોડ સાથે PDF ડાઉનલોડ અથવા પ્રિન્ટ કરો."
              : "Download or print high-resolution A4 notice board poster with live QR codes in PDF."}
          </p>
        </div>
        <a href={`/${site.slug}/poster`} className="poster-access-btn">
          <span>{lang === "gu" ? "પોસ્ટર & PDF જુઓ" : "Open Poster & PDF"}</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>

      {/* Announcement Banner */}
      {announcement && (
        <section className="announcement" aria-labelledby="announcement-heading">
          <div className="announcement-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span>{T.announcement[lang]}</span>
          </div>
          <p>{announcement}</p>
        </section>
      )}

      {/* About Section */}
      {about && (
        <section className="section" aria-labelledby="about-heading">
          <h2 id="about-heading">{T.about[lang]}</h2>
          <p className="section-body-text">{about}</p>
        </section>
      )}

      {/* Facilities Grid with Vector Icons */}
      {site.facilities.length > 0 && (
        <section className="section" aria-labelledby="facilities-heading">
          <h2 id="facilities-heading">{T.facilities[lang]}</h2>
          <ul className="facility-grid">
            {site.facilities.map((key) => {
              const label = FACILITIES[key]?.[lang] || key;
              return (
                <li key={key} className="facility-card">
                  <span className="facility-icon-wrap" aria-hidden="true">
                    <FacilityIcon facilityKey={key} />
                  </span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Quick Actions & Location */}
      {(phone || whatsapp || site.mapLink || address) && (
        <section className="section" aria-labelledby="contact-heading">
          <h2 id="contact-heading">{T.contact[lang]}</h2>
          <div className="actions-grid">
            {site.mapLink && (
              <a
                className="action-btn primary-action"
                href={site.mapLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                <span>{T.directions[lang]}</span>
              </a>
            )}

            {whatsapp && (
              <a
                className="action-btn whatsapp-action"
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>{T.whatsapp[lang]}</span>
              </a>
            )}

            {phone && (
              <a className="action-btn secondary-action" href={`tel:+${phone}`}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{T.call[lang]}</span>
              </a>
            )}

            {/* Notice Board Poster Link */}
            <a
              className="action-btn poster-action"
              href={`/${site.slug}/poster`}
            >
              <svg
                width="18"
                height="18"
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
              <span>{T.printPosterBtn[lang]}</span>
            </a>
          </div>

          {address && (
            <p className="address-card">
              <strong>{T.address[lang]}:</strong> {address}
            </p>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <p className="footer-credit" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <img src="/logo-emblem.svg" alt="Mihrab" style={{ height: "16px", width: "16px", verticalAlign: "middle" }} />
          <span>{T.madeWith[lang]}</span>
        </p>
      </footer>
    </main>
  );
}
