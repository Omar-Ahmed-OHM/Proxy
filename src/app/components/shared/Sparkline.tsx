import { cn } from "@/lib/cn";
import type { SparklineProps } from "./types";

function buildPath(points: ReadonlyArray<[number, number]>): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  let path = `M ${first[0]} ${first[1]}`;
  rest.forEach((point, index) => {
    const previous = points[index];
    const beforePrevious = points[index - 1] ?? previous;
    const next = points[index + 2] ?? point;
    const control1: [number, number] = [
      previous[0] + (point[0] - beforePrevious[0]) / 6,
      previous[1] + (point[1] - beforePrevious[1]) / 6,
    ];
    const control2: [number, number] = [
      point[0] - (next[0] - previous[0]) / 6,
      point[1] - (next[1] - previous[1]) / 6,
    ];
    path += ` C ${control1[0]} ${control1[1]}, ${control2[0]} ${control2[1]}, ${point[0]} ${point[1]}`;
  });
  return path;
}

export function Sparkline({ data, width = 96, height = 36, strokeWidth = 2.5, className }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = strokeWidth * 2;
  const points = data.map<[number, number]>((value, index) => [
    padding + (index / (data.length - 1)) * (width - padding * 2),
    padding + (1 - (value - min) / range) * (height - padding * 2),
  ]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      className={cn("overflow-visible drop-shadow-[0_0_6px_currentColor]", className)}
    >
      <path
        d={buildPath(points)}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
