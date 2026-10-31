import { getAllSites } from "@/lib/sites";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sites = await getAllSites();
  return <AdminDashboard sites={sites} />;
}
