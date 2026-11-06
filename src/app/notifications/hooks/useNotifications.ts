"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications.api";
import type { AppNotification } from "../types";

export const notificationKeys = {
  all: ["notifications"] as const,
};

export function useNotifications() {
  return useQuery({ queryKey: notificationKeys.all, queryFn: ({ signal }) => getNotifications(signal) });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previous = queryClient.getQueryData<AppNotification[]>(notificationKeys.all);
      queryClient.setQueryData<AppNotification[]>(notificationKeys.all, (current) =>
        current?.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(notificationKeys.all, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previous = queryClient.getQueryData<AppNotification[]>(notificationKeys.all);
      queryClient.setQueryData<AppNotification[]>(notificationKeys.all, (current) =>
        current?.map((notification) => ({ ...notification, read: true })),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(notificationKeys.all, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
