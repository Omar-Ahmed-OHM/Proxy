  "use client";

import { Play, X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Select } from "@/app/components/ui/Select";
import type { SelectOption } from "@/app/components/ui/types";
import type { VoiceSettingsProps } from "./types";

const rateOptions: ReadonlyArray<SelectOption> = [
  { label: "أبطأ", value: "0.85" },
  { label: "عادي", value: "1" },
  { label: "أسرع", value: "1.15" },
  { label: "سريع", value: "1.3" },
];

export function VoiceSettings({ speech, onClose }: VoiceSettingsProps) {
  const voiceOptions: ReadonlyArray<SelectOption> = speech.voices.map((voice) => ({
    label: `${voice.name}${voice.natural ? " ★" : ""} (${voice.lang})`,
    value: voice.uri,
  }));

  return (
    <section
      dir="rtl"
      aria-label="إعدادات الصوت"
      className="rounded-xl border border-border-strong bg-surface p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">صوت المساعد</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="قفل إعدادات الصوت"
          className="grid size-7 place-items-center rounded-md text-muted hover:bg-elevated-hover hover:text-foreground"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {voiceOptions.length === 0 ? (
        <p className="text-sm text-muted">
          مفيش أصوات عربي متسطّبة على الجهاز ده. جرّب Microsoft Edge، فيه أصوات مصري طبيعية زي سلمى وشاكر.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
          <Select
            label="الصوت"
            size="sm"
            searchable={voiceOptions.length > 6}
            options={voiceOptions}
            value={speech.voiceURI}
            onChange={(uri) => {
              if (!uri) return;
              speech.setVoice(uri);
              speech.preview(uri);
            }}
          />
          <Select
            label="السرعة"
            size="sm"
            options={rateOptions}
            value={String(speech.rate)}
            onChange={(value) => value && speech.setRate(Number(value))}
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Play size={14} aria-hidden="true" />}
            onClick={() => speech.preview()}
          >
            جرّب
          </Button>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">★ صوت طبيعي بجودة أعلى. أحسن أصوات مصري موجودة في Edge.</p>
    </section>
  );
}
