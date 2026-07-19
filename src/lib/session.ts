import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
  userId: string;
  displayName: string;
  email: string;
};

// Must match SESSION_COOKIE_NAME in the Covenanters app's src/lib/auth.ts.
// This app never signs or verifies the cookie itself — it only forwards
// whatever value the browser already attached (via the shared
// SESSION_COOKIE_DOMAIN) to the Covenanters app's own whoami endpoint, which
// does the real verification.
const SESSION_COOKIE_NAME = "covenanters_session";

function getCovenantersAppUrl(): string {
  const url = process.env.COVENANTERS_APP_URL;
  if (!url) {
    throw new Error("COVENANTERS_APP_URL is not configured.");
  }
  return url.replace(/\/+$/, "");
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const response = await fetch(`${getCovenantersAppUrl()}/api/session/whoami`, {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SessionUser;
  } catch {
    return null;
  }
}

export function buildLoginRedirectUrl(returnPath: string): string {
  const loginUrl = process.env.COVENANTERS_LOGIN_URL || "https://rpcnacovenanters.com/community/login";
  const appBaseUrl = process.env.APP_BASE_URL || "https://bible.rpcnacovenanters.com";
  const returnTo = new URL(returnPath, appBaseUrl).toString();

  const url = new URL(loginUrl);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

export async function requireSessionUser(currentPath: string): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(buildLoginRedirectUrl(currentPath));
  }

  return user;
}
