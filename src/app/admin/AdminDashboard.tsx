"use client";

import { useState, useMemo, useEffect } from "react";
import type { Site } from "@/lib/sites";
import type { SiteTheme, SitePlan, SitePattern } from "@/lib/plans";
import { PLAN_THEMES, PLAN_PATTERNS, PRESET_MASJID_PHOTOS } from "@/lib/plans";
import { autoConvertToGujarati } from "@/lib/transliterate";

/* ─── Theme / Pattern / Plan metadata ─── */
const THEME_META: Record<SiteTheme, { label: string; emoji: string; desc: string; color: string }> = {
  noor:     { label: "Noor (Emerald)",     emoji: "🌿", desc: "Classic ivory & emerald sanctuary", color: "#065f46" },
  midnight: { label: "Hilal (Midnight)",    emoji: "🌙", desc: "Royal dark mode with neon accents",  color: "#3b82f6" },
  andalus:  { label: "Andalus (Sapphire)",  emoji: "🔷", desc: "Moroccan royal sapphire & gold",    color: "#1e3a8a" },
  sultan:   { label: "Sultan (Imperial Gold)", emoji: "👑", desc: "Ottoman court amber & gold calligraphy", color: "#b45309" },
  madinah:  { label: "Madinah (Damask Rose)",  emoji: "🌹", desc: "Sacred marble alabaster & noble rose", color: "#881337" },
};

const PATTERN_META: Record<SitePattern, { label: string; emoji: string }> = {
  noor:       { label: "Noor Arabesque",   emoji: "🌿" },
  midnight:   { label: "Hilal Hex Cube",   emoji: "🌙" },
  andalus:    { label: "Andalus Zellige",  emoji: "🔷" },
  girih:      { label: "Isfahan Girih",    emoji: "🏛️" },
  mashrabiya: { label: "Mashrabiya Screen", emoji: "🪟" },
  damascus:   { label: "Damascus Inlay",   emoji: "🏺" },
};

const PLAN_META: Record<SitePlan, { label: string; color: string; badge: string; desc: string }> = {
  free:    { label: "Free",    color: "#6b7280", badge: "🆓", desc: "Noor theme & classic arabesque pattern" },
  basic:   { label: "Basic",   color: "#3b82f6", badge: "⭐", desc: "Noor + Hilal themes, 3 geometric patterns" },
  premium: { label: "Premium", color: "#f59e0b", badge: "👑", desc: "All themes (incl. Andalus) & all 6 patterns" },
};

const PRAYER_LIST = [
  { key: "fajr",    labelEn: "Fajr",    labelGu: "ફજર",   icon: "🌅" },
  { key: "zuhr",    labelEn: "Zuhr",    labelGu: "ઝોહર",   icon: "☀️" },
  { key: "asr",     labelEn: "Asr",     labelGu: "અસર",   icon: "🌤️" },
  { key: "maghrib", labelEn: "Maghrib", labelGu: "મગરિબ", icon: "🌇" },
  { key: "isha",    labelEn: "Isha",    labelGu: "ઈશા",   icon: "🌙" },
  { key: "jumuah",  labelEn: "Jumu'ah", labelGu: "જુમ્મા", icon: "🕌" },
] as const;

const AVAILABLE_FACILITIES = [
  { id: "wuzu", labelEn: "Wuzu Area", labelGu: "વઝૂખાનું" },
  { id: "ladies", labelEn: "Ladies Section", labelGu: "મહિલાઓ માટે જગ્યા" },
  { id: "madrasa", labelEn: "Madrasa", labelGu: "મદરસા" },
  { id: "parking", labelEn: "Parking", labelGu: "પાર્કિંગ" },
  { id: "wheelchair", labelEn: "Wheelchair Access", labelGu: "વ્હીલચેર સુવિધા" },
  { id: "library", labelEn: "Islamic Library", labelGu: "લાઇબ્રેરી" },
  { id: "janazah", labelEn: "Janazah Facility", labelGu: "જનાઝા સુવિધા" },
  { id: "nikah", labelEn: "Nikah Services", labelGu: "નિકાહ સેવાઓ" },
];

function deriveAzanTimeHelper(jamaatTime: string, prayer: string): string {
  if (!jamaatTime) return "";
  const cleanStr = jamaatTime.trim().toLowerCase();
  if (cleanStr.includes("sunset")) return "Sunset";
  const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  let totalMinutes = h * 60 + m;

  let offset = 15;
  if (prayer === "fajr" || prayer === "zuhr" || prayer === "jumuah") {
    offset = 30;
  } else if (prayer === "maghrib") {
    offset = 5;
  }

  totalMinutes -= offset;
  if (totalMinutes < 0) totalMinutes += 12 * 60;

  const azanH = Math.floor(totalMinutes / 60);
  const azanM = totalMinutes % 60;
  const displayH = azanH === 0 ? 12 : azanH;
  const displayM = azanM < 10 ? `0${azanM}` : `${azanM}`;
  return `${displayH}:${displayM}`;
}

