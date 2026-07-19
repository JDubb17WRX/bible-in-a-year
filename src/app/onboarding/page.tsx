import { requireSessionUser } from "@/lib/session";
import { getSettings } from "@/lib/reading-progress";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = { title: "Bible in a Year | Get Started" };

export default async function OnboardingPage() {
  const user = await requireSessionUser("/onboarding");

  if (getSettings(user.userId)) {
    redirect("/");
  }

  return (
    <main>
      <div className="card">
        <p className="eyebrow">Welcome, {user.displayName}</p>
        <h1>Set up your reading plan</h1>
        <p>
          Sunday through Saturday each carry a fixed section of Scripture (Epistles, The Law,
          History, Psalms, Poetry, Prophecy, Gospels) that advances one chunk further every week.
          Pick the date your Day 1 begins and which translation you would like to read.
        </p>
        <OnboardingForm />
      </div>
    </main>
  );
}
