"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { requestNotificationPermission } from "@/lib/notifications";
import { syncPushSubscription } from "@/lib/push";
import {
  cancelReminder,
  completeReminder,
  createReminder,
  deleteReminder,
  getReminder,
  getReminders,
  updateReminder,
} from "../api/reminders.api";
import type {
  Reminder,
  ReminderListParams,
  ReminderMutationContext,
  ReminderQueryOptions,
  ReminderStatus,
} from "../types";

export const reminderKeys = {
  all: ["reminders"] as const,
  lists: () => ["reminders", "list"] as const,
  list: (params: ReminderListParams = {}) => ["reminders", "list", params.status ?? "all"] as const,
  detail: (id: string) => ["reminders", "detail", id] as const,
};

async function patchLists(
  queryClient: QueryClient,
  update: (reminders: Reminder[]) => Reminder[],
): Promise<ReminderMutationContext> {
  await queryClient.cancelQueries({ queryKey: reminderKeys.lists() });
  const previous = queryClient.getQueriesData<Reminder[]>({ queryKey: reminderKeys.lists() });
  queryClient.setQueriesData<Reminder[]>({ queryKey: reminderKeys.lists() }, (reminders) =>
    reminders ? update(reminders) : reminders,
  );
  return { previous };
}

function restoreLists(queryClient: QueryClient, context: ReminderMutationContext | undefined) {
  context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

function useStatusMutation(mutationFn: (id: string) => Promise<Reminder>, status: ReminderStatus) {
  const queryClient = useQueryClient();
  return useMutation<Reminder, Error, string, ReminderMutationContext>({
    mutationFn,
    onMutate: (id) =>
      patchLists(queryClient, (reminders) =>
        reminders.map((reminder) => (reminder.id === id ? { ...reminder, status } : reminder)),
      ),
    onError: (_error, _id, context) => restoreLists(queryClient, context),
    onSuccess: (reminder) => queryClient.setQueryData(reminderKeys.detail(reminder.id), reminder),
    onSettled: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  });
}

export function useReminders(params: ReminderListParams = {}, options: ReminderQueryOptions = {}) {
  return useQuery({
    queryKey: reminderKeys.list(params),
    queryFn: ({ signal }) => getReminders(params, signal),
    refetchInterval: options.refetchInterval,
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: ({ signal }) => getReminder(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReminder,
    onMutate: () => {
      void requestNotificationPermission().then((permission) => {
        if (permission === "granted") void syncPushSubscription();
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReminder,
    onSuccess: (reminder) => {
      queryClient.setQueryData(reminderKeys.detail(reminder.id), reminder);
      return queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useCompleteReminder() {
  return useStatusMutation(completeReminder, "completed");
}

export function useCancelReminder() {
  return useStatusMutation(cancelReminder, "cancelled");
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, ReminderMutationContext>({
    mutationFn: deleteReminder,
    onMutate: (id) =>
      patchLists(queryClient, (reminders) => reminders.filter((reminder) => reminder.id !== id)),
    onError: (_error, _id, context) => restoreLists(queryClient, context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  });
}
