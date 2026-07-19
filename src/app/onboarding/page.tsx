import { requireSessionUser } from "@/lib/session";
import { getSettings } from "@/lib/reading-progress";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { TrackIcon } from "@/components/TrackIcon";
import { TRACK_ORDER } from "@/data/reading-plan";

export const metadata = { title: "Bible in a Year | Get Started" };

export default async function OnboardingPage() {
  const user = await requireSessionUser("/onboarding");

  if (getSettings(user.userId)) {
    redirect("/");
  }

  return (
    <main>
      <div className="app-mark">
        <span />
        <span />
        <span />
      </div>
      <p className="eyebrow">Welcome</p>
      <h1>Set up your reading plan</h1>
      <p style={{ marginTop: 12, marginBottom: 22 }}>
        Welcome, {user.displayName}. Sunday through Saturday each carry a fixed section of
        Scripture (Epistles, The Law, History, Psalms, Poetry, Prophecy, Gospels) that advances
        one chunk further every week. Pick the date your Day 1 begins and which translation you
        would like to read.
      </p>

      <div className="track-chip-row">
        {TRACK_ORDER.map((track) => (
          <div className="track-chip" key={track}>
            <TrackIcon track={track} size={16} />
            <span>{track}</span>
          </div>
        ))}
      </div>

      <OnboardingForm />
    </main>
  );
}
