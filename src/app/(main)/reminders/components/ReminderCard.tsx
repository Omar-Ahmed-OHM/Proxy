"use client";

import {
  Ban,
  BellRing,
  CalendarDays,
  Check,
  CircleCheck,
  CircleSlash,
  Clock,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { Tooltip } from "@/app/components/ui/Tooltip";
import type { BadgeVariant, DropdownItem } from "@/app/components/ui/types";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/cn";
import { DEFAULT_LOCALE } from "@/lib/date";
import { parseLocalDateTime } from "../utils";
import type { ReminderCardProps, ReminderStatus } from "../types";

const statusBadges: Record<ReminderStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Scheduled", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "default" },
};

const statusIcons = {
  pending: BellRing,
  completed: CircleCheck,
  cancelled: CircleSlash,
} satisfies Record<ReminderStatus, typeof BellRing>;

export function ReminderCard({
  reminder,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  onClick,
  upcoming = false,
  busy = false,
  locale = DEFAULT_LOCALE,
  className,
}: ReminderCardProps) {
  const now = useNow();
  const isPending = reminder.status === "pending";
  const local = parseLocalDateTime(reminder.remindAtLocal);
  const isPastDue = isPending && now !== null && new Date(reminder.remindAt) <= now;
  const titleId = `reminder-${reminder.id}-title`;
  const Icon = statusIcons[reminder.status];
  const badge = statusBadges[reminder.status];

  const menuItems: DropdownItem[] = [
    ...(isPending && onEdit
      ? [{ label: "Edit", value: "edit", icon: <Pencil />, onSelect: () => onEdit(reminder) }]
      : []),
    ...(isPending && onCancel
      ? [{ label: "Cancel reminder", value: "cancel", icon: <Ban />, onSelect: () => onCancel(reminder) }]
      : []),
    ...(onDelete
      ? [{ label: "Delete", value: "delete", icon: <Trash2 />, danger: true, onSelect: () => onDelete(reminder) }]
      : []),
  ];

  return (
    <article
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      className={cn(
        "relative flex min-w-0 gap-3 rounded-card border p-4 shadow-card transition-[border-color,box-shadow,translate,background-color,opacity] duration-200 sm:gap-4 sm:p-5",
        isPending ? "border-border bg-card" : "border-border bg-card/50",
        isPending && upcoming && "border-secondary/35",
        isPastDue && "border-warning/35",
        onClick && "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-glow",
        busy && "opacity-70",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border transition-colors",
          reminder.status === "pending" && "border-secondary/25 bg-secondary/10 text-secondary",
          reminder.status === "completed" && "border-success/25 bg-success/10 text-success",
          reminder.status === "cancelled" && "border-border-strong bg-elevated text-muted/70",
        )}
      >
        <Icon size={18} />
      </span>

      <div className={cn("min-w-0 flex-1", !isPending && "opacity-70")}>
        <div className="flex flex-wrap items-center gap-2">
          <h3
            id={titleId}
            className={cn(
              "min-w-0 text-sm font-semibold break-words sm:text-base",
              reminder.status === "cancelled" ? "text-muted line-through decoration-muted/60" : "text-foreground",
            )}
          >
            {onClick ? (
              <button
                type="button"
                onClick={() => onClick(reminder)}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
              >
                {reminder.title}
              </button>
            ) : (
              reminder.title
            )}
          </h3>
          <Badge size="sm" variant={badge.variant} dot pill>
            {badge.label}
          </Badge>
          {isPastDue && (
            <Badge size="sm" variant="warning" icon={<TriangleAlert aria-hidden="true" />}>
              Past due
            </Badge>
          )}
          {upcoming && isPending && !isPastDue && (
            <Badge size="sm" variant="primary" pill>
              Upcoming
            </Badge>
          )}
        </div>

        {reminder.description && (
          <p className="mt-1 line-clamp-2 text-sm break-words text-muted">{reminder.description}</p>
        )}

        {local && (
          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Date</dt>
              <CalendarDays size={14} aria-hidden="true" />
              <dd className="font-medium text-foreground/90">
                <time dateTime={reminder.remindAt}>
                  {new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(local)}
                </time>
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Time</dt>
              <Clock size={14} aria-hidden="true" />
              <dd className="font-medium text-foreground/90">
                {new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(local)}
              </dd>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <dt className="sr-only">Time zone</dt>
              <Globe size={14} aria-hidden="true" />
              <dd className="truncate">{reminder.timezone.replace(/_/g, " ")}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="relative z-10 flex shrink-0 items-start gap-1">
        {isPending && onComplete && (
          <Tooltip content="Mark as done">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              disabled={busy}
              aria-label={`Mark "${reminder.title}" as done`}
              onClick={() => onComplete(reminder)}
              className="-mt-1 hover:bg-success/10 hover:text-success"
            >
              <Check size={18} aria-hidden="true" />
            </Button>
          </Tooltip>
        )}
        {menuItems.length > 0 && (
          <Dropdown
            align="end"
            items={menuItems}
            menuLabel={`Actions for "${reminder.title}"`}
            menuClassName="w-44"
            trigger={(props) => (
              <Button
                {...props}
                variant="ghost"
                size="sm"
                iconOnly
                disabled={busy}
                aria-label={`More actions for "${reminder.title}"`}
                className="-mt-1 -mr-1"
              >
                <MoreHorizontal size={18} aria-hidden="true" />
              </Button>
            )}
          />
        )}
      </div>
    </article>
  );
}
