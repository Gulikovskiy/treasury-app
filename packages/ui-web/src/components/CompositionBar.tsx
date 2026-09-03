import type { CSSProperties } from "react";

export interface CompositionSegment {
  share: number;
  color: string;
}

/** The Safe's asset mix as a segmented strip — same palette used on mobile. */
export const COMPOSITION: CompositionSegment[] = [
  { share: 28, color: "#9184d9" },
  { share: 27.1, color: "#796cbf" },
  { share: 5.3, color: "#5d5294" },
  { share: 18.7, color: "#75798c" },
  { share: 13.2, color: "#595d6c" },
  { share: 7.6, color: "#3f424d" },
];

export function CompositionBar({ height = 7, style }: { height?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", height, borderRadius: 4, overflow: "hidden", gap: 1, ...style }}>
      {COMPOSITION.map((seg, i) => (
        <div key={i} style={{ width: `${seg.share}%`, background: seg.color }} />
      ))}
    </div>
  );
}
