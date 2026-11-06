import { Rocket, Sparkles } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { cn } from "@/lib/cn";
import type { PromoCardProps } from "./types";

export function PromoCard({ className }: PromoCardProps) {
  return (
    <section
      aria-labelledby="promo-card-title"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-b from-primary/20 via-card to-card px-4 pt-5 pb-4 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 size-32 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="relative mx-auto grid size-14 -rotate-12 place-items-center rounded-2xl bg-linear-to-br from-primary-soft via-primary to-secondary text-white shadow-glow"
      >
        <Rocket size={28} />
      </span>
      <h2 id="promo-card-title" className="relative mt-4 text-base font-bold text-foreground">
        Stay Productive!
      </h2>
      <p className="relative mt-1 text-sm text-muted">Small steps make a big difference.</p>
      <ButtonLink
        href="/settings"
        size="sm"
        fullWidth
        rightIcon={<Sparkles size={16} aria-hidden="true" />}
        className="relative mt-4"
      >
        Upgrade to Pro
      </ButtonLink>
    </section>
  );
}
