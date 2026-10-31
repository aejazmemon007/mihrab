export type SiteTheme = "noor" | "midnight" | "andalus" | "sultan" | "madinah";

export type SitePlan = "free" | "basic" | "premium";

export type SitePattern = "noor" | "midnight" | "andalus" | "girih" | "mashrabiya" | "damascus";

/** Maps each plan to the themes it can use. */
export const PLAN_THEMES: Record<SitePlan, SiteTheme[]> = {
  free: ["noor"],
  basic: ["noor", "midnight", "sultan"],
  premium: ["noor", "midnight", "andalus", "sultan", "madinah"],
};

/** Maps each plan to the patterns it can use. */
export const PLAN_PATTERNS: Record<SitePlan, SitePattern[]> = {
  free: ["noor"],
  basic: ["noor", "midnight", "andalus"],
  premium: ["noor", "midnight", "andalus", "girih", "mashrabiya", "damascus"],
};

export interface PresetPhoto {
  id: string;
  filename: string;
  title: string;
  subtitle: string;
  thumbnail: string;
}

export const PRESET_MASJID_PHOTOS: PresetPhoto[] = [
  {
    id: "noor-masjid",
    filename: "noor-masjid.jpg",
    title: "Noor Masjid Facade",
    subtitle: "Stone arches & minaret",
    thumbnail: "/photos/noor-masjid.jpg",
  },
  {
    id: "usman-bin-affan",
    filename: "usman-bin-affan.jpg",
    title: "Usman Bin Affan",
    subtitle: "Grand central arch & courtyard",
    thumbnail: "/photos/usman-bin-affan.jpg",
  },
  {
    id: "default-masjid",
    filename: "default-masjid.jpg",
    title: "Classic Islamic Architecture",
    subtitle: "Marble dome & twilight ambiance",
    thumbnail: "/photos/default-masjid.jpg",
  },
];



