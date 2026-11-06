"use client";

import { useId, useState, type FormEvent } from "react";
import { DatePicker } from "@/app/components/shared/DatePicker";
import { TimePicker } from "@/app/components/shared/TimePicker";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Modal } from "@/app/components/ui/Modal";
import { Textarea } from "@/app/components/ui/Textarea";
import { useNow } from "@/hooks/useNow";
import { ApiError } from "@/lib/http";
import { startOfDay, toISODate } from "@/lib/date";
import { useCreateReminder, useUpdateReminder } from "../hooks/useReminders";
import { parseLocalDateTime } from "../utils";
import type { ReminderFormDialogProps, ReminderFormErrors } from "../types";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function toFormErrors(error: unknown): ReminderFormErrors {
  if (!(error instanceof ApiError)) return { form: "Something went wrong. Please try again." };
  if (error.code === "REMINDER_IN_PAST") return { time: "Pick a time in the future." };
  const errors: ReminderFormErrors = {
    title: error.fieldError("title"),
    description: error.fieldError("description"),
    time: error.fieldError("remindAt"),
  };
  const hasFieldError = Object.values(errors).some(Boolean);
  return hasFieldError ? errors : { form: error.message };
}

export function ReminderFormDialog({ open, reminder, onClose }: ReminderFormDialogProps) {
  const formId = useId();
  const now = useNow();
  const initial = reminder ? parseLocalDateTime(reminder.remindAtLocal) : null;
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [description, setDescription] = useState(reminder?.description ?? "");
  const [date, setDate] = useState<Date | null>(initial ? startOfDay(initial) : null);
  const [time, setTime] = useState<string | null>(
    initial ? `${pad(initial.getHours())}:${pad(initial.getMinutes())}` : null,
  );
  const [errors, setErrors] = useState<ReminderFormErrors>({});
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const isEditing = Boolean(reminder);
  const isSaving = createReminder.isPending || updateReminder.isPending;

  const validate = (): ReminderFormErrors => {
    const next: ReminderFormErrors = {};
    if (!title.trim()) next.title = "Title is required.";
    else if (title.trim().length > 150) next.title = "Keep the title under 150 characters.";
    if (description.length > 2000) next.description = "Keep the description under 2000 characters.";
    if (!date) next.date = "Pick a date.";
    if (!time) next.time = "Pick a time.";
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !date || !time) return;

    const remindAt = `${toISODate(date)}T${time}`;
    const options = { onSuccess: onClose, onError: (error: unknown) => setErrors(toFormErrors(error)) };

    if (reminder) {
      updateReminder.mutate(
        { id: reminder.id, title: title.trim(), description: description.trim() || null, remindAt },
        options,
      );
    } else {
      createReminder.mutate(
        {
          title: title.trim(),
          ...(description.trim() && { description: description.trim() }),
          remindAt,
          timezone: browserTimeZone(),
        },
        options,
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={isSaving ? () => undefined : onClose}
      title={isEditing ? "Edit reminder" : "New reminder"}
      description={isEditing ? "Update when and what to remind you about." : "We'll notify you at the time you pick."}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSaving}>
            {isEditing ? "Save changes" : "Create reminder"}
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
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={errors.title}
          placeholder="e.g. Call the dentist"
        />
        <Textarea
          label="Description"
          rows={3}
          maxLength={2000}
          showCharacterCount
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={errors.description}
          placeholder="Optional details"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            label="Date"
            required
            value={date}
            onChange={setDate}
            minDate={now ? startOfDay(now) : undefined}
            error={errors.date}
          />
          <TimePicker label="Time" required value={time} onChange={setTime} minuteStep={5} error={errors.time} />
        </div>
      </form>
    </Modal>
  );
}
