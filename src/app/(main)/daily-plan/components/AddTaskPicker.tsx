"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTasks } from "@/app/(main)/tasks/hooks/useTasks";
import { Button } from "@/app/components/ui/Button";
import { Select } from "@/app/components/ui/Select";
import type { SelectOption } from "@/app/components/ui/types";
import type { AddTaskPickerProps } from "../types";

export function AddTaskPicker({ plan, disabled, adding, onAdd }: AddTaskPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { data: tasks, isPending, isError } = useTasks();
  const inPlan = new Set(plan.tasks.map((item) => item.taskId));
  const options: SelectOption[] = (tasks ?? [])
    .filter((task) => !inPlan.has(task.id))
    .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed"))
    .map((task) => ({
      label: task.status === "completed" ? `${task.title} (done)` : task.title,
      value: task.id,
    }));
  const value = selected && options.some((option) => option.value === selected) ? selected : null;

  const helperText = isError
    ? "Couldn't load your tasks."
    : !isPending && options.length === 0
      ? "Every task is already in this plan."
      : undefined;

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value) return;
        onAdd(value);
        setSelected(null);
      }}
    >
      <Select
        className="min-w-0 flex-1"
        label="Add a task"
        placeholder={isPending ? "Loading tasks…" : "Choose a task"}
        options={options}
        value={value}
        onChange={setSelected}
        searchable
        searchPlaceholder="Search tasks…"
        emptyMessage="No tasks to add"
        disabled={disabled || isPending || options.length === 0}
        helperText={helperText}
      />
      <Button
        type="submit"
        disabled={disabled || !value}
        loading={adding}
        leftIcon={<Plus size={18} aria-hidden="true" />}
        className="sm:mb-[1px]"
      >
        Add
      </Button>
    </form>
  );
}
