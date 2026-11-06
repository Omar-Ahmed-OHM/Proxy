"use client";

import { useId, useState, type FormEvent } from "react";
import { DatePicker } from "@/app/components/shared/DatePicker";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Modal } from "@/app/components/ui/Modal";
import { Select } from "@/app/components/ui/Select";
import { Textarea } from "@/app/components/ui/Textarea";
import type { SelectOption } from "@/app/components/ui/types";
import { useNow } from "@/hooks/useNow";
import { parseDueDate, startOfDay, toISODate } from "@/lib/date";
import { ApiError } from "@/lib/http";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import type {
  TaskFormErrors,
  TaskFormField,
  TaskFormModalProps,
  TaskFormValues,
  Task,
  TaskPriority,
  TaskStatus,
} from "../types";

const priorityOptions: ReadonlyArray<SelectOption<TaskPriority>> = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const statusOptions: ReadonlyArray<SelectOption<TaskStatus>> = [
  { label: "Pending", value: "pending" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

function initialValues(task: TaskFormModalProps["task"]): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "pending",
    dueDate: parseDueDate(task?.dueDate)?.date ?? null,
  };
}

function validate(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();
  if (!title) errors.title = "Title is required.";
  else if (title.length > 150) errors.title = "Keep the title under 150 characters.";
  if (values.description.trim().length > 2000) errors.description = "Keep the description under 2000 characters.";
  return errors;
}

function toFormErrors(error: unknown): TaskFormErrors {
  if (!(error instanceof ApiError)) return { form: "Something went wrong. Please try again." };
  const errors: TaskFormErrors = {
    title: error.fieldError("title"),
    description: error.fieldError("description"),
    priority: error.fieldError("priority"),
    status: error.fieldError("status"),
    dueDate: error.fieldError("dueDate"),
  };
  return Object.values(errors).some(Boolean) ? errors : { form: error.message };
}

export function TaskFormModal({ open, task, onClose, onSaved }: TaskFormModalProps) {
  const formId = useId();
  const now = useNow();
  const [values, setValues] = useState<TaskFormValues>(() => initialValues(task));
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = Boolean(task);
  const isSaving = createTask.isPending || updateTask.isPending;

  const handleChange = <F extends TaskFormField>(field: F, value: TaskFormValues[F]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field] || errors.form) setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const title = values.title.trim();
    const description = values.description.trim();
    const dueDate = values.dueDate ? toISODate(values.dueDate) : null;
    const options = {
      onSuccess: (saved: Task) => {
        onSaved?.(saved);
        onClose();
      },
      onError: (error: unknown) => setErrors(toFormErrors(error)),
    };

    if (task) {
      updateTask.mutate(
        {
          id: task.id,
          title,
          description: description || null,
          priority: values.priority,
          status: values.status,
          dueDate,
        },
        options,
      );
      return;
    }

    createTask.mutate(
      {
        title,
        priority: values.priority,
        ...(description && { description }),
        ...(dueDate && { dueDate }),
      },
      options,
    );
  };

  return (
    <Modal
      open={open}
      onClose={isSaving ? () => undefined : onClose}
      title={isEditing ? "Edit task" : "Create task"}
      description={isEditing ? "Update the details of this task." : "Add a new task to track your work."}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSaving}>
            {isEditing ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.form && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Input
          label="Title"
          required
          autoFocus
          maxLength={150}
          value={values.title}
          onChange={(event) => handleChange("title", event.target.value)}
          error={errors.title}
          placeholder="e.g. Finish the project documentation"
        />
        <Textarea
          label="Description"
          rows={3}
          maxLength={2000}
          showCharacterCount
          value={values.description}
          onChange={(event) => handleChange("description", event.target.value)}
          error={errors.description}
          placeholder="Optional details"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select<TaskPriority>
            label="Priority"
            options={priorityOptions}
            value={values.priority}
            onChange={(priority) => handleChange("priority", priority ?? "medium")}
            error={errors.priority}
          />
          <DatePicker
            label="Due date"
            clearable
            value={values.dueDate}
            onChange={(date) => handleChange("dueDate", date)}
            minDate={!isEditing && now ? startOfDay(now) : undefined}
            error={errors.dueDate}
          />
        </div>
        {isEditing && (
          <Select<TaskStatus>
            label="Status"
            options={statusOptions}
            value={values.status}
            onChange={(status) => handleChange("status", status ?? "pending")}
            error={errors.status}
          />
        )}
      </form>
    </Modal>
  );
}
