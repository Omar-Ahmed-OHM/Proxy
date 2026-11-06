import { mockReply, type MockResponse, type MockRoute } from "@/lib/http";
import { tasksDb } from "@/app/(main)/tasks/api/tasks.mock";
import { mockDate, mockId, mockTimestamp } from "@/mocks/utils";
import type {
  CreateDailyPlanInput,
  DailyPlan,
  DailyPlanTaskInput,
  StoredDailyPlan,
  StoredPlanTask,
} from "../types";

const MAX_TASKS_PER_PLAN = 100;

function toStoredTasks(items: DailyPlanTaskInput[]): StoredPlanTask[] {
  return items.map((item, index) => ({
    taskId: item.taskId,
    order: index + 1,
    ...(item.note ? { note: item.note } : {}),
  }));
}

const plansDb: StoredDailyPlan[] = [
  {
    id: mockId("plan"),
    date: mockDate(0),
    status: "active",
    tasks: toStoredTasks(
      tasksDb.slice(0, 3).map((task, index) => ({
        taskId: task.id,
        ...(index === 0 ? { note: "Start with this before lunch." } : {}),
      })),
    ),
    createdAt: mockTimestamp(-180),
    updatedAt: mockTimestamp(-30),
  },
  {
    id: mockId("plan"),
    date: mockDate(-1),
    status: "completed",
    tasks: toStoredTasks(tasksDb.slice(3, 5).map((task) => ({ taskId: task.id }))),
    createdAt: mockTimestamp(-1620),
    updatedAt: mockTimestamp(-900),
  },
];

function planError(status: number, code: string, message: string): MockResponse {
  return { status, data: { error: { code, message } } };
}

function toPublicPlan(plan: StoredDailyPlan): DailyPlan {
  return {
    id: plan.id,
    date: plan.date,
    status: plan.status,
    tasks: [...plan.tasks]
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        taskId: item.taskId,
        order: item.order,
        note: item.note ?? null,
        task: tasksDb.find((task) => task.id === item.taskId) ?? null,
      })),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

function currentItems(plan: StoredDailyPlan): DailyPlanTaskInput[] {
  return [...plan.tasks]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ taskId: item.taskId, ...(item.note ? { note: item.note } : {}) }));
}

function missingTasks(items: DailyPlanTaskInput[]): string[] {
  return items.map((item) => item.taskId).filter((id) => !tasksDb.some((task) => task.id === id));
}

function withPlan(id: string, modify: (plan: StoredDailyPlan) => MockResponse): MockResponse {
  const plan = plansDb.find((item) => item.id === id);
  if (!plan) return planError(404, "DAILY_PLAN_NOT_FOUND", "Daily plan not found");
  return modify(plan);
}

function withActivePlan(id: string, modify: (plan: StoredDailyPlan) => MockResponse): MockResponse {
  return withPlan(id, (plan) => {
    if (plan.status === "completed") {
      return planError(409, "DAILY_PLAN_COMPLETED", "A completed daily plan cannot be modified");
    }
    return modify(plan);
  });
}

function save(plan: StoredDailyPlan, items: DailyPlanTaskInput[]): MockResponse {
  plan.tasks = toStoredTasks(items);
  plan.updatedAt = mockTimestamp();
  return mockReply({ plan: toPublicPlan(plan) });
}

