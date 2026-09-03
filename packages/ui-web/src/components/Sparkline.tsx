import { nav } from "@treasury/data";

/** NAV trend line, 12 points over the viewBox's 320×72 grid. */
export function Sparkline({ height = 64 }: { height?: number }) {
  const points = nav.sparkline
    .map((y, i) => `${(i * 320) / (nav.sparkline.length - 1)},${y}`)
    .join(" ");
  const last = nav.sparkline[nav.sparkline.length - 1] ?? 0;

  return (
    <svg
      viewBox="0 0 320 72"
      style={{ width: "100%", height, overflow: "visible" }}
      preserveAspectRatio="none"
    >
      <polygon points={`0,72 ${points} 320,72`} fill="#2b2741" />
      <polyline points={points} fill="none" stroke="#9184d9" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={320} cy={last} r={2.6} fill="#9184d9" />
    </svg>
  );
}