export function AdminDashboard({ sites: initialSites }: { sites: Site[] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [sites, setSites] = useState<Site[]>(initialSites);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSites[0]?.slug ?? null);
  const [formData, setFormData] = useState<Site | null>(initialSites[0] ? { ...initialSites[0] } : null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [filterPlan, setFilterPlan] = useState<SitePlan | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Small live phone preview controls
  const [showPreview, setShowPreview] = useState(true);
  const [previewLang, setPreviewLang] = useState<"gu" | "en">("gu");

  // Manual Gujarati override toggles
  const [showManualGu, setShowManualGu] = useState<Record<string, boolean>>({});

  function toggleManualGu(key: string) {
    setShowManualGu((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleEnglishFieldChange(
    field: "name" | "area" | "address" | "timesNote" | "announcement" | "about" | "whatsappGroupText",
    englishValue: string
  ) {
    if (!formData) return;
    const guConverted = autoConvertToGujarati(englishValue);

    let updatedSlug = formData.slug;
    if (field === "name" && isCreatingNew && (formData.slug === "new-masjid" || !formData.slug)) {
      const generated = englishValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (generated) updatedSlug = generated;
    }

    setFormData({
      ...formData,
      slug: updatedSlug,
      [field]: {
        ...(formData[field] || { en: "", gu: "" }),
        en: englishValue,
        gu: guConverted,
      },
    });
  }

  function handleRamadanNoteChange(englishValue: string) {
    if (!formData) return;
    const guConverted = autoConvertToGujarati(englishValue);
    setFormData({
      ...formData,
      ramadan: {
        ...(formData.ramadan || { enabled: false, tarawih: "", qiyam: "", note: { en: "", gu: "" } }),
        note: {
          en: englishValue,
          gu: guConverted,
        },
      },
    });
  }

  function handleReconvertAllGujarati() {
    if (!formData) return;
    setFormData({
      ...formData,
      name: { ...formData.name, gu: autoConvertToGujarati(formData.name.en) },
      area: { ...formData.area, gu: autoConvertToGujarati(formData.area.en) },
      address: { ...formData.address, gu: autoConvertToGujarati(formData.address.en) },
      timesNote: { ...formData.timesNote, gu: autoConvertToGujarati(formData.timesNote.en) },
      announcement: { ...formData.announcement, gu: autoConvertToGujarati(formData.announcement.en) },
      about: { ...formData.about, gu: autoConvertToGujarati(formData.about.en) },
      whatsappGroupText: {
        ...(formData.whatsappGroupText || { en: "", gu: "" }),
        gu: autoConvertToGujarati(formData.whatsappGroupText?.en || ""),
      },
      ramadan: formData.ramadan
        ? {
            ...formData.ramadan,
            note: {
              ...(formData.ramadan.note || { en: "", gu: "" }),
              gu: autoConvertToGujarati(formData.ramadan.note?.en || ""),
            },
          }
        : undefined,
    });
    setToast({ message: "✨ All English fields automatically converted to Gujarati!" });
  }



  // Banner photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePhotoUpload(file: File) {
    if (!formData) return;
    setUploadingPhoto(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("slug", formData.slug || "masjid");
      data.append("password", password);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload photo");
      }

      setFormData((prev) => (prev ? { ...prev, photo: json.filename } : null));
      setToast({ message: "📸 Banner photo uploaded and set successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      setToast({ message: `Upload error: ${msg}`, isError: true });
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function selectMasjid(site: Site) {
    setIsCreatingNew(false);
    setSelectedSlug(site.slug);
    const cloned = JSON.parse(JSON.stringify(site));
    if (!cloned.ramadan) {
      cloned.ramadan = {
        enabled: false,
        tarawih: "9:00",
        qiyam: "3:30",
        note: { en: "", gu: "" },
      };
    }
    setFormData(cloned);
  }

  function startCreateNew() {
    setIsCreatingNew(true);
    setSelectedSlug(null);
    const newSite: Site = {
      slug: "new-masjid",
      status: "preview",
      theme: "noor",
      plan: "free",
      pattern: "noor",
      name: { en: "", gu: "" },
      area: { en: "", gu: "" },
      address: { en: "", gu: "" },
      times: {
        fajr: "5:30",
        zuhr: "1:30",
        asr: "5:00",
        maghrib: "Sunset",
        isha: "8:30",
        jumuah: "1:45",
      },
      azanTimes: {
        fajr: "5:00",
        zuhr: "1:00",
        asr: "4:45",
        maghrib: "Sunset",
        isha: "8:15",
        jumuah: "1:15",
      },
      ramadan: {
        enabled: false,
        tarawih: "9:00",
        qiyam: "3:30",
        note: { en: "", gu: "" },
      },
      timesNote: { en: "", gu: "" },
      announcement: { en: "", gu: "" },
      announcementUntil: "",
      about: { en: "", gu: "" },
      facilities: ["wuzu", "parking"],
      phonePublic: "",
      whatsappPublic: "",
      whatsappGroupLink: "",
      whatsappGroupText: { en: "", gu: "" },
      mapLink: "",
      photo: "default-masjid.jpg",
      updatedOn: new Date().toISOString().slice(0, 10),
    };
    setFormData(newSite);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError("Incorrect password. Please try again.");
      }
    } catch {
      setAuthError("Failed to connect to authentication service.");
    }
  }

  async function handleSave() {
    if (!formData) return;
    if (!formData.slug.trim()) {
      setToast({ message: "Masjid slug cannot be empty.", isError: true });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          password,
          action: "save",
          site: formData,
          oldSlug: isCreatingNew ? undefined : selectedSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save masjid.");
      }

      setSites(data.sites);
      setSelectedSlug(data.site.slug);
      setFormData(JSON.parse(JSON.stringify(data.site)));
      setIsCreatingNew(false);
      setToast({ message: `Saved "${data.site.name.en || data.site.slug}" successfully! Live site updated.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      setToast({ message: msg, isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedSlug) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${formData?.name.en || selectedSlug}"? This action removes it permanently.`);
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          password,
          action: "delete",
          slug: selectedSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete masjid.");
      }

      setSites(data.sites);
      const nextSite = data.sites[0] || null;
      setSelectedSlug(nextSite ? nextSite.slug : null);
      setFormData(nextSite ? JSON.parse(JSON.stringify(nextSite)) : null);
      setIsCreatingNew(false);
      setToast({ message: "Masjid deleted successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      setToast({ message: msg, isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  function handleAutoCalculateAzans() {
    if (!formData) return;
    const updatedAzans = { ...formData.azanTimes };
    for (const prayer of ["fajr", "zuhr", "asr", "maghrib", "isha", "jumuah"] as const) {
      const jamaat = formData.times[prayer];
      if (jamaat) {
        updatedAzans[prayer] = deriveAzanTimeHelper(jamaat, prayer);
      }
    }
    setFormData({
      ...formData,
      azanTimes: updatedAzans,
    });
    setToast({ message: "Azan times automatically calculated from Jamaat times!" });
  }

  function toggleFacility(facilityId: string) {
    if (!formData) return;
    const exists = formData.facilities.includes(facilityId);
    const updated = exists
      ? formData.facilities.filter((f) => f !== facilityId)
      : [...formData.facilities, facilityId];
    setFormData({ ...formData, facilities: updated });
  }

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (filterPlan !== "all" && s.plan !== filterPlan) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.slug.includes(q) ||
          s.name.en.toLowerCase().includes(q) ||
          s.name.gu.includes(q) ||
          s.area.en.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sites, filterPlan, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: sites.length,
    live: sites.filter((s) => s.status === "live").length,
    preview: sites.filter((s) => s.status === "preview").length,
    off: sites.filter((s) => s.status === "off").length,
    free: sites.filter((s) => s.plan === "free").length,
    basic: sites.filter((s) => s.plan === "basic").length,
    premium: sites.filter((s) => s.plan === "premium").length,
  }), [sites]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <img src="/logo.svg" alt="Mihrab" style={{ height: "44px", width: "auto", margin: "0 auto 14px", display: "block" }} />
            <h1>Mihrab Admin</h1>
            <p>Enter your password to manage Jammat times & settings</p>
          </div>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <label htmlFor="admin-password">Admin Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: mihrab2026)"
                autoFocus
                className="admin-input"
              />
            </div>
            {authError && <div className="admin-error">{authError}</div>}
            <button type="submit" className="admin-login-btn">
              Sign In to Admin Panel
            </button>
          </form>
          <div className="admin-login-footer">
            <p>Protected administrative control panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast Feedback */}
      {toast && (
        <div className={`admin-toast ${toast.isError ? "toast-error" : "toast-success"}`}>
          <span>{toast.isError ? "⚠️" : "✅"}</span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">×</button>
        </div>
      )}

      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src="/logo-emblem.svg" alt="Mihrab" className="admin-logo-img" style={{ height: "36px", width: "36px", borderRadius: "8px", objectFit: "contain" }} />
          <div>
            <h1 className="admin-title">Mihrab Admin Panel</h1>
            <span className="admin-badge-sync">⚡ Live Direct Sync (No Google Sheets)</span>
          </div>
        </div>
        <div className="admin-header-right">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`admin-preview-toggle-btn ${showPreview ? "active" : ""}`}
            title="Toggle Live Mobile Preview"
          >
            {showPreview ? "📱 Hide Preview" : "📱 Show Small Preview"}
          </button>
          <button
            type="button"
            className="admin-preview-toggle-btn"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sites, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `sites-${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            title="Download full sites backup JSON"
          >
            💾 Backup JSON
          </button>
          <button className="admin-add-btn" onClick={startCreateNew}>
            + Add New Masjid
          </button>
          <a href="/" className="admin-view-site-btn" target="_blank" rel="noopener noreferrer">
            Directory ↗
          </a>
          <button className="admin-logout-btn" onClick={() => setIsAuthenticated(false)}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Masjids</span>
        </div>
        <div className="admin-stat-card stat-live">
          <span className="stat-number">{stats.live}</span>
          <span className="stat-label">Live Online</span>
        </div>
        <div className="admin-stat-card stat-preview">
          <span className="stat-number">{stats.preview}</span>
          <span className="stat-label">In Preview</span>
        </div>
        <div className="admin-stat-card stat-plans">
          <div className="stat-plan-breakdown">
            <span>👑 {stats.premium} Prem</span>
            <span>⭐ {stats.basic} Basic</span>
            <span>🆓 {stats.free} Free</span>
          </div>
          <span className="stat-label">Active Tiers</span>
        </div>
      </div>

      {/* Main Workspace Layout (3-Column when preview active) */}
      <div className={`admin-workspace ${showPreview ? "has-preview" : ""}`}>
        {/* Left Sidebar: Masjids Directory */}
        <aside className="admin-sidebar">
          <div className="admin-toolbar">
            <div className="admin-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search masjids..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="search-clear">×</button>
              )}
            </div>

            <div className="admin-filters-row">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as SitePlan | "all")}
                className="admin-select"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="preview">Preview</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>

          <div className="admin-masjid-list">
            {filteredSites.map((site) => {
              const isSelected = !isCreatingNew && selectedSlug === site.slug;
              return (
                <button
                  key={site.slug}
                  onClick={() => selectMasjid(site)}
                  className={`admin-masjid-item ${isSelected ? "selected" : ""}`}
                >
                  <div className="item-status-col">
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor:
                          site.status === "live" ? "#10b981" : site.status === "preview" ? "#f59e0b" : "#ef4444",
                      }}
                      title={site.status}
                    />
                  </div>
                  <div className="item-info-col">
                    <div className="item-header-row">
                      <strong className="item-name">{site.name.en || site.slug}</strong>
                      <span className="item-plan-badge" style={{ borderColor: PLAN_META[site.plan].color, color: PLAN_META[site.plan].color }}>
                        {PLAN_META[site.plan].badge} {site.plan}
                      </span>
                    </div>
                    {site.name.gu && <span className="item-gu-name">{site.name.gu}</span>}
                    <div className="item-meta-row">
                      <span className="item-area">{site.area.en || "Ahmedabad"}</span>
                      <span className="item-theme-tag">🎨 {site.theme}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredSites.length === 0 && (
              <div className="admin-empty-list">
                <p>No masjids match your filter.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Center Area: Interactive Editor */}
        <main className="admin-editor-main">
          {formData ? (
            <div className="editor-container">
              {/* Editor Top Bar */}
              <div className="editor-top-bar">
                <div>
                  <span className="editor-kicker">
                    {isCreatingNew ? "➕ NEW MASJID REGISTRATION" : "⚙️ EDITING MASJID PROFILE"}
                  </span>
                  <h2 className="editor-title">
                    {formData.name.en || (isCreatingNew ? "New Masjid" : formData.slug)}
                  </h2>
                  {formData.name.gu && <p className="editor-gu-sub">{formData.name.gu}</p>}
                </div>

                <div className="editor-top-actions">
                  {!isCreatingNew && (
                    <>
                      <a
                        href={`/${formData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="editor-btn-secondary"
                      >
                        Preview Live ↗
                      </a>
                      <a
                        href={`/${formData.slug}/poster`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="editor-btn-secondary"
                        title="View printable A4 poster and download PDF"
                      >
                        📄 Poster & PDF ↗
                      </a>
                      <button
                        onClick={handleDelete}
                        className="editor-btn-danger"
                        title="Delete Masjid"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleReconvertAllGujarati}
                    className="editor-btn-secondary"
                    title="Automatically convert/re-sync all English fields to Gujarati"
                  >
                    ✨ Convert to Gujarati
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="editor-btn-primary"
                  >
                    {isSaving ? "Saving..." : "💾 Save Changes"}
                  </button>
                </div>
              </div>

              {/* CARD 1: 🕐 JAMAAT & AZAN PRAYER TIMES */}
              <section className="editor-card prayer-times-card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">🕐 Daily Jamaat & Azan Times</h3>
                    <p className="card-desc">Edit current daily times for the notice board & public timetable.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoCalculateAzans}
                    className="auto-azan-btn"
                  >
                    ⚡ Auto-Calculate Azan Times
                  </button>
                </div>

                <div className="prayer-times-editor-grid">
                  {PRAYER_LIST.map((prayer) => (
                    <div key={prayer.key} className="prayer-field-box">
                      <div className="prayer-box-header">
                        <span className="prayer-box-icon">{prayer.icon}</span>
                        <div>
                          <strong>{prayer.labelEn}</strong>
                          <span className="prayer-gu-label">{prayer.labelGu}</span>
                        </div>
                      </div>

                      <div className="prayer-inputs-row">
                        <div className="time-input-wrap">
                          <label>Jamaat Time</label>
                          <input
                            type="text"
                            value={formData.times[prayer.key as keyof typeof formData.times]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                times: {
                                  ...formData.times,
                                  [prayer.key]: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g. 5:30 or Sunset"
                            className="editor-input time-input-field"
                          />
                        </div>

                        <div className="time-input-wrap">
                          <label>Azan Time</label>
                          <input
                            type="text"
                            value={formData.azanTimes[prayer.key as keyof typeof formData.azanTimes]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                azanTimes: {
                                  ...formData.azanTimes,
                                  [prayer.key]: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g. 5:15 or Sunset"
                            className="editor-input azan-input-field"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🌙 RAMADAN SPECIAL: TARAWIH & QIYAMUL LAIL */}
                <div className="ramadan-editor-box">
                  <div className="ramadan-box-header">
                    <div className="ramadan-title-wrap">
                      <span className="ramadan-moon-icon">🌙</span>
                      <div>
                        <h4 className="ramadan-title">Ramadan Special Times (રમઝાન સ્પેશિયલ)</h4>
                        <p className="ramadan-desc">
                          Manage Tarawih and Qiyamul Lail (Tahajjud) jamaat times. Displayed on public website & printed posters during Ramadan.
                        </p>
                      </div>
                    </div>
                    <label className={`ramadan-toggle-pill ${formData.ramadan?.enabled ? "active" : "disabled"}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(formData.ramadan?.enabled)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ramadan: {
                              ...(formData.ramadan || { tarawih: "9:00", qiyam: "3:30", note: { en: "", gu: "" } }),
                              enabled: e.target.checked,
                            },
                          })
                        }
                      />
                      <span className="toggle-indicator"></span>
                      <span className="toggle-text">
                        {formData.ramadan?.enabled ? "🌙 Active (સક્રિય) — Live on Site" : "⚪ Disabled (બંધ) — Hidden"}
                      </span>
                    </label>
                  </div>

                  {!formData.ramadan?.enabled && (
                    <div className="ramadan-disabled-notice" style={{ padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "12px", color: "#94a3b8", marginBottom: "14px" }}>
                      ℹ️ Ramadan Special times are currently <strong>disabled</strong> and hidden from the public website, directory cards, and printed posters.
                    </div>
                  )}

                  <div className="ramadan-inputs-grid" style={{ opacity: formData.ramadan?.enabled ? 1 : 0.65 }}>
                    {/* Tarawih Input */}
                    <div className="ramadan-input-card">
                      <div className="ramadan-card-top-label">
                        <span className="ramadan-icon">🌙</span>
                        <div>
                          <strong>Tarawih Jamaat Time</strong>
                          <span className="ramadan-gu-sub">તરાવીહ નમાઝ (ઈશા પછી)</span>
                        </div>
                        <span className="ramadan-pill-tag">After Isha</span>
                      </div>
                      <input
                        type="text"
                        value={formData.ramadan?.tarawih || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ramadan: {
                              ...(formData.ramadan || { enabled: false, qiyam: "", note: { en: "", gu: "" } }),
                              tarawih: e.target.value,
                              enabled: Boolean(formData.ramadan?.enabled),
                            },
                          })
                        }
                        placeholder="e.g. 9:00 or 8:45"
                        className="editor-input"
                      />
                    </div>

                    {/* Qiyamul Lail Input */}
                    <div className="ramadan-input-card">
                      <div className="ramadan-card-top-label">
                        <span className="ramadan-icon">🌌</span>
                        <div>
                          <strong>Qiyamul Lail Time</strong>
                          <span className="ramadan-gu-sub">કિયામુલ લૈલ (તહજ્જુદ જમાત)</span>
                        </div>
                        <span className="ramadan-pill-tag">Last 1/3 Night</span>
                      </div>
                      <input
                        type="text"
                        value={formData.ramadan?.qiyam || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ramadan: {
                              ...(formData.ramadan || { enabled: false, tarawih: "", note: { en: "", gu: "" } }),
                              qiyam: e.target.value,
                              enabled: Boolean(formData.ramadan?.enabled),
                            },
                          })
                        }
                        placeholder="e.g. 3:30 or 4:00"
                        className="editor-input"
                      />
                    </div>
                  </div>

                  {/* Ramadan Special Note (English, Auto-Gujarati) */}
                  <div className="ramadan-note-field">
                    <label>Ramadan Program / Announcement Note (English)</label>
                    <input
                      type="text"
                      value={formData.ramadan?.note?.en || ""}
                      onChange={(e) => handleRamadanNoteChange(e.target.value)}
                      placeholder="e.g. 20 Rakat Tarawih • Khatmul Quran on 27th night"
                      className="editor-input"
                    />
                    <div className="auto-gu-strip">
                      <span className="auto-gu-badge">
                        <span className="auto-gu-sparkle">✨</span>
                        <span className="auto-gu-lbl">Auto Gujarati:</span>
                        <strong className="auto-gu-val">{formData.ramadan?.note?.gu || "—"}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleManualGu("ramadanNote")}
                        className="auto-gu-toggle-btn"
                      >
                        {showManualGu.ramadanNote ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                      </button>
                    </div>
                    {showManualGu.ramadanNote && (
                      <div className="manual-gu-override-box">
                        <label className="manual-gu-label">Manual Gujarati Override:</label>
                        <input
                          type="text"
                          value={formData.ramadan?.note?.gu || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ramadan: {
                                ...(formData.ramadan || { enabled: false, tarawih: "", qiyam: "" }),
                                note: {
                                  en: formData.ramadan?.note?.en || "",
                                  gu: e.target.value,
                                },
                              },
                            })
                          }
                          className="editor-input manual-gu-input"
                          placeholder="દા.ત. 20 રકાત તરાવીહ • 27મી રાત્રે ખતમ-એ-કુરાન"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Times Notice / Note */}
                <div className="times-note-group">
                  <h4 className="sub-title">📢 Notice Board Timetable Note (Optional)</h4>
                  <p className="sub-desc">Notice of upcoming time change (e.g. &ldquo;Fajr 5:30 from 16 Oct&rdquo;). Converted to Gujarati automatically.</p>
                  <div className="editor-field">
                    <label>Timetable Note (English)</label>
                    <input
                      type="text"
                      value={formData.timesNote.en}
                      onChange={(e) => handleEnglishFieldChange("timesNote", e.target.value)}
                      placeholder="e.g. Fajr 5:30 from 16 Oct"
                      className="editor-input"
                    />
                    <div className="auto-gu-strip">
                      <span className="auto-gu-badge">
                        <span className="auto-gu-sparkle">✨</span>
                        <span className="auto-gu-lbl">Auto Gujarati:</span>
                        <strong className="auto-gu-val">{formData.timesNote.gu || "—"}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleManualGu("timesNote")}
                        className="auto-gu-toggle-btn"
                      >
                        {showManualGu.timesNote ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                      </button>
                    </div>
                    {showManualGu.timesNote && (
                      <div className="manual-gu-override-box">
                        <label className="manual-gu-label">Manual Gujarati Override:</label>
                        <input
                          type="text"
                          value={formData.timesNote.gu}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timesNote: { ...formData.timesNote, gu: e.target.value },
                            })
                          }
                          className="editor-input manual-gu-input"
                          placeholder="દા.ત. ફજર 5:30 તા. 16 ઑક્ટોબરથી"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* CARD 2: 👑 SUBSCRIPTION PLAN, THEME & PATTERN */}
              <section className="editor-card plan-theme-card">
                <h3 className="card-title">👑 Subscription Plan & Visual Theme</h3>
                <p className="card-desc">Assign customer plan tier, color theme and Islamic geometric pattern.</p>

                {/* Plan Tier Selector */}
                <div className="editor-field">
                  <label className="section-field-label">Customer Subscription Plan</label>
                  <div className="plan-selector-grid">
                    {(Object.keys(PLAN_META) as SitePlan[]).map((planKey) => {
                      const isCurrentPlan = formData.plan === planKey;
                      const meta = PLAN_META[planKey];
                      return (
                        <button
                          key={planKey}
                          type="button"
                          onClick={() => {
                            const allowedT = PLAN_THEMES[planKey];
                            const allowedP = PLAN_PATTERNS[planKey];
                            setFormData({
                              ...formData,
                              plan: planKey,
                              theme: allowedT.includes(formData.theme) ? formData.theme : allowedT[0],
                              pattern: allowedP.includes(formData.pattern) ? formData.pattern : allowedP[0],
                            });
                          }}
                          className={`plan-card-btn ${isCurrentPlan ? "active" : ""}`}
                          style={{
                            borderColor: isCurrentPlan ? meta.color : undefined,
                            boxShadow: isCurrentPlan ? `0 0 0 2px ${meta.color}40` : undefined,
                          }}
                        >
                          <div className="plan-badge-row">
                            <span className="plan-icon">{meta.badge}</span>
                            <strong>{meta.label} Plan</strong>
                          </div>
                          <p className="plan-card-desc">{meta.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="editor-field">
                  <label className="section-field-label">Assigned Color Theme</label>
                  <div className="theme-selector-grid">
                    {(Object.keys(THEME_META) as SiteTheme[]).map((themeKey) => {
                      const meta = THEME_META[themeKey];
                      const isSelected = formData.theme === themeKey;
                      const isAllowed = PLAN_THEMES[formData.plan].includes(themeKey);

                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => setFormData({ ...formData, theme: themeKey })}
                          className={`theme-card-btn ${isSelected ? "active" : ""}`}
                          style={{
                            borderColor: isSelected ? meta.color : undefined,
                          }}
                        >
                          <div className="theme-card-header">
                            <span className="theme-emoji">{meta.emoji}</span>
                            <strong>{meta.label}</strong>
                          </div>
                          <p className="theme-desc">{meta.desc}</p>
                          <div className="theme-plan-tag">
                            {isAllowed ? (
                              <span className="tag-included">✓ Included in {formData.plan}</span>
                            ) : (
                              <span className="tag-upgrade">⚠️ Requires higher plan</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pattern Selector */}
                <div className="editor-field">
                  <label className="section-field-label">Islamic Geometric Pattern Art</label>
                  <div className="pattern-chips-grid">
                    {(Object.keys(PATTERN_META) as SitePattern[]).map((patternKey) => {
                      const meta = PATTERN_META[patternKey];
                      const isSelected = formData.pattern === patternKey;
                      const isAllowed = PLAN_PATTERNS[formData.plan].includes(patternKey);

                      return (
                        <button
                          key={patternKey}
                          type="button"
                          onClick={() => setFormData({ ...formData, pattern: patternKey })}
                          className={`pattern-chip-btn ${isSelected ? "active" : ""}`}
                        >
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                          {!isAllowed && <span className="pattern-lock" title="Outside plan tier">👑</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* CARD 3: 💬 MASJID WHATSAPP COMMUNITY GROUP & QR CODE */}
              <section className="editor-card wa-editor-card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">💬 Masjid WhatsApp Community Group & QR Code</h3>
                    <p className="card-desc">
                      Provide the masjid&apos;s WhatsApp Community invite link. A high-contrast scannable QR code is generated instantly.
                    </p>
                  </div>
                  {formData.whatsappGroupLink && (
                    <a
                      href={formData.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editor-btn-secondary"
                    >
                      Test Link ↗
                    </a>
                  )}
                </div>

                <div className="wa-editor-grid">
                  <div className="wa-editor-inputs">
                    <div className="editor-field">
                      <label>WhatsApp Group Invite Link</label>
                      <input
                        type="url"
                        value={formData.whatsappGroupLink}
                        onChange={(e) => setFormData({ ...formData, whatsappGroupLink: e.target.value })}
                        placeholder="https://chat.whatsapp.com/..."
                        className="editor-input"
                      />
                      <span className="field-hint">
                        Paste the group or community invite link (e.g. https://chat.whatsapp.com/XXXXX).
                      </span>
                    </div>

                    <div className="editor-field">
                      <label>Custom Group Message (English)</label>
                      <input
                        type="text"
                        value={formData.whatsappGroupText?.en || ""}
                        onChange={(e) => handleEnglishFieldChange("whatsappGroupText", e.target.value)}
                        placeholder="e.g. Join our official community WhatsApp group for daily times"
                        className="editor-input"
                      />
                      <div className="auto-gu-strip">
                        <span className="auto-gu-badge">
                          <span className="auto-gu-sparkle">✨</span>
                          <span className="auto-gu-lbl">Auto Gujarati:</span>
                          <strong className="auto-gu-val">{formData.whatsappGroupText?.gu || "—"}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleManualGu("whatsappGroupText")}
                          className="auto-gu-toggle-btn"
                        >
                          {showManualGu.whatsappGroupText ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                        </button>
                      </div>
                      {showManualGu.whatsappGroupText && (
                        <div className="manual-gu-override-box">
                          <label className="manual-gu-label">Manual Gujarati Override:</label>
                          <input
                            type="text"
                            value={formData.whatsappGroupText?.gu || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                whatsappGroupText: {
                                  ...(formData.whatsappGroupText || { en: "", gu: "" }),
                                  gu: e.target.value,
                                },
                              })
                            }
                            placeholder="દૈનિક જમાતનો સમય અને મસ્જિદની સૂચનાઓ માટે જોડાઓ"
                            className="editor-input manual-gu-input"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.whatsappGroupLink && (
                    <div className="wa-editor-qr-preview">
                      <div className="wa-editor-qr-box">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(
                            formData.whatsappGroupLink
                          )}`}
                          alt="WhatsApp Group QR Code Preview"
                          width={110}
                          height={110}
                          className="wa-editor-qr-img"
                        />
                      </div>
                      <span className="wa-editor-qr-label">Live Generated QR</span>
                    </div>
                  )}
                </div>
              </section>

              {/* CARD 4: 🕌 MASJID DETAILS & LOCATION */}
              <section className="editor-card">
                <h3 className="card-title">🕌 Masjid Information & Location</h3>
                <p className="card-desc">Basic directory details, URL slug and geographic address.</p>

                <div className="input-grid-2">
                  <div className="editor-field">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Site["status"] })}
                      className="editor-input editor-select"
                    >
                      <option value="live">🟢 Live (Directory & Public)</option>
                      <option value="preview">🟡 Preview (Direct link only)</option>
                      <option value="off">🔴 Off (Deactivated)</option>
                    </select>
                  </div>

                  <div className="editor-field">
                    <label>URL Slug (mihrab.in/<strong>{formData.slug || "slug"}</strong>)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      placeholder="e.g. noor-masjid"
                      className="editor-input"
                    />
                  </div>
                </div>

                {/* Masjid Name */}
                <div className="editor-field">
                  <label>Masjid Name (English)</label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleEnglishFieldChange("name", e.target.value)}
                    placeholder="e.g. Noor Masjid or Madina Masjid"
                    className="editor-input"
                  />
                  <div className="auto-gu-strip">
                    <span className="auto-gu-badge">
                      <span className="auto-gu-sparkle">✨</span>
                      <span className="auto-gu-lbl">Auto Gujarati:</span>
                      <strong className="auto-gu-val">{formData.name.gu || "—"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleManualGu("name")}
                      className="auto-gu-toggle-btn"
                    >
                      {showManualGu.name ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                    </button>
                  </div>
                  {showManualGu.name && (
                    <div className="manual-gu-override-box">
                      <label className="manual-gu-label">Manual Gujarati Override:</label>
                      <input
                        type="text"
                        value={formData.name.gu}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: { ...formData.name, gu: e.target.value },
                          })
                        }
                        placeholder="દા.ત. નૂર મસ્જિદ"
                        className="editor-input manual-gu-input"
                      />
                    </div>
                  )}
                </div>

                {/* Area / Mohalla */}
                <div className="editor-field">
                  <label>Area / Mohalla (English)</label>
                  <input
                    type="text"
                    value={formData.area.en}
                    onChange={(e) => handleEnglishFieldChange("area", e.target.value)}
                    placeholder="e.g. Juhapura, Ahmedabad"
                    className="editor-input"
                  />
                  <div className="auto-gu-strip">
                    <span className="auto-gu-badge">
                      <span className="auto-gu-sparkle">✨</span>
                      <span className="auto-gu-lbl">Auto Gujarati:</span>
                      <strong className="auto-gu-val">{formData.area.gu || "—"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleManualGu("area")}
                      className="auto-gu-toggle-btn"
                    >
                      {showManualGu.area ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                    </button>
                  </div>
                  {showManualGu.area && (
                    <div className="manual-gu-override-box">
                      <label className="manual-gu-label">Manual Gujarati Override:</label>
                      <input
                        type="text"
                        value={formData.area.gu}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            area: { ...formData.area, gu: e.target.value },
                          })
                        }
                        placeholder="દા.ત. જુહાપુરા, અમદાવાદ"
                        className="editor-input manual-gu-input"
                      />
                    </div>
                  )}
                </div>

                {/* Full Address */}
                <div className="editor-field">
                  <label>Full Address (English)</label>
                  <input
                    type="text"
                    value={formData.address.en}
                    onChange={(e) => handleEnglishFieldChange("address", e.target.value)}
                    placeholder="e.g. Kajal Park, Juhapura, Ahmedabad"
                    className="editor-input"
                  />
                  <div className="auto-gu-strip">
                    <span className="auto-gu-badge">
                      <span className="auto-gu-sparkle">✨</span>
                      <span className="auto-gu-lbl">Auto Gujarati:</span>
                      <strong className="auto-gu-val">{formData.address.gu || "—"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleManualGu("address")}
                      className="auto-gu-toggle-btn"
                    >
                      {showManualGu.address ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                    </button>
                  </div>
                  {showManualGu.address && (
                    <div className="manual-gu-override-box">
                      <label className="manual-gu-label">Manual Gujarati Override:</label>
                      <input
                        type="text"
                        value={formData.address.gu}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, gu: e.target.value },
                          })
                        }
                        placeholder="સંપૂર્ણ સરનામું ગુજરાતીમાં"
                        className="editor-input manual-gu-input"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* CARD 4B: 🖼️ MASJID BANNER PHOTO & HERO VISUAL */}
              <section className="editor-card banner-photo-editor-card">
                <div className="card-header-with-actions">
                  <div>
                    <h3 className="card-title">🖼️ Masjid Banner Photo & Hero Display</h3>
                    <p className="card-desc">
                      Upload a high-resolution photo, choose from preset architecture images, or use an image URL.
                      This photo is displayed as the header banner on the masjid page and in directory cards.
                    </p>
                  </div>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: "" })}
                      className="btn-danger-outline-sm"
                      title="Clear photo to use Islamic Geometric Pattern"
                    >
                      ❌ Remove Photo
                    </button>
                  )}
                </div>

                {/* Live Banner Preview Canvas */}
                <div className="admin-banner-preview-box">
                  {formData.photo ? (
                    <div className="admin-banner-img-wrap">
                      <img
                        key={formData.photo}
                        src={
                          formData.photo.startsWith("http://") ||
                          formData.photo.startsWith("https://") ||
                          formData.photo.startsWith("/") ||
                          formData.photo.startsWith("data:")
                            ? formData.photo
                            : `/photos/${formData.photo}`
                        }
                        alt="Masjid banner preview"
                        className="admin-banner-img"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.classList.add("admin-banner-error");
                          }
                        }}
                      />
                      <div className="admin-banner-gradient-overlay" />
                      <div className="admin-banner-tags">
                        <span className="admin-banner-status-chip">
                          <span className="dot-pulse-green"></span> Active Banner Photo
                        </span>
                        <span className="admin-banner-source-chip">
                          {formData.photo.startsWith("http")
                            ? "External URL"
                            : formData.photo.startsWith("data:")
                            ? "Base64 Data"
                            : formData.photo}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-banner-pattern-wrap">
                      <div className="admin-banner-pattern-content">
                        <div className="pattern-emblem-badge">﷽</div>
                        <h4>Islamic Geometric Pattern Mode Active</h4>
                        <p>No custom photo selected. The site will display your assigned Islamic pattern canvas.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload & Option Controls */}
                <div className="banner-controls-grid">
                  {/* Upload Box */}
                  <div className="banner-upload-dropzone">
                    <label className="banner-dropzone-label">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="sr-only"
                        disabled={uploadingPhoto}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                      />
                      <div className="banner-dropzone-content">
                        <div className="dropzone-icon">
                          {uploadingPhoto ? "⏳" : "📤"}
                        </div>
                        <div className="dropzone-text">
                          <strong>
                            {uploadingPhoto ? "Uploading photo..." : "Upload New Banner Photo"}
                          </strong>
                          <span>Click to browse JPG, PNG, or WebP (max 5 MB)</span>
                        </div>
                      </div>
                    </label>
                    {uploadError && <div className="banner-upload-error">{uploadError}</div>}
                  </div>

                  {/* Manual URL / Filename */}
                  <div className="banner-url-box">
                    <label className="editor-sublabel">Or Enter Image URL / Filename</label>
                    <div className="banner-url-input-wrap">
                      <input
                        type="text"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        placeholder="e.g. noor-masjid.jpg or https://..."
                        className="editor-input"
                      />
                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: "" })}
                          className="banner-clear-btn"
                          title="Clear input"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="banner-input-hint">
                      Matches files in <code>public/photos/</code> or any direct image URL.
                    </span>
                  </div>
                </div>

                {/* Curated Presets Gallery */}
                <div className="banner-presets-section">
                  <label className="editor-sublabel">✨ Or Choose From Curated Masjid Presets</label>
                  <div className="banner-presets-row">
                    {PRESET_MASJID_PHOTOS.map((preset) => {
                      const isSelected = formData.photo === preset.filename;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: preset.filename })}
                          className={`banner-preset-card ${isSelected ? "selected" : ""}`}
                        >
                          <div className="preset-thumb-wrap">
                            <img
                              src={preset.thumbnail}
                              alt={preset.title}
                              className="preset-thumb-img"
                            />
                            {isSelected && (
                              <span className="preset-check-badge">✓ Selected</span>
                            )}
                          </div>
                          <div className="preset-info">
                            <span className="preset-title">{preset.title}</span>
                            <span className="preset-sub">{preset.subtitle}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* CARD 4B: 🖼️ MASJID BANNER PHOTO & HERO VISUAL */}
              <section className="editor-card banner-photo-editor-card">
                <div className="card-header-with-actions">
                  <div>
                    <h3 className="card-title">🖼️ Masjid Banner Photo & Hero Display</h3>
                    <p className="card-desc">
                      Upload a high-resolution photo, choose from preset architecture images, or use an image URL.
                      This photo is displayed as the header banner on the masjid page and in directory cards.
                    </p>
                  </div>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: "" })}
                      className="btn-danger-outline-sm"
                      title="Clear photo to use Islamic Geometric Pattern"
                    >
                      ❌ Remove Photo
                    </button>
                  )}
                </div>

                {/* Live Banner Preview Canvas */}
                <div className="admin-banner-preview-box">
                  {formData.photo ? (
                    <div className="admin-banner-img-wrap">
                      <img
                        key={formData.photo}
                        src={
                          formData.photo.startsWith("http://") ||
                          formData.photo.startsWith("https://") ||
                          formData.photo.startsWith("/") ||
                          formData.photo.startsWith("data:")
                            ? formData.photo
                            : `/photos/${formData.photo}`
                        }
                        alt="Masjid banner preview"
                        className="admin-banner-img"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.classList.add("admin-banner-error");
                          }
                        }}
                      />
                      <div className="admin-banner-gradient-overlay" />
                      <div className="admin-banner-tags">
                        <span className="admin-banner-status-chip">
                          <span className="dot-pulse-green"></span> Active Banner Photo
                        </span>
                        <span className="admin-banner-source-chip">
                          {formData.photo.startsWith("http")
                            ? "External URL"
                            : formData.photo.startsWith("data:")
                            ? "Base64 Data"
                            : formData.photo}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-banner-pattern-wrap">
                      <div className="admin-banner-pattern-content">
                        <div className="pattern-emblem-badge">﷽</div>
                        <h4>Islamic Geometric Pattern Mode Active</h4>
                        <p>No custom photo selected. The site will display your assigned Islamic pattern canvas.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload & Option Controls */}
                <div className="banner-controls-grid">
                  {/* Upload Box */}
                  <div className="banner-upload-dropzone">
                    <label className="banner-dropzone-label">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="sr-only"
                        disabled={uploadingPhoto}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                      />
                      <div className="banner-dropzone-content">
                        <div className="dropzone-icon">
                          {uploadingPhoto ? "⏳" : "📤"}
                        </div>
                        <div className="dropzone-text">
                          <strong>
                            {uploadingPhoto ? "Uploading photo..." : "Upload New Banner Photo"}
                          </strong>
                          <span>Click to browse JPG, PNG, or WebP (max 5 MB)</span>
                        </div>
                      </div>
                    </label>
                    {uploadError && <div className="banner-upload-error">{uploadError}</div>}
                  </div>

                  {/* Manual URL / Filename */}
                  <div className="banner-url-box">
                    <label className="editor-sublabel">Or Enter Image URL / Filename</label>
                    <div className="banner-url-input-wrap">
                      <input
                        type="text"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        placeholder="e.g. noor-masjid.jpg or https://..."
                        className="editor-input"
                      />
                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: "" })}
                          className="banner-clear-btn"
                          title="Clear input"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="banner-input-hint">
                      Matches files in <code>public/photos/</code> or any direct image URL.
                    </span>
                  </div>
                </div>

                {/* Curated Presets Gallery */}
                <div className="banner-presets-section">
                  <label className="editor-sublabel">✨ Or Choose From Curated Masjid Presets</label>
                  <div className="banner-presets-row">
                    {PRESET_MASJID_PHOTOS.map((preset) => {
                      const isSelected = formData.photo === preset.filename;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: preset.filename })}
                          className={`banner-preset-card ${isSelected ? "selected" : ""}`}
                        >
                          <div className="preset-thumb-wrap">
                            <img
                              src={preset.thumbnail}
                              alt={preset.title}
                              className="preset-thumb-img"
                            />
                            {isSelected && (
                              <span className="preset-check-badge">✓ Selected</span>
                            )}
                          </div>
                          <div className="preset-info">
                            <span className="preset-title">{preset.title}</span>
                            <span className="preset-sub">{preset.subtitle}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* CARD 5: 📢 ANNOUNCEMENTS & ABOUT */}
              <section className="editor-card">
                <h3 className="card-title">📢 Announcements & Community Info</h3>
                <p className="card-desc">Post community announcements and describe masjid activities.</p>

                {/* Announcement Banner */}
                <div className="editor-field">
                  <label>Announcement Banner (English)</label>
                  <input
                    type="text"
                    value={formData.announcement.en}
                    onChange={(e) => handleEnglishFieldChange("announcement", e.target.value)}
                    placeholder="e.g. Dars every Friday after Isha"
                    className="editor-input"
                  />
                  <div className="auto-gu-strip">
                    <span className="auto-gu-badge">
                      <span className="auto-gu-sparkle">✨</span>
                      <span className="auto-gu-lbl">Auto Gujarati:</span>
                      <strong className="auto-gu-val">{formData.announcement.gu || "—"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleManualGu("announcement")}
                      className="auto-gu-toggle-btn"
                    >
                      {showManualGu.announcement ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                    </button>
                  </div>
                  {showManualGu.announcement && (
                    <div className="manual-gu-override-box">
                      <label className="manual-gu-label">Manual Gujarati Override:</label>
                      <input
                        type="text"
                        value={formData.announcement.gu}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            announcement: { ...formData.announcement, gu: e.target.value },
                          })
                        }
                        placeholder="દા.ત. દર શુક્રવારે ઈશા પછી દર્સ"
                        className="editor-input manual-gu-input"
                      />
                    </div>
                  )}
                </div>

                <div className="editor-field">
                  <label>Announcement Expiry Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={formData.announcementUntil}
                    onChange={(e) => setFormData({ ...formData, announcementUntil: e.target.value })}
                    className="editor-input date-input"
                  />
                  <span className="field-hint">Leave blank to display permanently.</span>
                </div>

                {/* About Masjid */}
                <div className="editor-field">
                  <label>About Masjid (English)</label>
                  <textarea
                    rows={3}
                    value={formData.about.en}
                    onChange={(e) => handleEnglishFieldChange("about", e.target.value)}
                    placeholder="Short 2-3 sentence introduction about this masjid..."
                    className="editor-input editor-textarea"
                  />
                  <div className="auto-gu-strip">
                    <span className="auto-gu-badge">
                      <span className="auto-gu-sparkle">✨</span>
                      <span className="auto-gu-lbl">Auto Gujarati:</span>
                      <strong className="auto-gu-val">{formData.about.gu || "—"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleManualGu("about")}
                      className="auto-gu-toggle-btn"
                    >
                      {showManualGu.about ? "✕ Hide Manual Edit" : "✎ Edit Gujarati"}
                    </button>
                  </div>
                  {showManualGu.about && (
                    <div className="manual-gu-override-box">
                      <label className="manual-gu-label">Manual Gujarati Override:</label>
                      <textarea
                        rows={3}
                        value={formData.about.gu}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: { ...formData.about, gu: e.target.value },
                          })
                        }
                        placeholder="મસ્જિદ વિશે બે-ત્રણ વાક્યો..."
                        className="editor-input editor-textarea manual-gu-input"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* CARD 6: 🏷️ FACILITIES & PUBLIC CONTACT */}
              <section className="editor-card">
                <h3 className="card-title">🏷️ Facilities & Public Contact</h3>
                <p className="card-desc">Check available community amenities and direct contact numbers.</p>

                <div className="editor-field">
                  <label className="section-field-label">Available Facilities</label>
                  <div className="facilities-checkbox-grid">
                    {AVAILABLE_FACILITIES.map((facility) => {
                      const isChecked = formData.facilities.includes(facility.id);
                      return (
                        <button
                          key={facility.id}
                          type="button"
                          onClick={() => toggleFacility(facility.id)}
                          className={`facility-pill-btn ${isChecked ? "active" : ""}`}
                        >
                          <span className="check-box">{isChecked ? "✓" : "+"}</span>
                          <span>{facility.labelEn}</span>
                          <span className="gu-tag">({facility.labelGu})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="input-grid-3">
                  <div className="editor-field">
                    <label>Public Phone Number</label>
                    <input
                      type="text"
                      value={formData.phonePublic}
                      onChange={(e) => setFormData({ ...formData, phonePublic: e.target.value })}
                      placeholder="+91 98250 00000"
                      className="editor-input"
                    />
                  </div>

                  <div className="editor-field">
                    <label>Public WhatsApp Number</label>
                    <input
                      type="text"
                      value={formData.whatsappPublic}
                      onChange={(e) => setFormData({ ...formData, whatsappPublic: e.target.value })}
                      placeholder="+91 98250 00000"
                      className="editor-input"
                    />
                  </div>

                  <div className="editor-field">
                    <label>Google Maps Link</label>
                    <input
                      type="url"
                      value={formData.mapLink}
                      onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="editor-input"
                    />
                  </div>
                </div>
              </section>

              {/* STICKY BOTTOM SAVE BAR */}
              <div className="sticky-save-bar">
                <div className="save-bar-info">
                  <span className="pulse-dot" />
                  <span>
                    Editing <strong>{formData.name.en || formData.slug}</strong> — Changes sync directly to the live page.
                  </span>
                </div>
                <div className="save-bar-actions">
                  <button
                    type="button"
                    onClick={() => {
                      const original = sites.find((s) => s.slug === selectedSlug);
                      if (original) setFormData(JSON.parse(JSON.stringify(original)));
                    }}
                    className="discard-btn"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="save-primary-btn"
                  >
                    {isSaving ? "Saving..." : "💾 Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-detail-placeholder">
              <div className="placeholder-icon">🕌</div>
              <h3>Select a masjid to manage</h3>
              <p>Choose a masjid from the list on the left to edit its Jammat times, plan, and settings.</p>
              <button onClick={startCreateNew} className="admin-add-btn placeholder-btn">
                + Create New Masjid
              </button>
            </div>
          )}
        </main>

        {/* Rightmost Column: Live Miniature Mobile Preview */}
        {showPreview && formData && (
          <aside className="admin-preview-column">
            <MasjidMiniPreview
              site={formData}
              lang={previewLang}
              onLangToggle={() => setPreviewLang(previewLang === "gu" ? "en" : "gu")}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

/* ─── Miniature Live Mobile Preview Component ─── */
function MasjidMiniPreview({
  site,
  lang,
  onLangToggle,
}: {
  site: Site;
  lang: "gu" | "en";
  onLangToggle: () => void;
}) {
  const name = site.name[lang] || site.name.en || site.slug;
  const area = site.area[lang] || site.area.en;
  const address = site.address[lang] || site.address.en;
  const note = site.timesNote[lang] || site.timesNote.en;
  const announcement = site.announcement[lang] || site.announcement.en;
  const waGroup = site.whatsappGroupLink;

  return (
    <div className="mini-phone-wrapper">
      <div className="mini-phone-header-controls">
        <span className="mini-phone-label">📱 Live Phone Preview</span>
        <button
          type="button"
          onClick={onLangToggle}
          className="mini-lang-toggle"
          title="Toggle preview language"
        >
          {lang === "gu" ? "🇮🇳 ગુજરાતી" : "🇬🇧 English"}
        </button>
      </div>

      <div className="mini-phone-frame" data-theme={site.theme}>
        {/* iOS Dynamic Island & Status Bar */}
        <div className="mini-phone-status-bar">
          <span className="mini-status-time">9:41</span>
          <div className="mini-dynamic-island" />
          <div className="mini-status-icons">
            <span className="mini-signal">●●●</span>
            <span className="mini-battery">100%</span>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="mini-phone-viewport">
          {/* Mini Nav */}
          <div className="mini-phone-nav">
            <span className="mini-nav-back" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <img src="/logo-emblem.svg" alt="Mihrab" style={{ height: "13px", width: "13px" }} />
              <span>Mihrab</span>
            </span>
            <span className="mini-nav-lang-pill">{lang.toUpperCase()}</span>
          </div>

          {/* Mini Hero */}
          <div className="mini-phone-hero">
            {site.photo ? (
              <img
                key={site.photo}
                src={
                  site.photo.startsWith("http://") ||
                  site.photo.startsWith("https://") ||
                  site.photo.startsWith("/") ||
                  site.photo.startsWith("data:")
                    ? site.photo
                    : `/photos/${site.photo}`
                }
                alt={name}
                className="mini-hero-img"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="mini-hero-fallback">
                <span className="mini-hero-emblem">﷽</span>
              </div>
            )}
            <div className="mini-hero-badges">
              <span className="mini-badge-verified">✓ Verified</span>
              {area && <span className="mini-badge-area">📍 {area}</span>}
            </div>
          </div>

          {/* Mini Masthead */}
          <div className="mini-phone-masthead">
            <div className="mini-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰનِ الرَّحِيمِ</div>
            <h4 className="mini-masjid-title">{name}</h4>
            {area && <p className="mini-masjid-subtitle">{area}, Ahmedabad</p>}
          </div>

          {/* Mini Jamaat Times Table */}
          <div className="mini-times-card">
            <div className="mini-times-header">
              <span>{lang === "gu" ? "જમાતનો સમય" : "Jamaat Times"}</span>
              <span className="mini-live-dot">● Live</span>
            </div>

            <div className="mini-times-table">
              {PRAYER_LIST.map((p) => {
                const jTime = site.times[p.key as keyof typeof site.times];
                const aTime = site.azanTimes[p.key as keyof typeof site.azanTimes];
                if (!jTime) return null;
                return (
                  <div key={p.key} className={`mini-time-row ${p.key === "jumuah" ? "mini-jumuah" : ""}`}>
                    <span className="mini-prayer-name">
                      {p.icon} {lang === "gu" ? p.labelGu : p.labelEn}
                    </span>
                    <div className="mini-time-duo">
                      {aTime && <span className="mini-azan-val">{aTime}</span>}
                      <span className="mini-jamaat-val">{jTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {note && <div className="mini-times-note">📌 {note}</div>}

            {site.ramadan && site.ramadan.enabled && (site.ramadan.tarawih || site.ramadan.qiyam) ? (
              <div className="mini-ramadan-box">
                <div className="mini-ramadan-header">
                  <span>🌙 {lang === "gu" ? "રમઝાન સ્પેશિયલ" : "Ramadan Special"}</span>
                </div>
                <div className="mini-ramadan-times">
                  {site.ramadan.tarawih ? (
                    <div className="mini-ramadan-item">
                      <span>{lang === "gu" ? "તરાવીહ" : "Tarawih"}</span>
                      <strong>{site.ramadan.tarawih}</strong>
                    </div>
                  ) : null}
                  {site.ramadan.qiyam ? (
                    <div className="mini-ramadan-item">
                      <span>{lang === "gu" ? "કિયામુલ લૈલ" : "Qiyam"}</span>
                      <strong>{site.ramadan.qiyam}</strong>
                    </div>
                  ) : null}
                </div>
                {site.ramadan.note && (site.ramadan.note[lang] || site.ramadan.note.en) ? (
                  <div className="mini-ramadan-note">
                    ✨ {site.ramadan.note[lang] || site.ramadan.note.en}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Mini WhatsApp Community QR Code Section */}
          {waGroup && (
            <div className="mini-wa-card">
              <div className="mini-wa-header">
                <span className="mini-wa-icon">🟢</span>
                <strong>{lang === "gu" ? "મસ્જિદ વોટ્સએપ ગ્રૂપ" : "WhatsApp Community"}</strong>
              </div>
              <div className="mini-wa-body">
                <div className="mini-wa-qr">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=3&data=${encodeURIComponent(
                      waGroup
                    )}`}
                    alt="WhatsApp QR Code"
                    width={56}
                    height={56}
                  />
                </div>
                <div className="mini-wa-info">
                  <p>{site.whatsappGroupText?.[lang] || (lang === "gu" ? "દૈનિક સમય અને સૂચનાઓ માટે જોડાઓ" : "Join for daily updates & notices")}</p>
                  <span className="mini-wa-join-btn">Join Group ↗</span>
                </div>
              </div>
            </div>
          )}

          {/* Mini Announcement */}
          {announcement && (
            <div className="mini-announcement-card">
              <strong>📢 {lang === "gu" ? "જાહેરાત" : "Notice"}:</strong> {announcement}
            </div>
          )}

          {/* Mini Facilities */}
          {site.facilities.length > 0 && (
            <div className="mini-facilities-row">
              {site.facilities.slice(0, 4).map((f) => (
                <span key={f} className="mini-fac-pill">{f}</span>
              ))}
            </div>
          )}

          {/* Mini Footer Actions */}
          <div className="mini-action-btns-row">
            {site.phonePublic && <span className="mini-action-pill">📞 Call</span>}
            {site.whatsappPublic && <span className="mini-action-pill">💬 WhatsApp</span>}
            {site.mapLink && <span className="mini-action-pill">🗺️ Map</span>}
          </div>

          <div className="mini-phone-footer">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <img src="/logo-emblem.svg" alt="Mihrab" style={{ height: "12px", width: "12px" }} />
              Made with Mihrab.in
            </span>
          </div>
        </div>

        {/* iOS Home Indicator */}
        <div className="mini-home-indicator" />
      </div>
    </div>
  );
}
