import { ArrowDown, ArrowUp, StickyNote, X } from "lucide-react";
import { TaskPriorityBadge } from "@/app/(main)/tasks/components/TaskPriorityBadge";
import { TaskStatusBadge } from "@/app/(main)/tasks/components/TaskStatusBadge";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/cn";
import type { PlanTaskRowProps } from "../types";

export function PlanTaskRow({ item, index, total, readOnly, busy, onMove, onRemove }: PlanTaskRowProps) {
  const { task } = item;
  const title = task?.title ?? "Deleted task";
  const done = task?.status === "completed";

  return (
    <li className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3 transition-colors hover:border-border-strong sm:items-center sm:p-4">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold",
          done ? "bg-success/15 text-success" : "bg-primary/15 text-primary-soft",
        )}
      >
        {item.order}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p
          className={cn(
            "text-sm font-medium break-words sm:text-base",
            !task ? "text-muted italic" : done ? "text-muted line-through" : "text-foreground",
          )}
        >
          <span className="sr-only">{`Step ${item.order}: `}</span>
          {title}
        </p>
        {task && (
          <div className="flex flex-wrap items-center gap-1.5">
            <TaskPriorityBadge priority={task.priority} size="sm" />
            <TaskStatusBadge status={task.status} size="sm" />
          </div>
        )}
        {item.note && (
          <p className="flex items-start gap-1.5 text-xs text-muted">
            <StickyNote size={13} aria-hidden="true" className="mt-px shrink-0" />
            <span className="break-words">{item.note}</span>
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={busy || index === 0}
            aria-label={`Move ${title} up`}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={busy || index === total - 1}
            aria-label={`Move ${title} down`}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={busy}
            aria-label={`Remove ${title} from plan`}
            onClick={onRemove}
            className="text-muted hover:text-danger"
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>
      )}
    </li>
  );
}
