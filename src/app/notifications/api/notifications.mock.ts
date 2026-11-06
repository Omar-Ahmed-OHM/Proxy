import { ENDPOINTS, mockError, mockReply, type MockRoute } from "@/lib/http";
import { mockTimestamp, patchById } from "@/mocks/utils";
import type { AppNotification } from "../types";

export const notificationsDb: AppNotification[] = [
  { id: "ntf_1", title: "Task due today", description: "Finish the project documentation is due at 5:00 PM.", type: "warning", read: false, createdAt: mockTimestamp(-12), href: "/tasks" },
  { id: "ntf_2", title: "Meeting in 30 minutes", description: "Project Meeting starts soon.", type: "info", read: false, createdAt: mockTimestamp(-45), href: "/calendar" },
  { id: "ntf_3", title: "Task completed", description: "You completed Review pull requests.", type: "success", read: true, createdAt: mockTimestamp(-300) },
  { id: "ntf_4", title: "Reminder missed", description: "Water the plants was skipped yesterday.", type: "danger", read: true, createdAt: mockTimestamp(-1500), href: "/reminders" },
];

export const notificationsMock: MockRoute[] = [
  { method: "GET", path: ENDPOINTS.notifications.list, handler: () => mockReply(notificationsDb) },
  {
    method: "PATCH",
    path: ENDPOINTS.notifications.read(":id"),
    handler: ({ params }) => {
      const notification = patchById(notificationsDb, params.id, { read: true });
      return notification ? mockReply(notification) : mockError(404, "Notification not found");
    },
  },
  {
    method: "POST",
    path: ENDPOINTS.notifications.readAll,
    handler: () => {
      notificationsDb.forEach((notification) => {
        notification.read = true;
      });
      return mockReply(null, 204);
    },
  },
];
