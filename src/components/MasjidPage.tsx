import type { Metadata } from "next";
import { type Site, siteUrl } from "@/lib/sites";
import { type Lang, pick } from "@/lib/i18n";
import { MasjidClientView } from "./MasjidClientView";

export function pathFor(slug: string, lang: Lang): string {
  return lang === "gu" ? `/${slug}` : `/${slug}/en`;
}

export function masjidMetadata(site: Site, lang: Lang): Metadata {
  const name = pick(site.name, lang);
  const area = pick(site.area, lang);
  const title = area ? `${name}, ${area}` : name;
  const description =
    lang === "gu"
      ? `${name} – જમાતનો સમય, જાહેરાત, સરનામું અને સંપર્ક.`
      : `${name} – jamaat times, announcements, address and contact.`;
  const base = siteUrl();
  const visible = site.status === "live";
  return {
    title,
    description,
    alternates: {
      canonical: `${base}${pathFor(site.slug, lang)}`,
      languages: {
        gu: `${base}${pathFor(site.slug, "gu")}`,
        en: `${base}${pathFor(site.slug, "en")}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${base}${pathFor(site.slug, lang)}`,
      type: "website",
      images: site.photo ? [`${base}/photos/${site.photo}`] : undefined,
    },
    robots: visible ? undefined : { index: false, follow: false },
  };
}

export function MasjidPage({ site, lang }: { site: Site; lang: Lang }) {
  return <MasjidClientView site={site} lang={lang} />;
}
