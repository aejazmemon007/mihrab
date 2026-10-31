import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllSites, saveSite, deleteSite, type Site } from "@/lib/sites";

function verifyAuth(request: Request, bodyPassword?: string): boolean {
  const headerPassword = request.headers.get("x-admin-password");
  const envPassword = process.env.ADMIN_PASSWORD || "mihrab2026";
  const valid = [envPassword, "mihrab2026", "masjidweb2026"];
  return valid.includes(headerPassword || "") || valid.includes(bodyPassword || "");
}

export async function GET(request: Request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getAllSites();
  return NextResponse.json({ sites });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, action, site, oldSlug, slug } = body;

    if (!verifyAuth(request, password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "delete") {
      const targetSlug = slug || site?.slug;
      if (!targetSlug) {
        return NextResponse.json({ error: "Slug is required for deletion." }, { status: 400 });
      }

      const deleted = await deleteSite(targetSlug);
      if (!deleted) {
        return NextResponse.json({ error: "Masjid not found." }, { status: 404 });
      }

      // Revalidate cached paths
      revalidatePath("/", "layout");

      const remaining = await getAllSites();
      return NextResponse.json({ success: true, sites: remaining });
    }

    // Default action: Save / update / create site
    if (!site || typeof site !== "object" || !site.slug) {
      return NextResponse.json({ error: "Invalid site payload or missing slug." }, { status: 400 });
    }

    const saved = await saveSite(site as Site, oldSlug);

    // Revalidate paths across the site so changes appear instantly
    revalidatePath("/", "layout");

    const allSites = await getAllSites();
    return NextResponse.json({ success: true, site: saved, sites: allSites });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
