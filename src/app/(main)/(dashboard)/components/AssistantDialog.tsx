"use client";

import { Settings2, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";
import { AssistantVoicePanel } from "@/app/components/assistant/AssistantVoicePanel";
import { AssistantWidget } from "@/app/components/assistant/AssistantWidget";
import { VoiceButton } from "@/app/components/assistant/VoiceButton";
import { VoiceSettings } from "@/app/components/assistant/VoiceSettings";
import { Modal } from "@/app/components/ui/Modal";
import { Tooltip } from "@/app/components/ui/Tooltip";
import { cn } from "@/lib/cn";
import type { AssistantDialogProps } from "../types";

const headerButton =
  "grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground";

export function AssistantDialog({ open, onClose, chat, suggestions }: AssistantDialogProps) {
  const { recognition, speech } = chat;
  const [showSettings, setShowSettings] = useState(false);

  const close = () => {
    chat.stopAll();
    onClose();
  };

  const toggleListening = () => {
    if (recognition.listening) chat.stopListening();
    else chat.startListening();
  };

  return (
    <Modal open={open} onClose={close} size="lg" showCloseButton={false} aria-labelledby="assistant-dialog-title">
      <h2 id="assistant-dialog-title" className="sr-only">
        Proxy AI Assistant
      </h2>
      <AssistantWidget
        messages={chat.messages}
        onSendMessage={(content) => chat.sendMessage(content)}
        loading={chat.isResponding}
        suggestions={suggestions}
        subtitle="مساعدك للمهام بالمصري"
        placeholder="اكتب سؤالك أو دوس على المايك واتكلم…"
        welcomeTitle="أهلاً! أقدر أساعدك إزاي؟"
        welcomeMessage="اسألني عن مهامك، أو قولّي أضيف أو أخلّص أو أأجّل أو أمسح مهمة، أو أفكرك بحاجة. تقدر تكتب أو تتكلم بالمصري."
        listening={recognition.listening}
        liveTranscript={recognition.interim}
        listeningPlaceholder="بسمعك…"
        notice={
          <div className="flex flex-col gap-2 empty:hidden">
            {showSettings && <VoiceSettings speech={speech} onClose={() => setShowSettings(false)} />}
            <AssistantVoicePanel assistant={chat} />
          </div>
        }
        className="h-[min(36rem,calc(100dvh-6rem))]! min-h-0!"
        inputAction={
          <VoiceButton
            size="sm"
            state={chat.voiceState}
            onClick={toggleListening}
            label={recognition.listening ? "وقف الاستماع" : "اتكلم مع Proxy"}
          />
        }
        headerAction={
          <div className="flex items-center gap-1">
            <Tooltip
              placement="bottom"
              content={
                chat.mode === "ai"
                  ? "الردود جاية من Gemini عن طريق الـ backend."
                  : "وضع محلي بقواعد بسيطة. ضيف GEMINI_API_KEY في backend/.env وشغّل الـ backend تاني عشان تفعّل Gemini."
              }
            >
              <span
                tabIndex={0}
                dir="auto"
                className={cn(
                  "me-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold",
                  chat.mode === "ai"
                    ? "border-primary/40 bg-primary/15 text-primary-soft"
                    : "border-warning/40 bg-warning/10 text-warning",
                )}
              >
                {chat.mode === "ai" ? "Gemini" : "محلي"}
              </span>
            </Tooltip>
            {speech.supported && (
              <button
                type="button"
                onClick={() => setShowSettings((value) => !value)}
                aria-pressed={showSettings}
                aria-label="إعدادات الصوت"
                className={headerButton}
              >
                <Settings2 size={18} aria-hidden="true" />
              </button>
            )}
            {speech.supported && (
              <button
                type="button"
                onClick={speech.toggleMuted}
                aria-pressed={speech.muted}
                aria-label={speech.muted ? "شغّل صوت الردود" : "اكتم صوت الردود"}
                className={headerButton}
              >
                {speech.muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
              </button>
            )}
            <button type="button" onClick={close} aria-label="Close assistant" className={headerButton}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        }
      />
    </Modal>
  );
}
