import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { setDayComplete } from "@/lib/reading-progress";
import { TOTAL_DAYS } from "@/data/reading-plan";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { day?: unknown; complete?: unknown }
    | null;

  const day = Number(body?.day);
  const complete = Boolean(body?.complete);

  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }

  setDayComplete(user.userId, day, complete);
  return NextResponse.json({ day, complete });
}
