import { ENDPOINTS, httpClient } from "@/lib/http";
import type { AppNotification } from "../types";

export function getNotifications(signal?: AbortSignal) {
  return httpClient.get<AppNotification[]>(ENDPOINTS.notifications.list, { signal });
}

export function markNotificationRead(id: string) {
  return httpClient.patch<AppNotification>(ENDPOINTS.notifications.read(id));
}

export function markAllNotificationsRead() {
  return httpClient.post<void>(ENDPOINTS.notifications.readAll);
}
