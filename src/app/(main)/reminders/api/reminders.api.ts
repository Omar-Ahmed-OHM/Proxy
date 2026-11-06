import { ENDPOINTS, httpClient } from "@/lib/http";
import type {
  CreateReminderInput,
  Reminder,
  ReminderListParams,
  ReminderResponse,
  RemindersResponse,
  UpdateReminderInput,
} from "../types";

export async function getReminders(params: ReminderListParams = {}, signal?: AbortSignal): Promise<Reminder[]> {
  const { reminders } = await httpClient.get<RemindersResponse>(ENDPOINTS.reminders.list, {
    params: { status: params.status },
    signal,
  });
  return reminders;
}

export async function getReminder(id: string, signal?: AbortSignal): Promise<Reminder> {
  const { reminder } = await httpClient.get<ReminderResponse>(ENDPOINTS.reminders.byId(id), { signal });
  return reminder;
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const { reminder } = await httpClient.post<ReminderResponse, CreateReminderInput>(
    ENDPOINTS.reminders.list,
    input,
  );
  return reminder;
}

export async function updateReminder({ id, ...input }: UpdateReminderInput): Promise<Reminder> {
  const { reminder } = await httpClient.patch<ReminderResponse>(ENDPOINTS.reminders.byId(id), input);
  return reminder;
}

export async function completeReminder(id: string): Promise<Reminder> {
  const { reminder } = await httpClient.patch<ReminderResponse>(ENDPOINTS.reminders.complete(id));
  return reminder;
}

export async function cancelReminder(id: string): Promise<Reminder> {
  const { reminder } = await httpClient.patch<ReminderResponse>(ENDPOINTS.reminders.cancel(id));
  return reminder;
}

export function deleteReminder(id: string): Promise<void> {
  return httpClient.delete(ENDPOINTS.reminders.byId(id));
}
