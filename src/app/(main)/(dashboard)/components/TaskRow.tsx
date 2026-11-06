"use client";

import { CalendarDays, Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Dropdown } from "@/app/components/ui/Dropdown";
import { TaskPriorityBadge } from "@/app/(main)/tasks/components/TaskPriorityBadge";
import { cn } from "@/lib/cn";
import { addDays, DEFAULT_LOCALE, isSameDay, parseDueDate, startOfDay } from "@/lib/date";
import type { TaskRowProps } from "../types";

function getDueLabel(dueDate: string | null, now: Date | null): { label: string; overdue: boolean } | null {
  const due = parseDueDate(dueDate);
  if (!due) return null;
  const date = due.allDay ? due.date : startOfDay(due.date);
  if (now) {
    const today = startOfDay(now);
    if (isSameDay(date, today)) return { label: "Today", overdue: false };
    if (isSameDay(date, addDays(today, 1))) return { label: "Tomorrow", overdue: false };
    if (isSameDay(date, addDays(today, -1))) return { label: "Yesterday", overdue: true };
    if (date < today) {
      return { label: new Intl.DateTimeFormat(DEFAULT_LOCALE, { month: "short", day: "numeric" }).format(date), overdue: true };
    }
  }
  return { label: new Intl.DateTimeFormat(DEFAULT_LOCALE, { month: "short", day: "numeric" }).format(date), overdue: false };
}

export function TaskRow({ task, now, busy = false, onToggle, onEdit, onDelete }: TaskRowProps) {
  const completed = task.status === "completed";
  const due = getDueLabel(task.dueDate, now);
  const overdue = Boolean(due?.overdue) && !completed;

  return (
    <li
      className={cn(
        "group flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-elevated/60",
        busy && "opacity-60",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        disabled={busy}
        onClick={() => onToggle(task)}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors disabled:cursor-wait",
          completed
            ? "border-primary bg-primary text-white"
            : "border-muted/60 text-transparent hover:border-primary-soft hover:text-primary-soft/60",
        )}
      >
        <Check size={14} strokeWidth={3} aria-hidden="true" />
      </button>

      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          completed ? "text-muted line-through decoration-muted/60" : "text-foreground",
        )}
      >
        {task.title}
      </span>

      <TaskPriorityBadge priority={task.priority} size="sm" showIcon={false} className="hidden rounded-full sm:inline-flex" />

      {due && (
        <span
          className={cn(
            "hidden w-24 shrink-0 items-center gap-1.5 text-xs sm:inline-flex",
            overdue ? "text-danger" : "text-muted",
          )}
        >
          <CalendarDays size={14} aria-hidden="true" />
          <span className="sr-only">{overdue ? "Overdue, due" : "Due"}</span>
          {due.label}
        </span>
      )}

      <Dropdown
        align="end"
        menuLabel={`Actions for ${task.title}`}
        menuClassName="w-40"
        trigger={(props) => (
          <button
            {...props}
            type="button"
            aria-label={`More actions for ${task.title}`}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground"
          >
            <MoreVertical size={16} aria-hidden="true" />
          </button>
        )}
        items={[
          { label: "Edit", value: "edit", icon: <Pencil aria-hidden="true" />, onSelect: () => onEdit(task) },
          {
            label: "Delete",
            value: "delete",
            danger: true,
            disabled: busy,
            icon: <Trash2 aria-hidden="true" />,
            onSelect: () => onDelete(task),
          },
        ]}
      />
    </li>
  );
}
