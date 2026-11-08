import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Brand } from "@/app/components/layout/Brand";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-5 text-center">
        <Brand />
        <span className="grid size-16 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary-soft">
          <WifiOff size={28} aria-hidden="true" />
        </span>
        <div dir="rtl">
          <h1 className="text-xl font-semibold text-foreground">مفيش إنترنت دلوقتي</h1>
          <p className="mt-2 text-sm text-muted">
            أول ما النت يرجع، افتح الصفحة تاني وهتلاقي مهامك وتذكيراتك زي ما هي.
          </p>
        </div>
      </div>
    </main>
  );
}
