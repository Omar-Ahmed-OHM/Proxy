"use client";

import { BellRing, CircleAlert, Plus } from "lucide-react";
import { useState } from "react";
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, Skeleton } from "@/app/components/ui";
import { cn } from "@/lib/cn";
import { ReminderCard } from "./components/ReminderCard";
import { ReminderFormDialog } from "./components/ReminderFormDialog";
import {
  useCancelReminder,
  useCompleteReminder,
  useDeleteReminder,
  useReminders,
} from "./hooks/useReminders";
import type { Reminder, ReminderFilter } from "./types";

const filters: ReadonlyArray<{ value: ReminderFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyCopy: Record<ReminderFilter, string> = {
  all: "Reminders you create will appear here.",
  pending: "Nothing scheduled right now.",
  completed: "Reminders you finish will show up here.",
  cancelled: "No cancelled reminders.",
};

export default function Reminders() {
  const { data: reminders = [], isPending, isError, refetch } = useReminders();
  const completeReminder = useCompleteReminder();
  const cancelReminder = useCancelReminder();
  const deleteReminder = useDeleteReminder();
  const [filter, setFilter] = useState<ReminderFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState<Reminder | null>(null);

  const counts = filters.reduce<Record<ReminderFilter, number>>(
    (acc, item) => ({
      ...acc,
      [item.value]:
        item.value === "all" ? reminders.length : reminders.filter((reminder) => reminder.status === item.value).length,
    }),
    { all: 0, pending: 0, completed: 0, cancelled: 0 },
  );
  const visible = filter === "all" ? reminders : reminders.filter((reminder) => reminder.status === filter);
  const busyId =
    (completeReminder.isPending && completeReminder.variables) ||
    (cancelReminder.isPending && cancelReminder.variables) ||
    null;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (reminder: Reminder) => {
    setEditing(reminder);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Reminders"
        description="Keep track of what needs your attention."
        actions={
          <Button leftIcon={<Plus size={18} aria-hidden="true" />} onClick={openCreate}>
            New reminder
          </Button>
        }
      />

      <div role="group" aria-label="Filter reminders" className="mb-5 flex flex-wrap gap-2">
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
            title="Couldn’t load reminders"
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
            icon={<BellRing aria-hidden="true" />}
            title={filter === "all" ? "No reminders yet" : "Nothing here"}
            description={emptyCopy[filter]}
            primaryAction={
              filter === "all" || filter === "pending" ? (
                <Button size="sm" leftIcon={<Plus size={16} aria-hidden="true" />} onClick={openCreate}>
                  New reminder
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((reminder) => (
            <li key={reminder.id}>
              <ReminderCard
                reminder={reminder}
                busy={busyId === reminder.id}
                onComplete={(item) => completeReminder.mutate(item.id)}
                onCancel={(item) => cancelReminder.mutate(item.id)}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <ReminderFormDialog key={editing?.id ?? "new"} open={formOpen} reminder={editing} onClose={closeForm} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteReminder.mutate(deleting.id);
          setDeleting(null);
        }}
        variant="danger"
        title="Delete reminder?"
        description={deleting ? `"${deleting.title}" will be permanently removed.` : undefined}
        confirmText="Delete"
      />
    </>
  );
}
