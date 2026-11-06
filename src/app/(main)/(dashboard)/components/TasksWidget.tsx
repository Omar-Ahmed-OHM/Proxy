"use client";

import { ListChecks, Plus, SquareCheckBig } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteTask, useTasks, useToggleTask } from "@/app/(main)/tasks/hooks/useTasks";
import type { Task } from "@/app/(main)/tasks/types";
import { Card } from "@/app/components/ui/Card";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/cn";
import type { TaskFilter } from "../types";
import { TaskRow } from "./TaskRow";
import { ViewAllLink } from "./ViewAllLink";
import { WidgetError } from "./WidgetError";

const MAX_ROWS = 5;

const filterLabels: Record<TaskFilter, string> = {
  all: "All",
  pending: "Pending",
  completed: "Completed",
};

const isDone = (task: Task) => task.status === "completed";

function compareTasks(a: Task, b: Task): number {
  if (isDone(a) !== isDone(b)) return isDone(a) ? 1 : -1;
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return 0;
}

export function TasksWidget() {
  const router = useRouter();
  const now = useNow();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const query = useTasks();
  const hydrated = now !== null;
  const tasks = hydrated ? query.data : undefined;
  const isPending = !hydrated || query.isPending;
  const { isError, error, refetch } = query;
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const all = tasks ?? [];
  const counts: Record<TaskFilter, number> = {
    all: all.length,
    pending: all.filter((task) => !isDone(task)).length,
    completed: all.filter(isDone).length,
  };
  const visible = all
    .filter((task) => (filter === "all" ? true : filter === "completed" ? isDone(task) : !isDone(task)))
    .sort(compareTasks)
    .slice(0, MAX_ROWS);

  const busyId =
    (toggleTask.isPending ? toggleTask.variables?.id : undefined) ??
    (deleteTask.isPending ? deleteTask.variables : undefined);

  return (
    <Card
      title="My Tasks"
      icon={<SquareCheckBig aria-hidden="true" />}
      headerAction={<ViewAllLink href="/tasks" label="View all tasks" />}
      className="h-full"
    >
      <div className="flex h-full flex-col">
        <div role="group" aria-label="Filter tasks" className="mb-3 flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as TaskFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "h-8 rounded-full border px-3.5 text-xs font-medium transition-colors",
                filter === key
                  ? "border-primary bg-primary text-white shadow-glow"
                  : "border-border-strong bg-surface/60 text-muted hover:text-foreground",
              )}
            >
              {filterLabels[key]}
              {tasks && <span className="tabular-nums"> ({counts[key]})</span>}
            </button>
          ))}
        </div>

        {isPending ? (
          <ul aria-busy="true" aria-label="Loading tasks" className="flex flex-col gap-2">
            {Array.from({ length: MAX_ROWS }, (_, index) => (
              <li key={index} className="flex h-12 items-center gap-3 px-2">
                <Skeleton variant="circular" className="size-6" />
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton variant="custom" className="ml-auto h-5 w-14 rounded-full" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <WidgetError message={error?.message} onRetry={() => void refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<ListChecks aria-hidden="true" />}
            title={filter === "completed" ? "No completed tasks yet" : filter === "pending" ? "All caught up" : "No tasks yet"}
            description={filter === "all" ? "Add your first task to get started." : undefined}
          />
        ) : (
          <ul aria-label={`${filterLabels[filter]} tasks`} className="-mx-2 flex flex-col">
            {visible.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                now={now}
                busy={busyId === task.id}
                onToggle={(item) => toggleTask.mutate({ id: item.id, completed: !isDone(item) })}
                onEdit={() => router.push("/tasks")}
                onDelete={(item) => deleteTask.mutate(item.id)}
              />
            ))}
          </ul>
        )}

        <Link
          href="/tasks"
          className="mt-auto inline-flex items-center gap-1.5 self-start rounded-md pt-3 text-sm font-medium text-primary-soft transition-colors hover:text-foreground"
        >
          <Plus size={16} aria-hidden="true" />
          Add New Task
        </Link>
      </div>
    </Card>
  );
}
