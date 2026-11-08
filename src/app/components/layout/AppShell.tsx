import { InstallAppButton } from "@/app/components/pwa/InstallAppButton";
import { AccountMenu } from "./AccountMenu";
import { Brand } from "./Brand";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderSearch } from "./HeaderSearch";
import { PrimaryNav } from "./PrimaryNav";
import { PromoCard } from "./PromoCard";
import type { AppShellProps } from "./types";

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col gap-8 overflow-y-auto border-r border-border bg-surface/70 px-3 py-7 backdrop-blur-xl md:flex lg:w-68 lg:px-5">
        <Brand collapsible className="md:justify-center lg:justify-start lg:px-2" />
        <PrimaryNav layout="sidebar" />
        <PromoCard className="hidden lg:block" />
        <AccountMenu variant="sidebar" className="mt-auto" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-canvas/80 backdrop-blur-xl md:border-transparent md:bg-transparent md:backdrop-blur-none">
          <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 md:h-20 lg:px-10">
            <Brand className="md:hidden" />
            <HeaderSearch className="hidden max-w-xl flex-1 md:block" />
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <InstallAppButton />
              <HeaderNotifications />
              <AccountMenu variant="header" />
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-4 pb-28 sm:px-6 md:pb-10 lg:px-10"
        >
          {children}
        </main>
      </div>

      <PrimaryNav
        layout="bar"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      />
    </div>
  );
}
