import { Mic, MicOff, Square } from "lucide-react";
import { Spinner } from "@/app/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { VoiceState, VoiceButtonSize, VoiceButtonProps } from "./types";

const sizeClasses: Record<VoiceButtonSize, { button: string; icon: number }> = {
  sm: { button: "size-9", icon: 16 },
  md: { button: "size-11", icon: 20 },
  lg: { button: "size-16", icon: 26 },
};

const defaultLabels: Record<VoiceState, string> = {
  idle: "Start voice input",
  listening: "Stop listening",
  processing: "Processing voice input",
  disabled: "Voice input unavailable",
};

const stateCaptions: Record<VoiceState, string> = {
  idle: "Tap to speak",
  listening: "Listening…",
  processing: "Processing…",
  disabled: "Unavailable",
};

export function VoiceButton({
  state = "idle",
  onClick,
  size = "md",
  label,
  showLabel = false,
  className,
}: VoiceButtonProps) {
  const styles = sizeClasses[size];
  const isDisabled = state === "disabled";
  const isListening = state === "listening";
  const isProcessing = state === "processing";

  return (
    <span className={cn("inline-flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={label ?? defaultLabels[state]}
        aria-pressed={isListening}
        aria-busy={isProcessing || undefined}
        className={cn(
          "relative grid shrink-0 place-items-center rounded-full text-white transition-[background-color,box-shadow,scale] duration-200",
          "not-disabled:hover:scale-105 not-disabled:active:scale-95",
          "disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted/60",
          isListening
            ? "bg-linear-to-br from-secondary to-primary shadow-glow-blue"
            : "bg-linear-to-br from-primary to-primary-end shadow-glow",
          isProcessing && "cursor-wait",
          styles.button,
        )}
      >
        {isListening && (
          <>
            <span aria-hidden="true" className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary/50" />
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary/40"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}
        <span className="relative">
          {isProcessing ? (
            <Spinner size={styles.icon} label="" />
          ) : isListening ? (
            <Square size={styles.icon * 0.7} fill="currentColor" aria-hidden="true" />
          ) : isDisabled ? (
            <MicOff size={styles.icon} aria-hidden="true" />
          ) : (
            <Mic size={styles.icon} aria-hidden="true" />
          )}
        </span>
      </button>
      {showLabel && (
        <span className={cn("text-xs font-medium", isListening ? "text-secondary" : "text-muted")} aria-live="polite">
          {stateCaptions[state]}
        </span>
      )}
    </span>
  );
}
