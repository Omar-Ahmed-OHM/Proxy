import { cn } from "@/lib/cn";
import type { VoiceVisualizerState, VoiceVisualizerSize, VoiceVisualizerProps } from "./types";

const sizeClasses: Record<VoiceVisualizerSize, { container: string; bar: string; gap: string }> = {
  sm: { container: "h-6", bar: "w-1", gap: "gap-0.5" },
  md: { container: "h-10", bar: "w-1.5", gap: "gap-1" },
  lg: { container: "h-16", bar: "w-2", gap: "gap-1.5" },
};

const idleHeights = [0.35, 0.5, 0.4, 0.6, 0.45, 0.55, 0.35, 0.5, 0.4];

const stateLabels: Record<VoiceVisualizerState, string> = {
  idle: "Voice idle",
  listening: "Listening",
  speaking: "Assistant speaking",
  processing: "Processing",
};

export function VoiceVisualizer({ state = "idle", size = "md", bars = 7, className }: VoiceVisualizerProps) {
  const styles = sizeClasses[size];
  const count = Math.max(3, Math.min(bars, 24));
  const center = (count - 1) / 2;

  return (
    <div
      role="img"
      aria-label={stateLabels[state]}
      className={cn("inline-flex items-center justify-center", styles.container, styles.gap, className)}
    >
      {Array.from({ length: count }, (_, index) => {
        const distance = Math.abs(index - center) / Math.max(center, 1);
        const idleScale = idleHeights[index % idleHeights.length];

        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "h-full origin-center rounded-full transition-[transform,background-color,opacity] duration-300",
              styles.bar,
              state === "idle" && "bg-muted/40",
              state === "listening" && "animate-voice-fast bg-linear-to-t from-secondary to-accent",
              state === "speaking" && "animate-voice-slow bg-linear-to-t from-primary to-secondary",
              state === "processing" && "animate-voice-pulse bg-primary-soft",
            )}
            style={{
              transform: state === "idle" ? `scaleY(${idleScale})` : state === "processing" ? "scaleY(0.35)" : undefined,
              animationDelay:
                state === "processing"
                  ? `${index * 120}ms`
                  : state === "idle"
                    ? undefined
                    : `${Math.round((state === "listening" ? 90 : 160) * index + distance * 200)}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
