import { Bell, CalendarCheck, ListChecks, Sparkles } from "lucide-react";
import { Brand } from "@/app/components/layout/Brand";
import type { AuthHighlight, AuthLayoutProps } from "./types";

const highlights: ReadonlyArray<AuthHighlight> = [
  { title: "Tasks that stay on track", description: "Prioritize, schedule and finish what matters.", icon: ListChecks },
  { title: "Reminders in your timezone", description: "Get nudged at the right moment, every time.", icon: Bell },
  { title: "A plan for every day", description: "Turn your task list into a focused daily plan.", icon: CalendarCheck },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh overflow-hidden">
      <aside className="relative hidden w-[46%] max-w-[44rem] flex-col justify-between overflow-hidden border-r border-border bg-surface/60 p-10 lg:flex xl:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 size-[30rem] rounded-full bg-primary/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 size-[26rem] rounded-full bg-secondary/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/3 size-56 rounded-full bg-accent/10 blur-3xl" />

        <Brand className="relative self-start" />

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-soft">
            <Sparkles size={14} aria-hidden="true" />
            Your AI productivity copilot
          </span>
          <h2 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-foreground xl:text-5xl">
            Plan less.{" "}
            <span className="bg-linear-to-r from-primary-soft via-primary to-secondary bg-clip-text text-transparent">
              Do more.
            </span>
          </h2>
          <p className="mt-4 text-base text-muted">
            Proxy keeps your tasks, reminders and daily plans in one calm place, with an assistant that helps you
            stay on track.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {highlights.map(({ title, description, icon: Icon }) => (
              <li
                key={title}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-secondary text-white shadow-glow">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{title}</span>
                  <span className="block text-sm text-muted">{description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-muted/70">Small steps make a big difference.</p>
      </aside>

      <main id="main-content" className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-0 size-80 rounded-full bg-primary/20 blur-3xl lg:hidden" />
        <Brand className="relative mb-8 lg:hidden" />
        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
