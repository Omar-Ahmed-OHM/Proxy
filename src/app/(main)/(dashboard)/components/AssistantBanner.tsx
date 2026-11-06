"use client";

import { AudioLines, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAssistant } from "@/app/components/assistant/hooks/useAssistant";
import { VoiceButton } from "@/app/components/assistant/VoiceButton";
import { VoiceVisualizer } from "@/app/components/assistant/VoiceVisualizer";
import { AssistantDialog } from "./AssistantDialog";

const suggestions = [
  "عندي إيه النهارده؟",
  "ضيفلي مهمة الشغل على البروجكت بكره الساعة 6",
  "وريني المهام المتأخرة",
];

export function AssistantBanner() {
  const [open, setOpen] = useState(false);
  const assistant = useAssistant();

  const ask = (prompt: string) => {
    setOpen(true);
    assistant.sendMessage(prompt);
  };

  const talk = () => {
    setOpen(true);
    assistant.startListening();
  };

  return (
    <>
      <section
        aria-labelledby="assistant-banner-title"
        className="relative overflow-hidden rounded-card bg-linear-to-r from-primary/80 via-secondary/70 to-primary/80 p-px shadow-glow"
      >
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-[calc(var(--radius-card)-1px)] bg-linear-to-r from-[#0c1442] via-surface to-[#1a0f4d] px-5 py-6 sm:flex-row sm:items-center sm:px-6 lg:gap-8 lg:py-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-secondary/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-28 size-80 rounded-full bg-primary/30 blur-3xl"
          />

          <div aria-hidden="true" className="relative hidden shrink-0 sm:block">
            <div className="absolute inset-0 rounded-full bg-secondary/40 blur-2xl motion-safe:animate-pulse" />
            <div className="relative grid size-24 place-items-center rounded-full border border-white/15 bg-linear-to-br from-secondary/80 via-primary/70 to-primary-end shadow-glow-blue lg:size-28">
              <Bot size={52} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgb(40_215_232/0.8)]" />
              <Sparkles size={18} className="absolute top-3 right-3 text-accent" />
            </div>
          </div>

          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <AudioLines size={20} aria-hidden="true" className="text-primary-soft" />
              <p className="text-base font-semibold text-foreground">Proxy AI Assistant</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
                Online
              </span>
            </div>
            <h2 id="assistant-banner-title" dir="auto" className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
              أقدر أساعدك في إيه النهارده؟
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Suggested questions">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    dir="auto"
                    onClick={() => ask(suggestion)}
                    className="rounded-xl border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-medium text-foreground/90 backdrop-blur transition-colors hover:border-primary-soft/50 hover:bg-primary/20 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden="true" className="relative hidden opacity-80 xl:block">
            <VoiceVisualizer state="speaking" size="lg" bars={20} />
          </div>

          <div className="relative flex shrink-0 flex-col items-center gap-2">
            <div className="rounded-full p-2 ring-1 ring-primary/30 shadow-[0_0_40px_-6px_rgb(116_43_255/0.8)]">
              <VoiceButton size="lg" label="دوس واتكلم مع Proxy" onClick={talk} />
            </div>
            <span aria-hidden="true" className="text-xs font-medium text-muted">
              دوس واتكلم
            </span>
          </div>
        </div>
      </section>

      <AssistantDialog open={open} onClose={() => setOpen(false)} chat={assistant} suggestions={suggestions} />
    </>
  );
}
