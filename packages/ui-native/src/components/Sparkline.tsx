import { nav } from "@treasury/data";
import Svg, { Circle, Polygon, Polyline } from "react-native-svg";

export function Sparkline({ height = 64 }: { height?: number }) {
  const points = nav.sparkline
    .map((y, i) => `${(i * 320) / (nav.sparkline.length - 1)},${y}`)
    .join(" ");
  const last = nav.sparkline[nav.sparkline.length - 1] ?? 0;

  return (
    <Svg viewBox="0 0 320 72" style={{ width: "100%", height }} preserveAspectRatio="none">
      <Polygon points={`0,72 ${points} 320,72`} fill="#2b2741" />
      <Polyline points={points} fill="none" stroke="#9184d9" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <Circle cx={320} cy={last} r={2.6} fill="#9184d9" />
    </Svg>
  );
}
