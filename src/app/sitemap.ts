import type { MetadataRoute } from "next";
import { getAllSites, siteUrl } from "@/lib/sites";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const sites = (await getAllSites()).filter((s) => s.status === "live");
  return sites.flatMap((s) => [
    { url: `${base}/${s.slug}`, lastModified: s.updatedOn || undefined },
    { url: `${base}/${s.slug}/en`, lastModified: s.updatedOn || undefined },
  ]);
}
