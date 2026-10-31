import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSites, getSite } from "@/lib/sites";
import { PRAYERS, T, displayDate, displayTime, pick } from "@/lib/i18n";
import { PosterClientView } from "./PosterClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const sites = await getAllSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return {};
  const name = pick(site.name, "gu");
  return {
    title: `${name} – નોટિસ બોર્ડ પોસ્ટર (A4 Printable) | Mihrab`,
    description: `પ્રિન્ટેબલ જમાત સમયપત્રક અને QR કોડ – ${name}`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();

  return <PosterClientView site={site} />;
}
