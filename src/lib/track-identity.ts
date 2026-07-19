import type { CSSProperties } from "react";
import type { ReadingTrack } from "@/data/reading-plan";

export type TrackShape = "circle" | "square" | "diamond" | "triangle" | "hexagon" | "ring" | "squircle";

export const TRACK_IDENTITY: Record<ReadingTrack, { color: string; shape: TrackShape }> = {
  Epistles: { color: "#B15C43", shape: "circle" },
  "The Law": { color: "#8C7A34", shape: "square" },
  History: { color: "#B98A3E", shape: "diamond" },
  Psalms: { color: "#3E7B76", shape: "triangle" },
  Poetry: { color: "#8C5183", shape: "hexagon" },
  Prophecy: { color: "#4F6690", shape: "ring" },
  Gospels: { color: "#3E7A4E", shape: "squircle" },
};

// Recipes ported from the design handoff's shapeStyle() — pure CSS, no icon assets.
export function trackIconStyle(track: ReadingTrack, size: number): CSSProperties {
  const { color, shape } = TRACK_IDENTITY[track];
  const base: CSSProperties = { width: size, height: size, background: color, flexShrink: 0, display: "inline-block" };

  switch (shape) {
    case "square":
      return { ...base, borderRadius: Math.round(size * 0.22) };
    case "diamond": {
      const inner = Math.round(size * 0.8);
      return {
        width: inner,
        height: inner,
        background: color,
        margin: Math.round(size * 0.1),
        borderRadius: 3,
        transform: "rotate(45deg)",
        flexShrink: 0,
      };
    }
    case "triangle":
      return {
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        flexShrink: 0,
      };
    case "hexagon":
      return { ...base, clipPath: "polygon(25% 4%,75% 4%,100% 50%,75% 96%,25% 96%,0% 50%)" };
    case "ring":
      return {
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${Math.max(2, Math.round(size * 0.22))}px solid ${color}`,
        boxSizing: "border-box",
        flexShrink: 0,
      };
    case "squircle":
      return { ...base, borderRadius: Math.round(size * 0.32) };
    default:
      return { ...base, borderRadius: "50%" };
  }
}
