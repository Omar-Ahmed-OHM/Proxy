import { ENDPOINTS, mockReply, type MockRoute } from "@/lib/http";
import { remindersDb } from "@/app/(main)/reminders/api/reminders.mock";
import { tasksDb } from "@/app/(main)/tasks/api/tasks.mock";
import { mockDate, mockId, mockTimestamp } from "@/mocks/utils";
import type {
  AssistantBriefingResponse,
  AssistantBriefingStats,
  AssistantMessageResponse,
  SendAssistantMessageInput,
} from "../types";

function openTasksOn(day: string) {
  return tasksDb.filter((task) => task.status !== "completed" && task.dueDate?.startsWith(day));
}

function briefingStats(): AssistantBriefingStats {
  const today = mockDate(0);
  const now = Date.now();
  const tasksToday = openTasksOn(today);
  const overdue = tasksDb.filter(
    (task) => task.status !== "completed" && task.dueDate !== null && Date.parse(task.dueDate) < now && !task.dueDate.startsWith(today),
  );
  const remindersToday = remindersDb.filter((reminder) => reminder.status === "pending" && reminder.remindAtLocal.startsWith(today));
  const upcoming = remindersToday
    .filter((reminder) => Date.parse(reminder.remindAt) > now)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt))[0];
  return {
    tasksToday: tasksToday.length,
    overdue: overdue.length,
    remindersToday: remindersToday.length,
    nextItem: upcoming ? { title: upcoming.title, at: upcoming.remindAt } : null,
  };
}

function answer(content: string): string {
  const text = content.toLowerCase();
  const stats = briefingStats();

  if (text.includes("النهارده") || text.includes("today") || text.includes("يومي")) {
    const titles = openTasksOn(mockDate(0)).map((task) => `«${task.title}»`);
    if (titles.length === 0) return "مفيش مهام النهارده، يومك فاضي.";
    return `عندك ${titles.length} مهام النهارده: ${titles.join("، ")}.`;
  }

  if (text.includes("متأخر") || text.includes("overdue")) {
    return stats.overdue === 0 ? "مفيش ولا مهمة متأخرة، عاش!" : `عندك ${stats.overdue} مهام متأخرة.`;
  }

  if (text.includes("فكرني") || text.includes("remind")) {
    return stats.nextItem ? `أقرب تذكير عندك «${stats.nextItem.title}».` : "معندكش تذكيرات جاية.";
  }

  return "أنا في وضع التجربة دلوقتي، بس أقدر أقولك مهامك النهارده والمتأخرة وأقرب تذكير.";
}

export const assistantMock: MockRoute[] = [
  {
    method: "POST",
    path: ENDPOINTS.assistant.messages,
    handler: ({ body }) => {
      const { content } = body as SendAssistantMessageInput;
      const response: AssistantMessageResponse = {
        message: { id: mockId("msg"), role: "assistant", content: answer(content), timestamp: mockTimestamp() },
        actions: [],
      };
      return mockReply(response);
    },
  },
  {
    method: "GET",
    path: ENDPOINTS.assistant.briefing,
    handler: () => {
      const stats = briefingStats();
      const parts = [
        stats.tasksToday > 0 ? `عندك ${stats.tasksToday} مهام النهارده` : "مفيش مهام ليها ميعاد النهارده",
        stats.overdue > 0 ? `و${stats.overdue} متأخرة` : "",
        stats.nextItem ? `وأول حاجة «${stats.nextItem.title}»` : "",
      ].filter(Boolean);
      const response: AssistantBriefingResponse = {
        message: `صباح الخير! ${parts.join(" ")}. يلا نبدأ يومنا.`,
        stats,
      };
      return mockReply(response);
    },
  },
];
