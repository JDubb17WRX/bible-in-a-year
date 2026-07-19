import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, buildLoginRedirectUrl } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();

  // This app never issued the cookie (it's owned by the Covenanters app), so
  // clearing it here only ends the session for this app's domain scope.
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
    domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
  });

  return NextResponse.json({ redirectTo: buildLoginRedirectUrl("/") });
}
