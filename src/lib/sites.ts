import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/** How often (seconds) pages revalidate in production if static. */
export const REVALIDATE_SECONDS = 0;

export type SiteStatus = "live" | "preview" | "off";

import type { SiteTheme, SitePlan, SitePattern } from "./plans";
import { PLAN_THEMES, PLAN_PATTERNS } from "./plans";
export type { SiteTheme, SitePlan, SitePattern };
export { PLAN_THEMES, PLAN_PATTERNS };

export type SiteRamadan = {
  enabled: boolean;
  tarawih: string;
  qiyam: string;
  note: { en: string; gu: string };
};

export type Site = {
  slug: string;
  status: SiteStatus;
  theme: SiteTheme;
  name: { en: string; gu: string };
  area: { en: string; gu: string };
  address: { en: string; gu: string };
  times: {
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jumuah: string;
  };
  azanTimes: {
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jumuah: string;
  };
  ramadan?: SiteRamadan;
  timesNote: { en: string; gu: string };
  announcement: { en: string; gu: string };
  announcementUntil: string;
  about: { en: string; gu: string };
  facilities: string[];
  phonePublic: string;
  whatsappPublic: string;
  whatsappGroupLink: string;
  whatsappGroupText: { en: string; gu: string };
  mapLink: string;
  photo: string;
  updatedOn: string;
  plan: SitePlan;
  pattern: SitePattern;
};

const IS_VERCEL = Boolean(process.env.VERCEL);
const LOCAL_SITES_PATH = path.join(process.cwd(), "data", "sites.json");
const TMP_SITES_PATH = path.join("/tmp", "sites.json");

function getSitesFilePath(): string {
  if (IS_VERCEL) {
    return TMP_SITES_PATH;
  }
  return LOCAL_SITES_PATH;
}

async function ensureFileInitialized(): Promise<string> {
  const filePath = getSitesFilePath();
  if (IS_VERCEL && !existsSync(filePath)) {
    try {
      if (existsSync(LOCAL_SITES_PATH)) {
        const initial = await readFile(LOCAL_SITES_PATH, "utf8");
        await writeFile(TMP_SITES_PATH, initial, "utf8");
      }
    } catch (e) {
      console.warn("Could not copy initial sites.json to /tmp:", e);
    }
  }
  return filePath;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHOTO_PATTERN = /^[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/i;

export function sanitizePhoto(photo: string): string {
  const p = (photo ?? "").trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/") || p.startsWith("data:image/")) {
    return p;
  }
  if (PHOTO_PATTERN.test(p)) {
    return p;
  }
  return "";
}

export function deriveAzanTime(jamaatTime: string, prayer: string): string {
  if (!jamaatTime) return "";
  const cleanStr = jamaatTime.trim().toLowerCase();
  if (cleanStr.includes("sunset")) {
    return "Sunset";
  }
  const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  let totalMinutes = h * 60 + m;

  // Standard interval between Azan and Jamaat
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

function hasBlobStorage(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    process.env.VERCEL_BLOB_STORE_ID
  );
}

export async function getAllSites(): Promise<Site[]> {
  // 1. Try Vercel Blob first if token or store id is available
  if (hasBlobStorage()) {
    try {
      const { get, list } = await import("@vercel/blob");
      let content = "";

      // Try reading private first (matches user's private store)
      try {
        const file = await get("data/sites.json", { access: "private", useCache: false });
        if (file && file.statusCode === 200 && file.stream) {
          content = await new Response(file.stream as unknown as BodyInit).text();
        }
      } catch {
        // Fallback to list/fetch for public store
        const { blobs } = await list({ prefix: "data/sites.json", limit: 1 });
        if (blobs.length > 0) {
          const res = await fetch(blobs[0].url, { cache: "no-store" });
          if (res.ok) {
            content = await res.text();
          }
        }
      }

      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeSite).filter((s): s is Site => s !== null);
        }
      }
    } catch (err) {
      console.warn("Vercel Blob fetch failed, falling back to file:", err);
    }
  }

  // 2. Fallback to local or /tmp file
  try {
    const filePath = await ensureFileInitialized();
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(sanitizeSite).filter((s): s is Site => s !== null);
    }
    return [];
  } catch (err: unknown) {
    const nodeErr = err as { code?: string };
    if (nodeErr.code === "ENOENT") {
      return [];
    }
    console.error("Failed to read sites.json:", err);
    return [];
  }
}

