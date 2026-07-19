import Link from "next/link";
import { requireSessionUser } from "@/lib/session";

export const metadata = { title: "Bible in a Year | About" };

export default async function AboutPage() {
  await requireSessionUser("/settings/about");

  return (
    <main>
      <div className="settings-back">
        <Link href="/settings">&larr;</Link>
        <h1>About this app</h1>
      </div>
      <div className="card content-page">
        <p>
          Bible in a Year is a 364-day, 7-track parallel reading plan through the Law, History,
          Psalms, Poetry, Prophecy, Gospels, and Epistles — one section from each track, every
          week.
        </p>
        <p>
          Available in ESV (English Standard Version) and WEB (World English Bible, public
          domain). Install it to your home screen for quick, offline-friendly daily reading.
        </p>
      </div>
    </main>
  );
}
