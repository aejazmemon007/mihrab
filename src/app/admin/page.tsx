import { getAllSites } from "@/lib/sites";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  const sites = await getAllSites();
  return <AdminDashboard sites={sites} />;
}
