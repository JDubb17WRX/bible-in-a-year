import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/session";
import { getSettings, getCompletedDays } from "@/lib/reading-progress";
import { dateForDayNumber } from "@/lib/day-math";
import { READING_PLAN } from "@/data/reading-plan";
import { DayCheckbox } from "@/components/DayCheckbox";

export const metadata = { title: "Bible in a Year | Calendar" };

export default async function CalendarPage() {
  const user = await requireSessionUser("/calendar");
  const settings = getSettings(user.userId);

  if (!settings) {
    redirect("/onboarding");
  }

  const completedDays = getCompletedDays(user.userId);
  const weeks = new Map<number, typeof READING_PLAN>();

  for (const entry of READING_PLAN) {
    const list = weeks.get(entry.week) || [];
    list.push(entry);
    weeks.set(entry.week, list);
  }

  return (
    <main>
      <div className="card">
        <Link href="/">&larr; Back to today</Link>
        <h1>Full Calendar</h1>
        <p>{completedDays.size} of {READING_PLAN.length} days read.</p>
      </div>

      {[...weeks.entries()].map(([week, entries]) => (
        <div className="card" key={week}>
          <h2>Week {week}</h2>
          {entries.map((entry) => {
            const iso = dateForDayNumber(settings.startDate, entry.dayNumber);
            const complete = completedDays.has(entry.dayNumber);
            return (
              <div className={`day-row${complete ? " complete" : ""}`} key={entry.dayNumber}>
                <DayCheckbox day={entry.dayNumber} initialComplete={complete} label="" />
                <Link href={`/?day=${entry.dayNumber}`} style={{ flex: 1 }}>
                  <strong>{entry.track}</strong> &mdash; {entry.reference}
                </Link>
                <span className="passage-track">{iso}</span>
              </div>
            );
          })}
        </div>
      ))}
    </main>
  );
}
