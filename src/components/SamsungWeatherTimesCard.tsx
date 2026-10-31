"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Site, SiteTheme } from "@/lib/sites";
import {
  type Lang,
  PRAYERS,
  T,
  displayDate,
  displayTime,
  pick,
} from "@/lib/i18n";
import { StarPattern } from "./StarPattern";

export type TimeAtmosphere = "auto" | "dawn" | "day" | "golden" | "sunset" | "night";

const PRAYER_ORDER = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;

function PrayerTimelineIcon({ prayerKey }: { prayerKey: string }) {
  switch (prayerKey) {
    case "fajr":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v4M4.93 10.93l2.83-2.83M2 18h20M20 18a8 8 0 0 0-16 0" />
        </svg>
      );
    case "zuhr":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case "asr":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 1v3M12 20v3M2 12h3M20 12h3M12 7v5l3 3" />
        </svg>
      );
    case "maghrib":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M5.22 13.22l1.42 1.42M18.78 13.22l-1.42 1.42M2 18h20M20 18a8 8 0 0 0-16 0" />
        </svg>
      );
    case "isha":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M19 3v4M21 5h-4" />
        </svg>
      );
    case "jumuah":
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21h18M5 21V11l7-7 7 7v10M9 21v-6a3 3 0 0 1 6 0v6M12 4V2" />
        </svg>
      );
  }
}

export function getAutoTimeAtmosphere(): "dawn" | "day" | "golden" | "sunset" | "night" {
  try {
    const now = new Date();
    const indiaTimeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(now);
    const hour = parseInt(indiaTimeStr, 10);
    if (hour >= 4 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 16) return "day";
    if (hour >= 16 && hour < 18) return "golden";
    if (hour >= 18 && hour < 20) return "sunset";
    return "night";
  } catch {
    return "day";
  }
}

export function getCurrentIndiaTimeFormatted(): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "";
  }
}

interface SamsungWeatherTimesCardProps {
  site: Site;
  lang: Lang;
  nextInfo: { prayer: string; minutesRemaining: number } | null;
  onShare: () => void;
  theme?: SiteTheme;
}

