import { ENDPOINTS, mockError, mockReply, type MockResponse, type MockRoute } from "@/lib/http";
import { mockId, mockLocalFromNow, mockTimestamp, patchById, removeById, toZonedLocal } from "@/mocks/utils";
import type { CreateReminderInput, Reminder, ReminderStatus, UpdateReminderInput } from "../types";

const DEFAULT_TIMEZONE = "Africa/Cairo";

function seed(
  id: string,
  title: string,
  offsetMinutes: number,
  status: ReminderStatus = "pending",
  description: string | null = null,
): Reminder {
  const { instant, local } = mockLocalFromNow(offsetMinutes, DEFAULT_TIMEZONE);
  const createdAt = mockTimestamp(-2880);
  return {
    id,
    title,
    description,
    remindAt: instant,
    remindAtLocal: local,
    timezone: DEFAULT_TIMEZONE,
    status,
    completedAt: status === "completed" ? mockTimestamp(-60) : null,
    createdAt,
    updatedAt: createdAt,
  };
}

export const remindersDb: Reminder[] = [
  seed("rem_1", "Team Standup Meeting", 60, "pending", "Daily sync with the product team."),
  seed("rem_2", "Take your vitamins", 180),
  seed("rem_3", "Mom's Birthday", 60 * 24, "pending", "Order the cake in the morning."),
  seed("rem_4", "Renew car insurance", 60 * 24 * 4),
  seed("rem_5", "Water the plants", -60 * 20, "completed"),
  seed("rem_6", "Call the bank", -60 * 30, "cancelled"),
];

function apiError(status: number, code: string, message: string): MockResponse {
  return { status, data: { error: { code, message } } };
}

function resolveInstant(remindAt: string, timeZone: string): Date {
  if (/(Z|[+-]\d{2}:?\d{2})$/i.test(remindAt)) return new Date(remindAt);
  const guess = new Date(`${remindAt}Z`);
  const offset = new Date(`${toZonedLocal(guess, timeZone)}Z`).getTime() - guess.getTime();
  return new Date(guess.getTime() - offset);
}

const isPast = (date: Date) => date.getTime() <= Date.now();
const notFound = () => mockError(404, "Reminder not found");
const pastError = () => apiError(400, "REMINDER_IN_PAST", "remindAt must be in the future");

function transition(id: string, status: ReminderStatus): MockResponse {
  const reminder = remindersDb.find((item) => item.id === id);
  if (!reminder) return notFound();
  if (reminder.status === status) return mockReply({ reminder });
  if (reminder.status !== "pending") {
    return apiError(409, "INVALID_STATUS_TRANSITION", `Cannot change a ${reminder.status} reminder to ${status}`);
  }
  const updated = patchById(remindersDb, id, {
    status,
    updatedAt: mockTimestamp(),
    ...(status === "completed" && { completedAt: mockTimestamp() }),
  });
  return mockReply({ reminder: updated });
}

export const remindersMock: MockRoute[] = [
  {
    method: "GET",
    path: ENDPOINTS.reminders.list,
    handler: ({ query }) => {
      const status = query.get("status");
      const reminders = [...remindersDb]
        .sort((a, b) => a.remindAt.localeCompare(b.remindAt))
        .filter((item) => !status || item.status === status);
      return mockReply({ reminders });
    },
  },
  {
    method: "GET",
    path: ENDPOINTS.reminders.byId(":id"),
    handler: ({ params }) => {
      const reminder = remindersDb.find((item) => item.id === params.id);
      return reminder ? mockReply({ reminder }) : notFound();
    },
  },
  {
    method: "POST",
    path: ENDPOINTS.reminders.list,
    handler: ({ body }) => {
      const input = body as CreateReminderInput;
      const timezone = input.timezone ?? DEFAULT_TIMEZONE;
      const instant = resolveInstant(input.remindAt, timezone);
      if (isPast(instant)) return pastError();
      const now = mockTimestamp();
      const reminder: Reminder = {
        id: mockId("rem"),
        title: input.title,
        description: input.description ?? null,
        remindAt: instant.toISOString(),
        remindAtLocal: toZonedLocal(instant, timezone),
        timezone,
        status: "pending",
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      remindersDb.push(reminder);
      return mockReply({ reminder }, 201);
    },
  },
  {
    method: "PATCH",
    path: ENDPOINTS.reminders.complete(":id"),
    handler: ({ params }) => transition(params.id, "completed"),
  },
  {
    method: "PATCH",
    path: ENDPOINTS.reminders.cancel(":id"),
    handler: ({ params }) => transition(params.id, "cancelled"),
  },
  {
    method: "PATCH",
    path: ENDPOINTS.reminders.byId(":id"),
    handler: ({ params, body }) => {
      const current = remindersDb.find((item) => item.id === params.id);
      if (!current) return notFound();
      if (current.status !== "pending") {
        return apiError(409, "REMINDER_NOT_EDITABLE", `Cannot edit a ${current.status} reminder`);
      }
      const input = body as Omit<UpdateReminderInput, "id">;
      const timezone = input.timezone ?? current.timezone;
      const patch: Partial<Reminder> = { updatedAt: mockTimestamp(), timezone };
      if (input.title !== undefined) patch.title = input.title;
      if (input.description !== undefined) patch.description = input.description;
      if (input.remindAt !== undefined || input.timezone !== undefined) {
        const instant = input.remindAt !== undefined ? resolveInstant(input.remindAt, timezone) : new Date(current.remindAt);
        if (input.remindAt !== undefined && isPast(instant)) return pastError();
        patch.remindAt = instant.toISOString();
        patch.remindAtLocal = toZonedLocal(instant, timezone);
      }
      return mockReply({ reminder: patchById(remindersDb, params.id, patch) });
    },
  },
  {
    method: "DELETE",
    path: ENDPOINTS.reminders.byId(":id"),
    handler: ({ params }) => (removeById(remindersDb, params.id) ? mockReply(null, 204) : notFound()),
  },
];
