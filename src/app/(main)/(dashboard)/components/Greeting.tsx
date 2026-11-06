"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "@/app/(main)/profile/hooks/useCurrentUser";
import { briefingSpeech } from "@/app/components/assistant/engine";
import { useDailyBriefing } from "@/app/components/assistant/hooks/useDailyBriefing";
import { useSpeechSynthesis } from "@/app/components/assistant/hooks/useSpeechSynthesis";
import { Button } from "@/app/components/ui/Button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";

function getGreeting(now: Date | null): string {
  if (!now) return "Welcome back";
  const hour = now.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function Greeting() {
  const now = useNow();
  const { data, isPending: queryPending } = useCurrentUser();
  const hydrated = now !== null;
  const user = hydrated ? data : undefined;
  const isPending = !hydrated || queryPending;
  const firstName = user?.name.trim().split(/\s+/)[0];
  const { loadBriefing } = useDailyBriefing();
  const { speak, speaking } = useSpeechSynthesis();
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const playBriefing = () => {
    setLoadingBriefing(true);
    loadBriefing()
      .then((briefing) => speak(briefingSpeech(briefing.title, briefing.message)))
      .finally(() => setLoadingBriefing(false));
  };

  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {getGreeting(now)}
        {firstName ? (
          <>
            ,{" "}
            <span className="bg-linear-to-r from-primary-soft via-primary to-primary-soft bg-clip-text text-transparent">
              {firstName}!
            </span>
          </>
        ) : isPending ? (
          <Skeleton variant="custom" className="ml-3 inline-block h-9 w-32 rounded-lg align-middle" />
        ) : (
          "!"
        )}{" "}
        <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-2 text-base text-muted sm:text-lg">Let&apos;s make today productive and amazing.</p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        loading={loadingBriefing}
        disabled={speaking}
        leftIcon={<Volume2 size={16} aria-hidden="true" />}
        onClick={playBriefing}
      >
        اسمع ملخص يومك
      </Button>
    </div>
  );
}
