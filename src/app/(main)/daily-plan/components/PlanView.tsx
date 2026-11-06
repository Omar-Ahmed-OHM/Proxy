"use client";

import { CircleAlert, CircleCheckBig, ListTodo, Lock, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { EmptyState } from "@/app/components/ui/EmptyState";
import {
  useAddTaskToPlan,
  useCompleteDailyPlan,
  useDeleteDailyPlan,
  useRemoveTaskFromPlan,
  useReorderPlanTasks,
} from "../hooks/useDailyPlans";
import type { PlanViewProps } from "../types";
import { AddTaskPicker } from "./AddTaskPicker";
import { PlanProgress } from "./PlanProgress";
import { PlanTaskRow } from "./PlanTaskRow";

export function PlanView({ plan, dateLabel }: PlanViewProps) {
  const [confirm, setConfirm] = useState<"complete" | "delete" | null>(null);
  const addTask = useAddTaskToPlan();
  const removeTask = useRemoveTaskFromPlan();
  const reorder = useReorderPlanTasks(plan.date);
  const complete = useCompleteDailyPlan();
  const remove = useDeleteDailyPlan();

  const readOnly = plan.status === "completed";
  const busy = addTask.isPending || removeTask.isPending || reorder.isPending;
  const total = plan.tasks.length;
  const completedCount = plan.tasks.filter((item) => item.task?.status === "completed").length;
  const actionError = [addTask, removeTask, reorder, complete, remove].find((mutation) => mutation.isError)?.error;

  const move = (index: number, direction: -1 | 1) => {
    const ids = plan.tasks.map((item) => item.taskId);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate({ planId: plan.id, taskIds: ids });
  };

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {`Plan for ${dateLabel}`}
          <Badge
            variant={readOnly ? "success" : "primary"}
            size="sm"
            icon={readOnly ? <CircleCheckBig size={12} aria-hidden="true" /> : undefined}
            dot={!readOnly}
          >
            {readOnly ? "Completed" : "Active"}
          </Badge>
        </span>
      }
      description={readOnly ? "This plan is completed and can no longer be changed." : "Order your tasks the way you'll work on them."}
      icon={<ListTodo aria-hidden="true" />}
      headerAction={
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Button
              size="sm"
              disabled={total === 0}
              onClick={() => setConfirm("complete")}
              leftIcon={<CircleCheckBig size={16} aria-hidden="true" />}
            >
              Complete plan
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Delete plan"
            onClick={() => setConfirm("delete")}
            className="text-muted hover:text-danger"
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <PlanProgress completed={completedCount} total={total} />

        {actionError && (
          <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            <CircleAlert size={16} aria-hidden="true" className="shrink-0" />
            {actionError.message}
          </p>
        )}

        {readOnly ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Lock size={14} aria-hidden="true" />
            Completed plans are read-only.
          </p>
        ) : (
          <AddTaskPicker
            plan={plan}
            disabled={busy}
            adding={addTask.isPending}
            onAdd={(taskId) => addTask.mutate({ planId: plan.id, taskId })}
          />
        )}

        {total === 0 ? (
          <EmptyState
            bordered
            icon={<ListTodo aria-hidden="true" />}
            title="No tasks in this plan yet"
            description="Add tasks above to build your day."
          />
        ) : (
          <ol aria-label="Planned tasks" className="flex flex-col gap-2">
            {plan.tasks.map((item, index) => (
              <PlanTaskRow
                key={item.taskId}
                item={item}
                index={index}
                total={total}
                readOnly={readOnly}
                busy={busy}
                onMove={(direction) => move(index, direction)}
                onRemove={() => removeTask.mutate({ planId: plan.id, taskId: item.taskId })}
              />
            ))}
          </ol>
        )}
      </div>

      <ConfirmDialog
        open={confirm === "complete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => complete.mutate(plan.id, { onSuccess: () => setConfirm(null) })}
        loading={complete.isPending}
        title="Complete this plan?"
        description="A completed plan becomes read-only. You won't be able to add, remove, or reorder its tasks."
        confirmText="Complete plan"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove.mutate({ id: plan.id, date: plan.date }, { onSuccess: () => setConfirm(null) })}
        loading={remove.isPending}
        variant="danger"
        title="Delete this plan?"
        description="The plan will be removed. Your tasks themselves won't be deleted."
        confirmText="Delete plan"
      />
    </Card>
  );
}
