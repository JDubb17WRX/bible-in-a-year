import Link from "next/link";
import { requireSessionUser } from "@/lib/session";
import { getSettings } from "@/lib/reading-progress";
import { redirect } from "next/navigation";
import { SettingsPlanSection } from "@/components/SettingsPlanSection";
import { NotificationsSection } from "@/components/NotificationsSection";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata = { title: "Bible in a Year | Settings" };

export default async function SettingsPage() {
  const user = await requireSessionUser("/settings");
  const settings = getSettings(user.userId);

  if (!settings) {
    redirect("/onboarding");
  }

  return (
    <main>
      <div className="settings-back">
        <Link href="/profile">&larr;</Link>
        <h1>Settings</h1>
      </div>

      <p className="settings-section-label">Reading plan</p>
      <SettingsPlanSection startDate={settings.startDate} translation={settings.translation} />

      <NotificationsSection />

      <p className="settings-section-label">About</p>
      <div className="settings-group">
        <Link href="/settings/help" className="settings-row settings-row-link">
          <span className="settings-row-label">Help &amp; support</span>
          <span className="settings-row-value">&rsaquo;</span>
        </Link>
        <Link href="/settings/about" className="settings-row settings-row-link">
          <span className="settings-row-label">About this app</span>
          <span className="settings-row-value">&rsaquo;</span>
        </Link>
      </div>

      <SignOutButton />
    </main>
  );
}