export async function getSite(slug: string): Promise<Site | null> {
  const sites = await getAllSites();
  const normalized = (slug ?? "").trim().toLowerCase();
  return sites.find((s) => s.slug === normalized) ?? null;
}

export let lastBlobError: string | null = null;

export async function saveSite(site: Site, oldSlug?: string): Promise<Site> {
  const sanitized = sanitizeSite(site);
  if (!sanitized) {
    throw new Error("Invalid site data or slug format.");
  }

  const sites = await getAllSites();
  const targetSlug = (oldSlug || sanitized.slug).toLowerCase();
  const existingIndex = sites.findIndex((s) => s.slug.toLowerCase() === targetSlug);

  const updated: Site = {
    ...sanitized,
    updatedOn: todayInIndia(),
  };

  if (existingIndex >= 0) {
    sites[existingIndex] = updated;
  } else {
    // If it's a new slug, ensure no collision
    const slugCollision = sites.some((s) => s.slug.toLowerCase() === updated.slug.toLowerCase());
    if (slugCollision) {
      throw new Error(`A masjid with slug "${updated.slug}" already exists.`);
    }
    sites.push(updated);
  }

  const dataString = JSON.stringify(sites, null, 2);

  // 1. If Vercel Blob is configured, save to Blob (supports both private and public stores)
  let blobError: string | null = null;
  if (hasBlobStorage()) {
    try {
      const { put } = await import("@vercel/blob");
      try {
        await put("data/sites.json", dataString, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 0,
        });
      } catch (errPriv: unknown) {
        try {
          await put("data/sites.json", dataString, {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
          });
        } catch (errPub: unknown) {
          blobError = `Private failed: ${errPriv instanceof Error ? errPriv.message : String(errPriv)} | Public failed: ${errPub instanceof Error ? errPub.message : String(errPub)}`;
          console.error("Blob put failed:", blobError);
        }
      }
    } catch (err: unknown) {
      blobError = `Import failed: ${err instanceof Error ? err.message : String(err)}`;
      console.error("Failed to save to Vercel Blob:", err);
    }
  } else {
    blobError = "hasBlobStorage() returned false - no BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID in env";
  }
  lastBlobError = blobError;

  // 2. Also save to local or /tmp file
  try {
    const filePath = await ensureFileInitialized();
    await writeFile(filePath, dataString, "utf8");
  } catch (err) {
    console.error("Failed to write to file system:", err);
  }

  return updated;
}

export async function deleteSite(slug: string): Promise<boolean> {
  const sites = await getAllSites();
  const normalized = slug.trim().toLowerCase();
  const filtered = sites.filter((s) => s.slug.toLowerCase() !== normalized);
  if (filtered.length === sites.length) {
    return false;
  }

  const dataString = JSON.stringify(filtered, null, 2);

  // 1. If Vercel Blob is configured, update Blob
  if (hasBlobStorage()) {
    try {
      const { put } = await import("@vercel/blob");
      try {
        await put("data/sites.json", dataString, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 0,
        });
      } catch {
        await put("data/sites.json", dataString, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
        });
      }
    } catch (err) {
      console.error("Failed to delete from Vercel Blob:", err);
    }
  }

  // 2. Also save to local or /tmp file
  try {
    const filePath = await ensureFileInitialized();
    await writeFile(filePath, dataString, "utf8");
  } catch (err) {
    console.error("Failed to write to file system:", err);
  }

  return true;
}

