"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from "../api/calendar.api";
import type { CalendarRange } from "../types";

export const calendarKeys = {
  all: ["calendar-events"] as const,
  range: (range: CalendarRange) => ["calendar-events", "range", range.from, range.to] as const,
  detail: (id: string) => ["calendar-events", "detail", id] as const,
};

export function useCalendarEvents(range: CalendarRange) {
  return useQuery({
    queryKey: calendarKeys.range(range),
    queryFn: ({ signal }) => getCalendarEvents(range, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: calendarKeys.detail(id),
    queryFn: ({ signal }) => getCalendarEvent(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCalendarEvent,
    onSuccess: (event) => {
      queryClient.setQueryData(calendarKeys.detail(event.id), event);
      return queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}
