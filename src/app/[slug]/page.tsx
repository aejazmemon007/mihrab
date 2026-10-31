import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSites, getSite } from "@/lib/sites";
import { MasjidPage, masjidMetadata } from "@/components/MasjidPage";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const sites = await getAllSites();
  return sites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite(slug);
  return site ? masjidMetadata(site, "gu") : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();
  return <MasjidPage site={site} lang="gu" />;
}
