import type { Metadata } from "next";
import { getAllSites } from "@/lib/sites";
import { HomeDirectory } from "@/components/HomeDirectory";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Mihrab Ahmedabad – જમાતના સમય અને મસ્જિદ ડિરેક્ટરી",
  description:
    "અમદાવાદની મસ્જિદોના દૈનિક જમાતના સમય, જાહેરાતો અને માહિતી. Daily Jamaat prayer times and directory for masjids across Ahmedabad.",
};

export default async function Home() {
  const allSites = await getAllSites();
  // Show active and preview masjids in directory
  const activeSites = allSites.filter((s) => s.status !== "off");

  return <HomeDirectory sites={activeSites} />;
}
