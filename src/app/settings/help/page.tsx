import Link from "next/link";
import { requireSessionUser } from "@/lib/session";

export const metadata = { title: "Bible in a Year | Help & Support" };

export default async function HelpPage() {
  await requireSessionUser("/settings/help");

  return (
    <main>
      <div className="settings-back">
        <Link href="/settings">&larr;</Link>
        <h1>Help &amp; support</h1>
      </div>
      <div className="card content-page">
        <p>
          This app mirrors the daily reading plan your RPCNA Covenanters community follows
          together. If a passage won&apos;t load, try again once you&apos;re back online — days
          you&apos;ve already opened stay readable offline.
        </p>
        <p>
          For questions about the plan itself, your login, or anything else, reach out to your
          Covenanters community administrator.
        </p>
      </div>
    </main>
  );
}
