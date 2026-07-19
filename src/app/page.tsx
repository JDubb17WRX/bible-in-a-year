import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/session";
import { getSettings, getCompletedDays, isDayComplete, computeStreaks } from "@/lib/reading-progress";
import { getPassageForDay } from "@/lib/get-passage";
import { getCurrentDayNumber, dateForDayNumber, formatDisplayDate } from "@/lib/day-math";
import { TOTAL_DAYS, getReadingForDay } from "@/data/reading-plan";
import { DayCheckbox } from "@/components/DayCheckbox";
import { TrackIcon } from "@/components/TrackIcon";
import { TabBar } from "@/components/TabBar";
import { DailyReminderChecker } from "@/components/DailyReminderChecker";

export const metadata = { title: "Bible in a Year" };

function clampDay(day: number): number {
  return Math.min(Math.max(day, 1), TOTAL_DAYS);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
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
  const entry = getReadingForDay(requestedDay);
  const streaks = computeStreaks(completedDays, currentDayNumber);

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
      <div className="today-header">
        <div>
          {isViewingToday ? (
            <p className="header-label">{greeting()}</p>
          ) : (
            <p className="header-label">
              Catching up &middot; Day {requestedDay} of {TOTAL_DAYS}
            </p>
          )}
          <h1>{displayDate}</h1>
        </div>
        <div className="streak-pill">
          <span className="streak-flame" />
          <span>{streaks.current}</span>
        </div>
      </div>

      <div className="card progress-card">
        <div
          className="progress-ring"
          style={{ background: `conic-gradient(var(--accent) ${progressPercent}%, var(--ring-track) 0)` }}
        >
          <div className="progress-ring-inner">
            <strong>{currentDayNumber}</strong>
            <span>of {TOTAL_DAYS}</span>
          </div>
        </div>
        <div>
          <p className="progress-label">Overall progress</p>
          <p className="progress-pct">{progressPercent}% complete</p>
          <p className="progress-streak-line">
            {streaks.current}-day streak &middot; longest {streaks.longest}
          </p>
        </div>
      </div>

      {entry ? (
        <div className="current-track-row">
          <TrackIcon track={entry.track} size={22} />
          <strong>{entry.track}</strong>
          <span className="muted">&middot; Day {requestedDay}</span>
        </div>
      ) : null}

      <div className="card">
        {passageError ? (
          <p className="error-text">{passageError}</p>
        ) : passage ? (
          <>
            <h2>{passage.reference}</h2>
            <p className="passage-text">{passage.content}</p>
            <p className="attribution">{passage.attribution}</p>
          </>
        ) : (
          <p>No reading found for this day.</p>
        )}
      </div>

      <DayCheckbox day={requestedDay} initialComplete={complete} />

      {!isViewingToday ? (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link href="/" className="muted" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
            Back to today
          </Link>
        </div>
      ) : null}

      <nav className="day-nav">
        <Link href={`/?day=${clampDay(requestedDay - 1)}`}>
          &larr; {isViewingToday ? "Yesterday" : "Previous day"}
        </Link>
        <Link href={`/?day=${clampDay(requestedDay + 1)}`}>
          {isViewingToday ? "Tomorrow" : "Next day"} &rarr;
        </Link>
      </nav>

      <TabBar />
      {isViewingToday ? <DailyReminderChecker complete={complete} /> : null}
    </main>
  );
}
