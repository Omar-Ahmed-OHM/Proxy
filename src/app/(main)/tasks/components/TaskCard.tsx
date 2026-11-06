"use client";

import { CalendarDays, Clock, MoreHorizontal, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { Dropdown } from "@/app/components/ui/Dropdown";
import type { DropdownItem } from "@/app/components/ui/types";
import { Tooltip } from "@/app/components/ui/Tooltip";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/cn";
import { DEFAULT_LOCALE, dueDeadline, parseDueDate } from "@/lib/date";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";
import type { TaskCardProps } from "../types";

export function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
  onClick,
  actions = "menu",
  overdue,
  now,
  locale = DEFAULT_LOCALE,
  className,
}: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const due = parseDueDate(task.dueDate);
  const currentTime = useNow();
  const reference = now ?? currentTime;
  const isOverdue = overdue ?? (!isCompleted && due !== null && reference !== null && dueDeadline(due) < reference);
  const titleId = `task-${task.id}-title`;

  const menuItems: DropdownItem[] = [
    ...(onEdit ? [{ label: "Edit", value: "edit", icon: <Pencil />, onSelect: () => onEdit(task) }] : []),
    ...(onDelete
      ? [{ label: "Delete", value: "delete", icon: <Trash2 />, danger: true, onSelect: () => onDelete(task) }]
      : []),
  ];

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group relative flex min-w-0 gap-3 rounded-card border bg-card p-4 shadow-card transition-[border-color,box-shadow,translate,background-color] duration-200 sm:p-5",
        onClick && "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-glow",
        isOverdue ? "border-warning/35" : "border-border",
        isCompleted && "bg-card/60",
        className,
      )}
    >
      {task.priority === "high" && !isCompleted && (
        <span aria-hidden="true" className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-danger/80" />
      )}

      {onComplete && (
        <Checkbox
          checked={isCompleted}
          onChange={(checked) => onComplete(task.id, checked)}
          aria-label={isCompleted ? `Mark "${task.title}" as not completed` : `Mark "${task.title}" as completed`}
          className="relative z-10 pt-0.5"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            id={titleId}
            className={cn(
              "min-w-0 text-sm font-semibold break-words sm:text-base",
              isCompleted ? "text-muted line-through decoration-muted/60" : "text-foreground",
            )}
          >
            {onClick ? (
              <button
                type="button"
                onClick={() => onClick(task)}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-accent focus-visible:after:outline-offset-2"
              >
                {task.title}
              </button>
            ) : (
              task.title
            )}
          </h3>

          {menuItems.length > 0 && (
            <div className="relative z-10 -mt-1 -mr-1 flex shrink-0 items-center gap-0.5">
              {actions === "inline" ? (
                <>
                  {onEdit && (
                    <Tooltip content="Edit task">
                      <Button variant="ghost" size="sm" iconOnly aria-label={`Edit "${task.title}"`} onClick={() => onEdit(task)}>
                        <Pencil size={16} aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip content="Delete task">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Delete "${task.title}"`}
                        onClick={() => onDelete(task)}
                        className="hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Dropdown
                  align="end"
                  items={menuItems}
                  menuLabel={`Actions for "${task.title}"`}
                  menuClassName="w-40"
                  trigger={(props) => (
                    <Button {...props} variant="ghost" size="sm" iconOnly aria-label={`More actions for "${task.title}"`}>
                      <MoreHorizontal size={18} aria-hidden="true" />
                    </Button>
                  )}
                />
              )}
            </div>
          )}
        </div>

        {task.description && (
          <p className={cn("mt-1 line-clamp-2 text-sm break-words", isCompleted ? "text-muted/70" : "text-muted")}>
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <TaskStatusBadge status={task.status} size="sm" />
          <TaskPriorityBadge priority={task.priority} size="sm" />
          {isOverdue && (
            <Badge size="sm" variant="warning" icon={<TriangleAlert aria-hidden="true" />}>
              Overdue
            </Badge>
          )}
        </div>

        {due && task.dueDate && (
          <dl
            className={cn(
              "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs",
              isOverdue ? "text-warning" : "text-muted",
            )}
          >
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Due date</dt>
              <CalendarDays size={14} aria-hidden="true" />
              <dd>
                <time dateTime={task.dueDate} suppressHydrationWarning>
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(due.date)}
                </time>
              </dd>
            </div>
            {!due.allDay && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Due time</dt>
                <Clock size={14} aria-hidden="true" />
                <dd>
                  <time dateTime={task.dueDate} suppressHydrationWarning>
                    {new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(due.date)}
                  </time>
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}
