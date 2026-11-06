"use client";

import { Play, Sparkles, X } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { useCurrentUser } from "@/app/(main)/profile/hooks/useCurrentUser";
import { Button } from "@/app/components/ui/Button";
import { useNow } from "@/hooks/useNow";
import { briefingSpeech, toISODay } from "./engine";
import { useDailyBriefing } from "./hooks/useDailyBriefing";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import type { DailyBriefingResult } from "./types";

const SHOWN_KEY = "proxy.briefing.shown";
const SPOKEN_KEY = "proxy.briefing.spoken";

function readDay(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeDay(key: string, day: string) {
  try {
    window.localStorage.setItem(key, day);
  } catch {}
}

export function DailyBriefing() {
  const now = useNow();
  const { isPending: profilePending } = useCurrentUser();
  const ready = !profilePending;
  const { loadBriefing } = useDailyBriefing();
  const { speak } = useSpeechSynthesis();
  const [briefing, setBriefing] = useState<DailyBriefingResult | null>(null);
  const today = now ? toISODay(now) : null;

  const start = useEffectEvent((day: string) => {
    writeDay(SHOWN_KEY, day);
    void loadBriefing().then(setBriefing);
  });

  useEffect(() => {
    if (!today || !ready || readDay(SHOWN_KEY) === today) return;
    start(today);
  }, [today, ready]);

  const play = () => {
    if (!briefing || !today) return;
    writeDay(SPOKEN_KEY, today);
    speak(briefingSpeech(briefing.title, briefing.message));
  };

  const playOnGesture = useEffectEvent(play);

  useEffect(() => {
    if (!briefing || !today || readDay(SPOKEN_KEY) === today) return;
    const onGesture = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("[data-daily-briefing]")) return;
      cleanup();
      playOnGesture();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return cleanup;
  }, [briefing, today]);

  if (!briefing) return null;

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="ملخص يومك"
      data-daily-briefing
      dir="rtl"
      className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md animate-slide-up rounded-card border border-primary/30 bg-elevated/95 p-4 shadow-popover backdrop-blur-xl md:inset-x-auto md:right-6 md:bottom-6 md:mx-0"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-secondary text-white">
          <Sparkles size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">{briefing.title}</h2>
          <p dir="auto" className="mt-1 text-sm leading-relaxed text-muted">
            {briefing.message}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" leftIcon={<Play size={14} aria-hidden="true" />} onClick={play}>
              اسمعني
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setBriefing(null)}>
              تمام
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setBriefing(null)}
          aria-label="قفل الملخص"
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-elevated-hover hover:text-foreground"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