export const dailyPlanMock: MockRoute[] = [
  {
    method: "GET",
    path: "/daily-plans",
    handler: ({ query }) => {
      const date = query.get("date");
      const from = date ?? query.get("from");
      const to = date ?? query.get("to");
      const plans = plansDb
        .filter((plan) => (!from || plan.date >= from) && (!to || plan.date <= to))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(toPublicPlan);
      return mockReply({ plans });
    },
  },
  {
    method: "POST",
    path: "/daily-plans",
    handler: ({ body }) => {
      const input = (body ?? {}) as CreateDailyPlanInput;
      const date = input.date ?? mockDate(0);
      const items = input.tasks ?? [];
      if (missingTasks(items).length > 0) return planError(404, "TASK_NOT_FOUND", "Task not found");
      if (plansDb.some((plan) => plan.date === date)) {
        return planError(409, "DAILY_PLAN_ALREADY_EXISTS", `A daily plan already exists for ${date}`);
      }
      const now = mockTimestamp();
      const plan: StoredDailyPlan = {
        id: mockId("plan"),
        date,
        status: "active",
        tasks: toStoredTasks(items),
        createdAt: now,
        updatedAt: now,
      };
      plansDb.push(plan);
      return mockReply({ plan: toPublicPlan(plan) }, 201);
    },
  },
  {
    method: "GET",
    path: "/daily-plans/:id",
    handler: ({ params }) => withPlan(params.id, (plan) => mockReply({ plan: toPublicPlan(plan) })),
  },
  {
    method: "PATCH",
    path: "/daily-plans/:id/tasks/reorder",
    handler: ({ params, body }) =>
      withActivePlan(params.id, (plan) => {
        const { taskIds } = body as { taskIds: string[] };
        const items = currentItems(plan);
        const byId = new Map(items.map((item) => [item.taskId, item]));
        const valid =
          new Set(taskIds).size === taskIds.length &&
          taskIds.length === items.length &&
          taskIds.every((id) => byId.has(id));
        if (!valid) {
          return planError(400, "INVALID_TASK_ORDER", "taskIds must contain every task in the plan exactly once");
        }
        return save(
          plan,
          taskIds.flatMap((id) => {
            const item = byId.get(id);
            return item ? [item] : [];
          }),
        );
      }),
  },
  {
    method: "POST",
    path: "/daily-plans/:id/tasks",
    handler: ({ params, body }) =>
      withActivePlan(params.id, (plan) => {
        const input = body as DailyPlanTaskInput;
        if (missingTasks([input]).length > 0) return planError(404, "TASK_NOT_FOUND", "Task not found");
        const items = currentItems(plan);
        if (items.some((item) => item.taskId === input.taskId)) {
          return planError(409, "TASK_ALREADY_IN_PLAN", "Task is already in this plan");
        }
        if (items.length >= MAX_TASKS_PER_PLAN) {
          return planError(409, "DAILY_PLAN_FULL", `A plan can hold at most ${MAX_TASKS_PER_PLAN} tasks`);
        }
        return save(plan, [...items, input]);
      }),
  },
  {
    method: "DELETE",
    path: "/daily-plans/:id/tasks/:taskId",
    handler: ({ params }) =>
      withActivePlan(params.id, (plan) => {
        const items = currentItems(plan);
        if (!items.some((item) => item.taskId === params.taskId)) {
          return planError(404, "TASK_NOT_IN_PLAN", "Task is not in this plan");
        }
        return save(
          plan,
          items.filter((item) => item.taskId !== params.taskId),
        );
      }),
  },
  {
    method: "PATCH",
    path: "/daily-plans/:id/complete",
    handler: ({ params }) =>
      withPlan(params.id, (plan) => {
        if (plan.status !== "completed") {
          plan.status = "completed";
          plan.updatedAt = mockTimestamp();
        }
        return mockReply({ plan: toPublicPlan(plan) });
      }),
  },
  {
    method: "PATCH",
    path: "/daily-plans/:id",
    handler: ({ params, body }) =>
      withActivePlan(params.id, (plan) => {
        const input = body as CreateDailyPlanInput;
        if (input.date && plansDb.some((item) => item.id !== plan.id && item.date === input.date)) {
          return planError(409, "DAILY_PLAN_ALREADY_EXISTS", `A daily plan already exists for ${input.date}`);
        }
        if (input.date) plan.date = input.date;
        if (input.tasks && missingTasks(input.tasks).length > 0) {
          return planError(404, "TASK_NOT_FOUND", "Task not found");
        }
        return save(plan, input.tasks ?? currentItems(plan));
      }),
  },
  {
    method: "DELETE",
    path: "/daily-plans/:id",
    handler: ({ params }) =>
      withPlan(params.id, (plan) => {
        plansDb.splice(plansDb.indexOf(plan), 1);
        return mockReply(null, 204);
      }),
  },
];
