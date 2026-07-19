import { NextRequest, NextResponse } from "next/server";
import { getPassageForDay } from "@/lib/get-passage";

export async function GET(request: NextRequest) {
  const dayParam = request.nextUrl.searchParams.get("day");
  const translation = request.nextUrl.searchParams.get("translation") === "web" ? "web" : "esv";
  const day = Number(dayParam);

  try {
    const passage = await getPassageForDay(day, translation);

    if (!passage) {
      return NextResponse.json({ error: "Invalid day parameter." }, { status: 400 });
    }

    return NextResponse.json(passage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch passage." },
      { status: 502 },
    );
  }
}
