import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/session";
import { getSettings, getCompletedDays, computeStreaks, computeBadges } from "@/lib/reading-progress";
import { getCurrentDayNumber, formatShortDate } from "@/lib/day-math";
import { TabBar } from "@/components/TabBar";

export const metadata = { title: "Bible in a Year | Profile" };

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export default async function ProfilePage() {
  const user = await requireSessionUser("/profile");
  const settings = getSettings(user.userId);

  if (!settings) {
    redirect("/onboarding");
  }

  const completedDays = getCompletedDays(user.userId);
  const currentDayNumber = getCurrentDayNumber(settings.startDate);
  const streaks = computeStreaks(completedDays, currentDayNumber);
  const badges = computeBadges(completedDays.size, streaks);

  return (
    <main>
      <div className="profile-header">
        <h1>Profile</h1>
        <Link href="/settings" className="gear-link" aria-label="Settings">
          ⚙
        </Link>
      </div>

      <div className="identity-row">
        <div className="avatar">{initialsFor(user.displayName)}</div>
        <div>
          <p>{user.displayName}</p>
          <p>Reading since {formatShortDate(settings.startDate)}</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <strong style={{ color: "var(--cta)" }}>{streaks.current}</strong>
          <span>Day streak</span>
        </div>
        <div className="stat-card">
          <strong style={{ color: "var(--accent)" }}>{streaks.longest}</strong>
          <span>Best streak</span>
        </div>
        <div className="stat-card">
          <strong>{completedDays.size}</strong>
          <span>Days read</span>
        </div>
      </div>

      <p className="settings-section-label">Badges</p>
      <div className="badges-grid">
        {badges.map((badge) => (
          <div className={`badge-tile${badge.earned ? "" : " locked"}`} key={badge.name}>
            <div className={`badge-icon${badge.earned ? " earned" : " locked"}`} />
            <p>{badge.name}</p>
            <p>{badge.sub}</p>
          </div>
        ))}
      </div>

      <TabBar />
    </main>
  );
}
