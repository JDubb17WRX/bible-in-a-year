import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/session";
import { getSettings, getCompletedDays } from "@/lib/reading-progress";
import { getCurrentDayNumber } from "@/lib/day-math";
import { READING_PLAN, type ReadingEntry } from "@/data/reading-plan";
import { TrackIcon } from "@/components/TrackIcon";
import { TabBar } from "@/components/TabBar";

export const metadata = { title: "Bible in a Year | Calendar" };

type Segment =
  | { type: "summary"; startWeek: number; endWeek: number; doneCount: number; totalCount: number }
  | { type: "week"; week: number; entries: ReadingEntry[] };

export default async function CalendarPage() {
  const user = await requireSessionUser("/calendar");
  const settings = getSettings(user.userId);

  if (!settings) {
    redirect("/onboarding");
  }

  const completedDays = getCompletedDays(user.userId);
  const currentDayNumber = getCurrentDayNumber(settings.startDate);

  const weekMap = new Map<number, ReadingEntry[]>();
  for (const entry of READING_PLAN) {
    const list = weekMap.get(entry.week) || [];
    list.push(entry);
    weekMap.set(entry.week, list);
  }
  const weeks = [...weekMap.entries()]
    .map(([week, entries]) => ({ week, entries }))
    .sort((a, b) => a.week - b.week);

  const segments: Segment[] = [];
  let pending: { startWeek: number; endWeek: number; doneCount: number; totalCount: number } | null = null;

  for (const { week, entries } of weeks) {
    const doneCount = entries.filter((e) => completedDays.has(e.dayNumber)).length;
    const isComplete = doneCount === entries.length;

    if (isComplete) {
      if (pending) {
        pending.endWeek = week;
        pending.doneCount += doneCount;
        pending.totalCount += entries.length;
      } else {
        pending = { startWeek: week, endWeek: week, doneCount, totalCount: entries.length };
      }
    } else {
      if (pending) {
        segments.push({ type: "summary", ...pending });
        pending = null;
      }
      segments.push({ type: "week", week, entries });
    }
  }
  if (pending) {
    segments.push({ type: "summary", ...pending });
  }

  return (
    <main>
      <h1>Calendar</h1>
      <p className="muted" style={{ fontSize: "0.8rem", marginBottom: 16 }}>
        {completedDays.size} of {READING_PLAN.length} days read
      </p>

      {segments.map((segment) =>
        segment.type === "summary" ? (
          <div className="week-summary-row" key={`summary-${segment.startWeek}`}>
            <span>{segment.startWeek === segment.endWeek ? `Week ${segment.startWeek}` : `Weeks ${segment.startWeek}–${segment.endWeek}`}</span>
            <span>
              {segment.doneCount} / {segment.totalCount} read
            </span>
          </div>
        ) : (
          <div className="week-card" key={`week-${segment.week}`}>
            <div className="week-card-header">
              <strong>Week {segment.week}</strong>
              <span>{segment.entries.filter((e) => completedDays.has(e.dayNumber)).length} / 7</span>
            </div>
            <div className="week-days">
              {segment.entries.map((entry) => (
                <Link className="day-chip" href={`/?day=${entry.dayNumber}`} key={entry.dayNumber}>
                  <TrackIcon
                    track={entry.track}
                    size={16}
                    incomplete={!completedDays.has(entry.dayNumber)}
                    isToday={entry.dayNumber === currentDayNumber}
                  />
                  <span>{entry.dayNumber}</span>
                </Link>
              ))}
            </div>
          </div>
        ),
      )}

      <TabBar />
    </main>
  );
}
