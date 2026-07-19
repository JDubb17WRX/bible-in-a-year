import type { ReadingTrack } from "@/data/reading-plan";
import { trackIconStyle } from "@/lib/track-identity";

type TrackIconProps = {
  track: ReadingTrack;
  size?: number;
  incomplete?: boolean;
  isToday?: boolean;
};

export function TrackIcon({ track, size = 16, incomplete = false, isToday = false }: TrackIconProps) {
  const style = trackIconStyle(track, size);

  if (incomplete) {
    style.opacity = 0.32;
  }
  if (isToday) {
    style.boxShadow = "0 0 0 2px var(--cta)";
  }

  return <div style={style} />;
}
