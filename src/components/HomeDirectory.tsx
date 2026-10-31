"use client";

import { useState, useMemo } from "react";
import type { Site } from "@/lib/sites";
import {
  type Lang,
  LANG_LABEL,
  PRAYERS,
  T,
  displayTime,
  pick,
} from "@/lib/i18n";
import { StarPattern } from "./StarPattern";

const PRAYER_ORDER = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;

export function HomeDirectory({
  sites,
  initialLang = "gu",
}: {
  sites: Site[];
  initialLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    masjidName: "",
    area: "",
    contactPerson: "",
    phone: "",
  });
  const [formError, setFormError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.masjidName.trim() ||
      !formData.area.trim() ||
      !formData.phone.trim()
    ) {
      setFormError(T.formValidationMsg[lang]);
      return;
    }
    setFormError("");

    const message =
      lang === "gu"
        ? `સલામ! મારે અમારી મસ્જિદ માટે Mihrab પર પેજ બનાવવું છે.\n\n• મસ્જિદનું નામ: ${formData.masjidName.trim()}\n• વિસ્તાર: ${formData.area.trim()}\n• સંપર્કકર્તા: ${formData.contactPerson.trim() || "ટ્રસ્ટી / કમિટી"}\n• વોટ્સએપ નંબર: ${formData.phone.trim()}\n\nકૃપા કરીને અમને ૨૪ કલાકમાં ફ્રી પ્રિવ્યૂ લિંક મોકલો.`
        : `Salam! I would like to get a page on Mihrab for our masjid.\n\n• Masjid Name: ${formData.masjidName.trim()}\n• Area: ${formData.area.trim()}\n• Contact Person: ${formData.contactPerson.trim() || "Trustee / Committee"}\n• WhatsApp Number: ${formData.phone.trim()}\n\nPlease generate a free preview link for us within 24 hours.`;

    const adminPhone = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919000000000").replace(/\D/g, "");
    const formattedPhone = adminPhone.length === 10 ? `91${adminPhone}` : adminPhone;
    const targetUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setFormSubmitted(true);
  }



  const filteredSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((site) => {
      const nameGu = (site.name.gu || "").toLowerCase();
      const nameEn = (site.name.en || "").toLowerCase();
      const areaGu = (site.area.gu || "").toLowerCase();
      const areaEn = (site.area.en || "").toLowerCase();
      const addrGu = (site.address.gu || "").toLowerCase();
      const addrEn = (site.address.en || "").toLowerCase();
      return (
        nameGu.includes(q) ||
        nameEn.includes(q) ||
        areaGu.includes(q) ||
        areaEn.includes(q) ||
        addrGu.includes(q) ||
        addrEn.includes(q)
      );
    });
  }, [sites, query]);

  const whatsappMessage =
    lang === "gu"
      ? "સલામ, મારે અમારી મસ્જિદ માટે Mihrab પર પેજ બનાવવું છે."
      : "Salam, I would like to get a webpage on Mihrab for our masjid.";
  const rawAdminPhone = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919000000000").replace(/\D/g, "");
  const adminPhone = rawAdminPhone.length === 10 ? `91${rawAdminPhone}` : rawAdminPhone;
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <main className="page home-page" lang={lang}>
      {/* Top Language Switcher */}
      <nav className="topbar" aria-label="Language Switcher">
        <a href="/" className="brand-logo" aria-label="Mihrab Home">
          <img src="/logo.svg" alt="Mihrab" className="brand-logo-img" />
        </a>
        <div className="lang-switch">
          {(["gu", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              className={l === lang ? "active" : ""}
              onClick={() => setLang(l)}
              aria-current={l === lang ? "true" : undefined}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Header */}
      <header className="home-header">
        <h1 className="home-title">{T.homeTitle[lang]}</h1>
        <p className="home-tagline">{T.homeTagline[lang]}</p>
      </header>

      {/* CUSTOMER / TRUSTEE ONBOARDING CARD */}
      <section className="onboarding-card" aria-labelledby="onboarding-heading">
        <StarPattern id="onboarding-pattern" className="onboarding-pattern" />
        <div className="onboarding-content">
          <div className="onboarding-kicker">{T.onboardingKicker[lang]}</div>
          <h2 id="onboarding-heading" className="onboarding-title">
            {T.onboardingTitle[lang]}
          </h2>
          <p className="onboarding-subtitle">{T.onboardingSubtitle[lang]}</p>

          {/* 3 Step Flow */}
          <div className="onboarding-steps">
            <div className="onboarding-step">
              <div className="step-num">1</div>
              <div className="step-text">
                <strong>{T.step1Title[lang]}</strong>
                <p>{T.step1Desc[lang]}</p>
              </div>
            </div>

            <div className="onboarding-step">
              <div className="step-num">2</div>
              <div className="step-text">
                <strong>{T.step2Title[lang]}</strong>
                <p>{T.step2Desc[lang]}</p>
              </div>
            </div>

            <div className="onboarding-step">
              <div className="step-num">3</div>
              <div className="step-text">
                <strong>{T.step3Title[lang]}</strong>
                <p>{T.step3Desc[lang]}</p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="onboarding-benefits">
            <span className="benefit-pill">✓ {T.benefitMobile[lang]}</span>
            <span className="benefit-pill">✓ {T.benefitBilingual[lang]}</span>
            <span className="benefit-pill">✓ {T.benefitQr[lang]}</span>
          </div>

          {/* WhatsApp CTA Action & Quick Registration Form */}
          <div className="onboarding-cta-wrap">
            <button
              type="button"
              className="toggle-form-btn"
              onClick={() => setIsFormOpen(!isFormOpen)}
              aria-expanded={isFormOpen}
            >
              {isFormOpen ? T.hideFormBtn[lang] : T.toggleFormBtn[lang]}
            </button>

            {isFormOpen && (
              <form onSubmit={handleFormSubmit} className="register-form" noValidate>
                <div className="form-header">
                  <h3 className="form-title">{T.requestFormTitle[lang]}</h3>
                  <p className="form-desc">{T.requestFormSubtitle[lang]}</p>
                </div>

                {formError && (
                  <div className="form-alert error" role="alert">
                    {formError}
                  </div>
                )}

                {formSubmitted && (
                  <div className="form-alert success" role="status">
                    ✓ {T.formSentSuccess[lang]}
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="masjid-name">{T.labelMasjidName[lang]}</label>
                  <input
                    id="masjid-name"
                    type="text"
                    required
                    value={formData.masjidName}
                    onChange={(e) =>
                      setFormData({ ...formData, masjidName: e.target.value })
                    }
                    placeholder={T.placeholderMasjidName[lang]}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="masjid-area">{T.labelArea[lang]}</label>
                  <input
                    id="masjid-area"
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    placeholder={T.placeholderArea[lang]}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-person">
                    {T.labelContactPerson[lang]}
                  </label>
                  <input
                    id="contact-person"
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    placeholder={T.placeholderContactPerson[lang]}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-phone">{T.labelPhone[lang]}</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={T.placeholderPhone[lang]}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="whatsapp-cta-btn form-submit-btn">
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
                  <span>{T.submitViaWhatsapp[lang]}</span>
                </button>
              </form>
            )}

            {!isFormOpen && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta-btn"
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
                <span>{T.onboardingCta[lang]}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* MASJID DIRECTORY FOR USERS / WORSHIPPERS */}
      <section className="directory-section" aria-labelledby="directory-heading">
        <div className="directory-header">
          <h2 id="directory-heading" className="directory-title">
            {T.allMasjids[lang]}
          </h2>
          <span className="directory-count">
            {filteredSites.length}{" "}
            {lang === "gu" ? "મસ્જિદ ઉપલબ્ધ" : "masjids listed"}
          </span>
        </div>

        {/* Search input */}
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={T.searchPlaceholder[lang]}
            className="search-input"
            aria-label={T.searchPlaceholder[lang]}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="search-clear"
              aria-label={T.clearSearch[lang]}
            >
              ✕
            </button>
          )}
        </div>

        {/* List of Masjids */}
        {filteredSites.length === 0 ? (
          <div className="directory-empty">
            <p>{T.noMasjidsFound[lang]}</p>
            {query && (
              <button
                type="button"
                className="action"
                onClick={() => setQuery("")}
                style={{ marginTop: 12 }}
              >
                {T.clearSearch[lang]}
              </button>
            )}
          </div>
        ) : (
          <div className="masjid-list">
            {filteredSites.map((site) => {
              const name = pick(site.name, lang);
              const otherLang: Lang = lang === "gu" ? "en" : "gu";
              const altName =
                site.name[otherLang] && site.name[otherLang] !== name
                  ? site.name[otherLang]
                  : "";
              const area = pick(site.area, lang);
              const targetUrl =
                lang === "gu" ? `/${site.slug}` : `/${site.slug}/en`;

              return (
                <article key={site.slug} className="masjid-card">
                  {/* Card Media Preview */}
                  <a href={targetUrl} className="masjid-card-media-link" aria-label={name}>
                    <div className="masjid-card-media">
                      <img
                        src={
                          site.photo
                            ? site.photo.startsWith("http://") || site.photo.startsWith("https://") || site.photo.startsWith("/") || site.photo.startsWith("data:")
                              ? site.photo
                              : `/photos/${site.photo}`
                            : `/photos/${site.slug}.jpg`
                        }
                        alt={name}
                        width={600}
                        height={340}
                        loading="lazy"
                        className="masjid-card-thumb-img"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.classList.add("has-fallback-pattern");
                          }
                        }}
                      />
                      <div className="masjid-card-media-overlay" aria-hidden="true"></div>
                      <div className="masjid-card-badges-row">
                        <span className="card-verified-tag">
                          ✓ {T.verifiedBadge[lang]}
                        </span>
                        {site.status === "preview" && (
                          <span className="card-preview-badge">
                            {lang === "gu" ? "પ્રિવ્યૂ" : "Preview"}
                          </span>
                        )}
                        {site.ramadan && site.ramadan.enabled && site.ramadan.tarawih ? (
                          <span className="card-ramadan-badge">
                            🌙 {lang === "gu" ? "તરાવીહ " + site.ramadan.tarawih : "Tarawih " + site.ramadan.tarawih}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </a>

                  <div className="masjid-card-body">
                    <div className="masjid-card-head">
                      <div>
                        <h3 className="masjid-card-name">
                          <a href={targetUrl}>{name}</a>
                        </h3>
                        {altName && (
                          <p className="masjid-card-alt" lang={otherLang}>
                            {altName}
                          </p>
                        )}
                        {area && (
                          <span className="masjid-card-area">
                            📍 {area}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact prayer times strip */}
                    <div className="card-times-grid">
                      {PRAYER_ORDER.filter((p) => site.times[p]).map((p) => (
                        <div key={p} className="card-time-item">
                          <span className="card-prayer-name">
                            {PRAYERS[p][lang]}
                          </span>
                          <span className="card-prayer-val">
                            {displayTime(site.times[p], lang)}
                          </span>
                        </div>
                      ))}
                      {site.times.jumuah && (
                        <div className="card-time-item jumuah-item">
                          <span className="card-prayer-name">
                            {PRAYERS.jumuah[lang]}
                          </span>
                          <span className="card-prayer-val">
                            {displayTime(site.times.jumuah, lang)}
                          </span>
                        </div>
                      )}
                      {site.ramadan && site.ramadan.enabled && site.ramadan.tarawih ? (
                        <div className="card-time-item ramadan-item">
                          <span className="card-prayer-name">
                            🌙 {T.tarawih[lang]}
                          </span>
                          <span className="card-prayer-val">
                            {displayTime(site.ramadan.tarawih, lang)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Card actions */}
                    <div className="masjid-card-actions">
                      <a href={targetUrl} className="action primary card-action">
                        {T.viewTimes[lang]} →
                      </a>
                      {site.mapLink && (
                        <a
                          href={site.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action card-action"
                        >
                          {T.directions[lang]}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <img src="/logo-emblem.svg" alt="Mihrab" style={{ height: "18px", width: "18px", verticalAlign: "middle" }} />
          <span>{T.madeWith[lang]}</span>
        </div>
      </footer>
    </main>
  );
}
