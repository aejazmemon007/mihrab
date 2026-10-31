import { NextResponse } from "next/server";
import { autoConvertToGujarati } from "@/lib/transliterate";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();

    if (!text) {
      return NextResponse.json({ translatedText: "" });
    }

    // 1. First run instant local smart transliteration / dictionary
    const localResult = autoConvertToGujarati(text);

    // 2. If it is a multi-word long sentence (e.g. Announcement or About text), try online translation
    if (text.split(/\s+/).length >= 4) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=gu&dt=t&q=${encodeURIComponent(text)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && Array.isArray(data[0])) {
            const fullTranslated = data[0].map((chunk: any) => chunk[0] || "").join("");
            if (fullTranslated && fullTranslated.trim()) {
              return NextResponse.json({ translatedText: fullTranslated.trim() });
            }
          }
        }
      } catch {
        // Fall back gracefully to local engine
      }
    }

    return NextResponse.json({ translatedText: localResult });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Translation error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
