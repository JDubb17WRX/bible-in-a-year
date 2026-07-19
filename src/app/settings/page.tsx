import Link from "next/link";
import { requireSessionUser } from "@/lib/session";
import { getSettings } from "@/lib/reading-progress";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = { title: "Bible in a Year | Settings" };

export default async function SettingsPage() {
  const user = await requireSessionUser("/settings");
  const settings = getSettings(user.userId);

  if (!settings) {
    redirect("/onboarding");
  }

  return (
    <main>
      <div className="card">
        <Link href="/">&larr; Back to today</Link>
        <h1>Settings</h1>
        <p>
          Changing the start date shifts which day you land on today. Changing translation only
          affects passages you view from now on (nothing already read is lost).
        </p>
        <OnboardingForm
          initialStartDate={settings.startDate}
          initialTranslation={settings.translation}
          submitLabel="Save changes"
        />
      </div>
    </main>
  );
}
