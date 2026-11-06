import { CalendarDays, Globe, Mail } from "lucide-react";
import { Avatar } from "@/app/components/ui/Avatar";
import { DEFAULT_LOCALE } from "@/lib/date";
import type { ProfileSummaryProps } from "../types";

function formatMemberSince(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, { month: "long", year: "numeric" }).format(date);
}

export function ProfileSummary({ user }: ProfileSummaryProps) {
  const memberSince = formatMemberSince(user.createdAt);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/40 blur-2xl" />
        <Avatar name={user.name} size="xl" ring className="relative" />
      </div>
      <div className="min-w-0 max-w-full">
        <h2 className="truncate text-xl font-semibold text-foreground">{user.name}</h2>
        <p className="truncate text-sm text-muted">{user.email}</p>
      </div>
      <dl className="flex w-full flex-col gap-3 border-t border-border pt-5 text-left text-sm">
        <div className="flex items-center gap-3">
          <dt className="flex items-center gap-2 text-muted">
            <Mail size={16} aria-hidden="true" />
            <span className="sr-only">Email</span>
          </dt>
          <dd className="min-w-0 truncate text-foreground">{user.email}</dd>
        </div>
        <div className="flex items-center gap-3">
          <dt className="flex items-center gap-2 text-muted">
            <Globe size={16} aria-hidden="true" />
            <span className="sr-only">Timezone</span>
          </dt>
          <dd className="min-w-0 truncate text-foreground">{user.timezone.replaceAll("_", " ")}</dd>
        </div>
        {memberSince && (
          <div className="flex items-center gap-3">
            <dt className="flex items-center gap-2 text-muted">
              <CalendarDays size={16} aria-hidden="true" />
              <span className="sr-only">Member since</span>
            </dt>
            <dd className="text-foreground">Member since {memberSince}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