function sanitizeSite(raw: Partial<Site>): Site | null {
  if (!raw || typeof raw !== "object") return null;
  const slug = (raw.slug ?? "").trim().toLowerCase();
  if (!SLUG_PATTERN.test(slug)) return null;

  const validStatuses: SiteStatus[] = ["live", "preview", "off"];
  const status: SiteStatus = validStatuses.includes(raw.status as SiteStatus)
    ? (raw.status as SiteStatus)
    : "preview";

  const validPlans: SitePlan[] = ["free", "basic", "premium"];
  const plan: SitePlan = validPlans.includes(raw.plan as SitePlan)
    ? (raw.plan as SitePlan)
    : "free";

  const validThemes: SiteTheme[] = ["noor", "midnight", "andalus", "sultan", "madinah"];
  const theme: SiteTheme = validThemes.includes(raw.theme as SiteTheme)
    ? (raw.theme as SiteTheme)
    : "noor";

  const validPatterns: SitePattern[] = ["noor", "midnight", "andalus", "girih", "mashrabiya", "damascus"];
  const defaultPatternForTheme: SitePattern =
    theme === "sultan"
      ? "girih"
      : theme === "madinah"
      ? "damascus"
      : (theme as SitePattern);
  const pattern: SitePattern = validPatterns.includes(raw.pattern as SitePattern)
    ? (raw.pattern as SitePattern)
    : defaultPatternForTheme;

  const photo = (raw.photo ?? "").trim();

  return {
    slug,
    status,
    theme,
    plan,
    pattern,
    name: {
      en: (raw.name?.en ?? "").trim(),
      gu: (raw.name?.gu ?? "").trim(),
    },
    area: {
      en: (raw.area?.en ?? "").trim(),
      gu: (raw.area?.gu ?? "").trim(),
    },
    address: {
      en: (raw.address?.en ?? "").trim(),
      gu: (raw.address?.gu ?? "").trim(),
    },
    times: {
      fajr: (raw.times?.fajr ?? "").trim(),
      zuhr: (raw.times?.zuhr ?? "").trim(),
      asr: (raw.times?.asr ?? "").trim(),
      maghrib: (raw.times?.maghrib ?? "").trim(),
      isha: (raw.times?.isha ?? "").trim(),
      jumuah: (raw.times?.jumuah ?? "").trim(),
    },
    azanTimes: {
      fajr: (raw.azanTimes?.fajr ?? "").trim() || deriveAzanTime(raw.times?.fajr ?? "", "fajr"),
      zuhr: (raw.azanTimes?.zuhr ?? "").trim() || deriveAzanTime(raw.times?.zuhr ?? "", "zuhr"),
      asr: (raw.azanTimes?.asr ?? "").trim() || deriveAzanTime(raw.times?.asr ?? "", "asr"),
      maghrib: (raw.azanTimes?.maghrib ?? "").trim() || deriveAzanTime(raw.times?.maghrib ?? "", "maghrib"),
      isha: (raw.azanTimes?.isha ?? "").trim() || deriveAzanTime(raw.times?.isha ?? "", "isha"),
      jumuah: (raw.azanTimes?.jumuah ?? "").trim() || deriveAzanTime(raw.times?.jumuah ?? "", "jumuah"),
    },
    ramadan: {
      enabled: Boolean(raw.ramadan?.enabled),
      tarawih: (raw.ramadan?.tarawih ?? "").trim(),
      qiyam: (raw.ramadan?.qiyam ?? "").trim(),
      note: {
        en: (raw.ramadan?.note?.en ?? "").trim(),
        gu: (raw.ramadan?.note?.gu ?? "").trim(),
      },
    },
    timesNote: {
      en: (raw.timesNote?.en ?? "").trim(),
      gu: (raw.timesNote?.gu ?? "").trim(),
    },
    announcement: {
      en: (raw.announcement?.en ?? "").trim(),
      gu: (raw.announcement?.gu ?? "").trim(),
    },
    announcementUntil: (raw.announcementUntil ?? "").trim(),
    about: {
      en: (raw.about?.en ?? "").trim(),
      gu: (raw.about?.gu ?? "").trim(),
    },
    facilities: Array.isArray(raw.facilities)
      ? raw.facilities.map((f) => String(f).trim().toLowerCase()).filter(Boolean)
      : [],
    phonePublic: (raw.phonePublic ?? "").trim(),
    whatsappPublic: (raw.whatsappPublic ?? "").trim(),
    whatsappGroupLink: (raw.whatsappGroupLink ?? "").trim(),
    whatsappGroupText: {
      en: (raw.whatsappGroupText?.en ?? "").trim(),
      gu: (raw.whatsappGroupText?.gu ?? "").trim(),
    },
    mapLink: (raw.mapLink ?? "").trim(),
    photo: sanitizePhoto(photo),
    updatedOn: (raw.updatedOn ?? "").trim() || todayInIndia(),
  };
}

/** Today's date in India as YYYY-MM-DD. */
export function todayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isAnnouncementVisible(site: Site): boolean {
  if (!site.announcementUntil) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(site.announcementUntil)) return true;
  return site.announcementUntil >= todayInIndia();
}

/** Digits only, for tel: and wa.me links. Adds India's 91 to 10-digit numbers. */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function siteUrl(): string {
  return (
    process.env.SITE_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://mihrab-masjid.theboxux.com"
      : "http://localhost:3000")
  ).replace(/\/$/, "");
}
