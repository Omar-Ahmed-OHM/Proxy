"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../api/settings.api";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: ({ signal }) => getSettings(signal) });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (settings) => queryClient.setQueryData(settingsKeys.all, settings),
  });
}
