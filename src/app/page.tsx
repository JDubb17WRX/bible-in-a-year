import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/session";
import { getSettings, getCompletedDays, isDayComplete } from "@/lib/reading-progress";
import { getPassageForDay } from "@/lib/get-passage";
import { getCurrentDayNumber, dateForDayNumber, formatDisplayDate } from "@/lib/day-math";
import { TOTAL_DAYS } from "@/data/reading-plan";
import { DayCheckbox } from "@/components/DayCheckbox";

export const metadata = { title: "Bible in a Year" };

function clampDay(day: number): number {
  return Math.min(Math.max(day, 1), TOTAL_DAYS);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const user = await requireSessionUser("/");
  const settings = getSettings(user.userId);

  if (!settings) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const currentDayNumber = getCurrentDayNumber(settings.startDate);
  const requestedDay = params.day ? clampDay(Number(params.day) || currentDayNumber) : currentDayNumber;
  const isViewingToday = requestedDay === currentDayNumber;

  const completedDays = getCompletedDays(user.userId);
  const displayDate = formatDisplayDate(dateForDayNumber(settings.startDate, requestedDay));

  let passageError: string | null = null;
  let passage: Awaited<ReturnType<typeof getPassageForDay>> = null;

  try {
    passage = await getPassageForDay(requestedDay, settings.translation);
  } catch (error) {
    passageError = error instanceof Error ? error.message : "Could not load today's passage.";
  }

  const complete = isDayComplete(user.userId, requestedDay);
  const progressPercent = Math.round((completedDays.size / TOTAL_DAYS) * 100);

  return (
    <main>
      <div className="card">
        <p className="eyebrow">
          {isViewingToday ? "Today" : "Catching up"} &middot; Day {requestedDay} of {TOTAL_DAYS}
        </p>
        <h1>{displayDate}</h1>

        <div className="progress-bar">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="passage-track">
          {completedDays.size} of {TOTAL_DAYS} days read ({progressPercent}%)
        </p>

        <nav style={{ display: "flex", gap: 16, margin: "12px 0" }}>
          <Link href={`/?day=${clampDay(requestedDay - 1)}`}>&larr; Previous day</Link>
          {!isViewingToday ? <Link href="/">Back to today</Link> : null}
          <Link href={`/?day=${clampDay(requestedDay + 1)}`}>Next day &rarr;</Link>
        </nav>
      </div>

      <div className="card">
        {passageError ? (
          <p style={{ color: "#b3372f" }}>{passageError}</p>
        ) : passage ? (
          <>
            <p className="passage-track">{passage.track}</p>
            <h2>{passage.reference}</h2>
            <p className="passage-text">{passage.content}</p>
            <p className="attribution">{passage.attribution}</p>
          </>
        ) : (
          <p>No reading found for this day.</p>
        )}

        <div style={{ marginTop: 16 }}>
          <DayCheckbox day={requestedDay} initialComplete={complete} />
        </div>
      </div>

      <nav style={{ display: "flex", gap: 16 }}>
        <Link href="/calendar">Full calendar</Link>
        <Link href="/settings">Settings</Link>
      </nav>
    </main>
  );
}