export function SamsungWeatherTimesCard({
  site,
  lang,
  nextInfo,
  onShare,
  theme = "noor",
}: SamsungWeatherTimesCardProps) {
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<TimeAtmosphere>("auto");
  const [liveIndiaTime, setLiveIndiaTime] = useState("");

  useEffect(() => {
    setLiveIndiaTime(getCurrentIndiaTimeFormatted());
    const interval = setInterval(() => {
      setLiveIndiaTime(getCurrentIndiaTimeFormatted());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeAtmosphere = useMemo(() => {
    if (selectedAtmosphere !== "auto") {
      return selectedAtmosphere;
    }
    // In Royal Hilal Midnight (Dark) theme, auto mode defaults to nocturnal Hilal night sky!
    if (theme === "midnight") {
      return "night";
    }
    return getAutoTimeAtmosphere();
  }, [selectedAtmosphere, theme]);

  const name = pick(site.name, lang);
  const area = pick(site.area, lang);
  const address = pick(site.address, lang);
  const note = pick(site.timesNote, lang);
  const announcement = pick(site.announcement, lang);

  // Active next prayer details
  const nextPrayerKey = nextInfo ? (nextInfo.prayer as keyof typeof PRAYERS) : "fajr";
  const nextPrayerName = PRAYERS[nextPrayerKey][lang];
  const nextPrayerTimeStr = site.times[nextPrayerKey]
    ? displayTime(site.times[nextPrayerKey], lang)
    : "--:--";

  // Countdown text
  const countdownText = useMemo(() => {
    if (!nextInfo) return "";
    const h = Math.floor(nextInfo.minutesRemaining / 60);
    const m = nextInfo.minutesRemaining % 60;
    if (h > 0) {
      return `${h}${T.hours[lang]} ${m}${T.minutes[lang]} ${T.remainingTime[lang]}`;
    }
    return `${m}${T.minutes[lang]} ${T.remainingTime[lang]}`;
  }, [nextInfo, lang]);

  // Prayer list for horizontal weather forecast curve
  const prayerItems = useMemo(() => {
    const list: Array<{
      key: string;
      label: string;
      time: string;
      isNext: boolean;
      yPos: number;
    }> = [];

    // Curve heights (Y coordinate in 60px height SVG box):
    // Fajr (Dawn horizon ~ 38)
    // Zuhr (Noon Sun zenith ~ 10)
    // Asr (Afternoon sun ~ 18)
    // Maghrib (Sunset horizon ~ 36)
    // Isha (Night ~ 46)
    // Jumuah (Special Friday ~ 14)
    const yMap: Record<string, number> = {
      fajr: 38,
      zuhr: 12,
      asr: 20,
      maghrib: 36,
      isha: 46,
      jumuah: 16,
    };

    PRAYER_ORDER.forEach((p) => {
      if (site.times[p]) {
        list.push({
          key: p,
          label: PRAYERS[p][lang],
          time: displayTime(site.times[p], lang),
          isNext: nextInfo?.prayer === p,
          yPos: yMap[p] ?? 25,
        });
      }
    });

    if (site.times.jumuah) {
      list.push({
        key: "jumuah",
        label: PRAYERS.jumuah[lang],
        time: displayTime(site.times.jumuah, lang),
        isNext: nextInfo?.prayer === "jumuah",
        yPos: yMap.jumuah,
      });
    }

    return list;
  }, [site.times, nextInfo, lang]);

  return (
    <section
      className={`samsung-weather-card atmosphere-${activeAtmosphere}`}
      aria-labelledby="weather-times-heading"
    >
      {/* Decorative Star Pattern Watermark */}
      <StarPattern
        id={`weather-bg-pattern-${activeAtmosphere}`}
        className="weather-card-watermark"
        variant={
          theme === "midnight" || activeAtmosphere === "night"
            ? "midnight"
            : activeAtmosphere === "sunset" || activeAtmosphere === "golden"
            ? "andalus"
            : "noor"
        }
        color={
          theme === "midnight" || activeAtmosphere === "night"
            ? "rgba(0, 229, 153, 0.16)"
            : "rgba(255, 255, 255, 0.15)"
        }
      />

      {/* Atmospheric Celestial Body (Radiant Sun, Sunset Sun, Crescent Moon, Dawn Star) */}
      <div className={`celestial-body celestial-${activeAtmosphere}`} aria-hidden="true">
        {activeAtmosphere === "day" && (
          <div className="sun-radiance-container">
            <div className="sun-core"></div>
            <div className="sun-lens-glow"></div>
            <div className="sun-beam-burst"></div>
          </div>
        )}
        {activeAtmosphere === "golden" && (
          <div className="golden-sun-container">
            <div className="golden-core"></div>
            <div className="golden-haze"></div>
          </div>
        )}
        {activeAtmosphere === "dawn" && (
          <div className="dawn-sun-container">
            <div className="morning-star">✦</div>
            <div className="dawn-glow-orb"></div>
          </div>
        )}
        {activeAtmosphere === "sunset" && (
          <div className="sunset-sun-container">
            <div className="sunset-core"></div>
            <div className="sunset-horizon-glow"></div>
          </div>
        )}
        {activeAtmosphere === "night" && (
          <div className="night-moon-container" aria-label="Hilal Crescent Moon">
            <svg
              className="crescent-moon-svg"
              width="46"
              height="46"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="hilalGoldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDF5" />
                  <stop offset="35%" stopColor="#FFE082" />
                  <stop offset="75%" stopColor="#FFB300" />
                  <stop offset="100%" stopColor="#FFA000" />
                </linearGradient>
              </defs>
              <path
                d="M34 8.5C32.2 7.8 30.2 7.4 28.1 7.4C16.8 7.4 7.6 16.6 7.6 27.9C7.6 39.2 16.8 48.4 28.1 48.4C32.2 48.4 36 47.2 39.2 45.1C28.1 43.5 19.6 34 19.6 22.4C19.6 16.8 21.8 11.7 25.5 7.9C28.1 5.3 31.5 3.5 35.3 2.8C33 4.5 31.1 6.8 29.8 9.4"
                fill="url(#hilalGoldSheen)"
                transform="scale(0.86) translate(3, 1)"
              />
              <path
                d="M33 15L34.2 18.2L37.4 19.4L34.2 20.6L33 23.8L31.8 20.6L28.6 19.4L31.8 18.2Z"
                fill="#FFF9E6"
                opacity="0.95"
              />
            </svg>
            <div className="moon-ambient-halo"></div>
            <div className="star-twinkle t1">✦</div>
            <div className="star-twinkle t2">✦</div>
            <div className="star-twinkle t3">✦</div>
          </div>
        )}
      </div>

      {/* Top Location Bar (Samsung One UI Header: Pin + Location + Live Time) */}
      <div className="weather-header-strip">
        <div className="weather-location-wrap">
          <svg
            className="weather-pin-icon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="weather-location-name">{area || address || name}</span>
        </div>

        {liveIndiaTime && (
          <div className="weather-live-time-chip">
            <span className="live-clock-beacon"></span>
            <span>{liveIndiaTime}</span>
          </div>
        )}
      </div>

      {/* Hero Massive Display Numeral (Like `19°` in Samsung Weather) */}
      <div className="weather-hero-block">
        <div className="weather-hero-status-row">
          <span className="weather-hero-kicker">
            {T.nextJamaat[lang]}
          </span>
          <span className="weather-bismillah-arabic" aria-hidden="true">
            بِسْمِ اللَّهِ
          </span>
        </div>

        <div className="weather-hero-numeral-wrap">
          <h2 id="weather-times-heading" className="weather-display-numeral">
            {nextPrayerTimeStr}
          </h2>
          <div className="weather-prayer-name-tag">
            <span className="prayer-name-large">{nextPrayerName}</span>
            <span className="prayer-badge-small">
              {lang === "gu" ? "જમાત" : "Jamaat"}
            </span>
          </div>
        </div>

        {/* Countdown & Subtitle Info (Like `↑ 19° / ↓ 11° Feels like 19°`) */}
        <div className="weather-details-row">
          {countdownText && (
            <span className="weather-countdown-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{countdownText}</span>
            </span>
          )}

          {site.updatedOn && (
            <span className="weather-updated-pill">
              {T.updated[lang]}: {displayDate(site.updatedOn, lang)}
            </span>
          )}
        </div>
      </div>

      {/* Frosted Glass Notice Strip (Like "Light rain late. Low 11C." in Samsung Weather) */}
      {(note || announcement) && (
        <div className="weather-notice-strip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="weather-notice-text">
            {announcement || note}
          </span>
        </div>
      )}

      {/* Horizontal Continuous Prayer Timeline with Solar Curve (Samsung Weather Hourly Strip) */}
      <div className="weather-forecast-container">
        <div className="forecast-title-row">
          <span className="forecast-title">{T.solarTrajectory[lang]}</span>
          <span className="forecast-indicator-label">
            {lang === "gu" ? "આગામી જમાત" : "Upcoming"}
          </span>
        </div>

        <div className="weather-timeline-scroll">
          <div className="weather-timeline-grid">
            {prayerItems.map((item, index) => (
              <div
                key={item.key}
                className={`timeline-column ${item.isNext ? "is-next-active" : ""}`}
              >
                {/* Time Label (4 PM, 5 PM -> Fajr, Zuhr...) */}
                <span className="timeline-prayer-name">{item.label}</span>

                {/* Vector Celestial Icon for Prayer */}
                <div className="timeline-icon-wrap" aria-hidden="true">
                  <PrayerTimelineIcon prayerKey={item.key} />
                </div>

                {/* Jamaat Time Display (19°, 20° -> 5:30, 1:30...) */}
                <span className="timeline-time-val">{item.time}</span>

                {/* Active Next Dot / Badge */}
                <div className="timeline-node-wrapper">
                  <span className={`timeline-dot ${item.isNext ? "active-beacon" : ""}`}></span>
                </div>

                {/* Status indicator below node (like precipitation `0%` in Samsung Weather) */}
                <span className="timeline-sub-note">
                  {item.isNext ? (lang === "gu" ? "આગામી" : "Next") : "જમાત"}
                </span>
              </div>
            ))}
          </div>

          {/* Golden Solar Trajectory Spline Curve SVG */}
          <div className="trajectory-svg-canvas" aria-hidden="true">
            <svg
              className="trajectory-svg"
              viewBox="0 0 460 50"
              preserveAspectRatio="none"
            >
              <path
                d="M 25,38 C 70,18 115,12 160,12 C 205,12 250,20 295,20 C 340,20 385,38 435,42"
                fill="none"
                stroke="rgba(255, 235, 160, 0.75)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <path
                d="M 25,38 C 70,18 115,12 160,12 C 205,12 250,20 295,20 C 340,20 385,38 435,42"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 1-Tap Action Pill inside Card (Samsung One UI Button) */}
      <div className="weather-card-actions-strip">
        <button
          type="button"
          onClick={onShare}
          className="weather-share-pill-btn"
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
          <span>{T.shareTimesBtn[lang]}</span>
        </button>
      </div>

      {/* Atmospheric Time-of-Day Scrubber / Switcher */}
      <div className="weather-atmosphere-picker" role="group" aria-label={T.skyAtmosphere[lang]}>
        <div className="atmosphere-picker-label">
          <span>{T.skyAtmosphere[lang]}</span>
          <span className="atmosphere-current-badge">{activeAtmosphere.toUpperCase()}</span>
        </div>
        <div className="atmosphere-pills-row">
          <button
            type="button"
            className={`atmo-pill ${selectedAtmosphere === "auto" ? "active" : ""}`}
            onClick={() => setSelectedAtmosphere("auto")}
            title="Auto synchronize with current India Time"
          >
            ⏰ {T.timeAuto[lang]}
          </button>
          <button
            type="button"
            className={`atmo-pill ${selectedAtmosphere === "dawn" ? "active" : ""}`}
            onClick={() => setSelectedAtmosphere("dawn")}
            title="Fajr / Dawn Sky"
          >
            🌅 {T.timeDawn[lang]}
          </button>
          <button
            type="button"
            className={`atmo-pill ${selectedAtmosphere === "day" ? "active" : ""}`}
            onClick={() => setSelectedAtmosphere("day")}
            title="Zuhr / Bright Daylight Sky"
          >
            ☀️ {T.timeDay[lang]}
          </button>
          <button
            type="button"
            className={`atmo-pill ${selectedAtmosphere === "golden" ? "active" : ""}`}
            onClick={() => setSelectedAtmosphere("golden")}
            title="Asr / Golden Hour Sky"
          >
            🌤️ {T.timeGolden[lang]}
          </button>
          <button
            type="button"
            className={`atmo-pill ${selectedAtmosphere === "sunset" ? "active" : ""}`}
            onClick={() => setSelectedAtmosphere("sunset")}
            title="Maghrib / Twilight Sunset Sky"
          >
            🌇 {T.timeSunset[lang]}
          </button>
          <button
            type="button"
            className={`atmo-pill ${selectedAtmosphere === "night" ? "active" : ""}`}
            onClick={() => setSelectedAtmosphere("night")}
            title="Isha / Velvet Night Sky with Crescent"
          >
            🌙 {T.timeNight[lang]}
          </button>
        </div>
      </div>
    </section>
  );
}
