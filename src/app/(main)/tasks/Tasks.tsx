"use client";

import { CircleAlert, ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, Skeleton } from "@/app/components/ui";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/cn";
import { TaskCard } from "./components/TaskCard";
import { TaskFormModal } from "./components/TaskFormModal";
import { useDeleteTask, useTasks, useToggleTask } from "./hooks/useTasks";
import type { Task, TaskListFilter } from "./types";

const filters: ReadonlyArray<{ value: TaskListFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const emptyCopy: Record<TaskListFilter, string> = {
  all: "Tasks you create will appear here.",
  pending: "No pending tasks.",
  in_progress: "Nothing in progress right now.",
  completed: "Tasks you finish will show up here.",
};

export default function Tasks() {
  const hydrated = useNow() !== null;
  const query = useTasks();
  const tasks = (hydrated ? query.data : undefined) ?? [];
  const isPending = !hydrated || query.isPending;
  const { isError, refetch } = query;
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const [filter, setFilter] = useState<TaskListFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const counts = filters.reduce<Record<TaskListFilter, number>>(
    (acc, item) => ({
      ...acc,
      [item.value]: item.value === "all" ? tasks.length : tasks.filter((task) => task.status === item.value).length,
    }),
    { all: 0, pending: 0, in_progress: 0, completed: 0 },
  );
  const visible = filter === "all" ? tasks : tasks.filter((task) => task.status === filter);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Plan and track what needs doing."
        actions={
          <Button leftIcon={<Plus size={18} aria-hidden="true" />} onClick={openCreate}>
            Create task
          </Button>
        }
      />

      <div role="group" aria-label="Filter tasks" className="mb-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === item.value
                ? "border-primary bg-primary text-white shadow-glow"
                : "border-border-strong bg-surface text-muted hover:border-primary/50 hover:text-foreground",
            )}
          >
            {item.label}
            {!isPending && <span className="ml-1 opacity-80">({counts[item.value]})</span>}
          </button>
        ))}
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton variant="card" count={3} />
        </div>
      ) : isError ? (
        <Card>
          <EmptyState
            icon={<CircleAlert aria-hidden="true" />}
            title="Couldn’t load tasks"
            description="Check your connection and try again."
            primaryAction={
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListChecks aria-hidden="true" />}
            title={filter === "all" ? "No tasks yet" : "Nothing here"}
            description={emptyCopy[filter]}
            primaryAction={
              filter !== "completed" ? (
                <Button size="sm" leftIcon={<Plus size={16} aria-hidden="true" />} onClick={openCreate}>
                  Create task
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onComplete={(id, completed) => toggleTask.mutate({ id, completed })}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            </li>
          ))}
        </ul>
      )}

      {formOpen && <TaskFormModal key={editing?.id ?? "new"} open={formOpen} task={editing} onClose={closeForm} />}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteTask.mutate(deleting.id);
          setDeleting(null);
        }}
        variant="danger"
        title="Delete task?"
        description={deleting ? `"${deleting.title}" will be permanently removed.` : undefined}
        confirmText="Delete"
      />
    </>
  );
}
