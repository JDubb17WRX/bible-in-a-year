import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSettings, saveSettings, type Translation } from "@/lib/reading-progress";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  return NextResponse.json({ settings: getSettings(user.userId) });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { startDate?: unknown; translation?: unknown }
    | null;

  const startDate = typeof body?.startDate === "string" ? body.startDate : "";
  const translation: Translation = body?.translation === "web" ? "web" : "esv";

  if (!ISO_DATE_RE.test(startDate)) {
    return NextResponse.json({ error: "startDate must be an ISO date (YYYY-MM-DD)." }, { status: 400 });
  }

  saveSettings({ userId: user.userId, startDate, translation });
  return NextResponse.json({ settings: getSettings(user.userId) });
}
