import { ENDPOINTS, mockError, mockReply, type MockRoute } from "@/lib/http";
import { mockAllDay, mockId, mockInstant, mockTimestamp, patchById, removeById } from "@/mocks/utils";
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../types";

function seed(
  id: string,
  title: string,
  status: TaskStatus,
  priority: Task["priority"],
  dueDate: string | null,
  description: string | null = null,
): Task {
  const createdAt = mockTimestamp(-4320);
  return {
    id,
    title,
    description,
    status,
    priority,
    dueDate,
    completedAt: status === "completed" ? mockTimestamp(-120) : null,
    createdAt,
    updatedAt: createdAt,
  };
}

export const tasksDb: Task[] = [
  seed("task_1", "Finish the project documentation", "in_progress", "high", mockInstant(0, "17:00"), "Cover setup, architecture and deployment."),
  seed("task_2", "Plan next week goals", "pending", "medium", mockAllDay(0)),
  seed("task_3", "Read a chapter of the book", "pending", "low", mockAllDay(1)),
  seed("task_4", "Exercise for 30 minutes", "pending", "low", mockInstant(1, "07:30")),
  seed("task_5", "Pay electricity bill", "pending", "medium", mockAllDay(2)),
  seed("task_6", "Review pull requests", "completed", "high", mockAllDay(-1)),
  seed("task_7", "Book dentist appointment", "pending", "medium", mockAllDay(-2)),
  seed("task_8", "Clean up the inbox", "completed", "low", null),
];

function normalizeDue(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : new Date(value).toISOString();
}

function applyPatch(task: Task, input: Omit<UpdateTaskInput, "id">): Partial<Task> {
  const patch: Partial<Task> = { updatedAt: mockTimestamp() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.dueDate !== undefined) patch.dueDate = normalizeDue(input.dueDate) ?? null;
  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status === "completed" && task.status !== "completed") patch.completedAt = mockTimestamp();
    if (input.status !== "completed") patch.completedAt = null;
  }
  return patch;
}

const notFound = () => mockError(404, "Task not found");

export const tasksMock: MockRoute[] = [
  { method: "GET", path: ENDPOINTS.tasks.list, handler: () => mockReply({ tasks: tasksDb }) },
  {
    method: "GET",
    path: ENDPOINTS.tasks.byId(":id"),
    handler: ({ params }) => {
      const task = tasksDb.find((item) => item.id === params.id);
      return task ? mockReply({ task }) : notFound();
    },
  },
  {
    method: "POST",
    path: ENDPOINTS.tasks.list,
    handler: ({ body }) => {
      const input = body as CreateTaskInput;
      const now = mockTimestamp();
      const task: Task = {
        id: mockId("task"),
        title: input.title,
        description: input.description ?? null,
        status: "pending",
        priority: input.priority ?? "medium",
        dueDate: normalizeDue(input.dueDate) ?? null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      tasksDb.unshift(task);
      return mockReply({ task }, 201);
    },
  },
  {
    method: "PATCH",
    path: ENDPOINTS.tasks.complete(":id"),
    handler: ({ params }) => {
      const current = tasksDb.find((item) => item.id === params.id);
      if (!current) return notFound();
      const task = patchById(tasksDb, params.id, applyPatch(current, { status: "completed" }));
      return mockReply({ task });
    },
  },
  {
    method: "PATCH",
    path: ENDPOINTS.tasks.byId(":id"),
    handler: ({ params, body }) => {
      const current = tasksDb.find((item) => item.id === params.id);
      if (!current) return notFound();
      const task = patchById(tasksDb, params.id, applyPatch(current, body as Omit<UpdateTaskInput, "id">));
      return mockReply({ task });
    },
  },
  {
    method: "DELETE",
    path: ENDPOINTS.tasks.byId(":id"),
    handler: ({ params }) => (removeById(tasksDb, params.id) ? mockReply(null, 204) : notFound()),
  },
];
