"use client";

import { CircleAlert, MicOff, Square, X } from "lucide-react";
import type { AssistantVoicePanelProps } from "./types";
import { VoiceVisualizer } from "./VoiceVisualizer";

const statusLabels = {
  listening: "بسمعك… اتكلم براحتك",
  speaking: "بيرد عليك…",
  processing: "بفكّر…",
} as const;

export function AssistantVoicePanel({ assistant }: AssistantVoicePanelProps) {
  const { recognition, speech, visualizerState } = assistant;

  if (recognition.error) {
    return (
      <div
        role="alert"
        dir="rtl"
        className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
      >
        <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        <p className="min-w-0 flex-1">{recognition.error}</p>
        <button
          type="button"
          onClick={recognition.clearError}
          aria-label="إخفاء الرسالة"
          className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-danger/15"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (visualizerState !== "idle") {
    const stopLabel = visualizerState === "listening" ? "خلاص" : visualizerState === "speaking" ? "اسكت" : null;
    return (
      <div
        dir="rtl"
        className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2"
        aria-live="polite"
      >
        <VoiceVisualizer state={visualizerState} size="sm" bars={9} />
        <p className="min-w-0 flex-1 truncate text-sm text-foreground">{statusLabels[visualizerState]}</p>
        {stopLabel && (
          <button
            type="button"
            onClick={visualizerState === "listening" ? recognition.stop : speech.cancel}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/50"
          >
            <Square size={10} fill="currentColor" aria-hidden="true" />
            {stopLabel}
          </button>
        )}
      </div>
    );
  }

  if (!recognition.supported) {
    return (
      <p dir="rtl" className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
        <MicOff size={14} aria-hidden="true" className="shrink-0" />
        المتصفح ده مش بيدعم الكلام بالصوت. استخدم Chrome أو Edge، أو اكتب سؤالك عادي.
      </p>
    );
  }

  return null;
}
