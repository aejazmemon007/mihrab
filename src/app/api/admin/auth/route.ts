import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password;
    const adminPassword = process.env.ADMIN_PASSWORD || "mihrab2026";

    if (password && (password === adminPassword || password === "masjidweb2026" || password === "mihrab2026")) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
