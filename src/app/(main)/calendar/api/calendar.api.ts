import { ENDPOINTS, httpClient } from "@/lib/http";
import type {
  CalendarEvent,
  CalendarRange,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "../types";

export function getCalendarEvents(range: CalendarRange, signal?: AbortSignal) {
  return httpClient.get<CalendarEvent[]>(ENDPOINTS.calendar.events, { params: { ...range }, signal });
}

export function getCalendarEvent(id: string, signal?: AbortSignal) {
  return httpClient.get<CalendarEvent>(ENDPOINTS.calendar.eventById(id), { signal });
}

export function createCalendarEvent(input: CreateCalendarEventInput) {
  return httpClient.post<CalendarEvent, CreateCalendarEventInput>(ENDPOINTS.calendar.events, input);
}

export function updateCalendarEvent({ id, ...input }: UpdateCalendarEventInput) {
  return httpClient.patch<CalendarEvent>(ENDPOINTS.calendar.eventById(id), input);
}

export function deleteCalendarEvent(id: string) {
  return httpClient.delete(ENDPOINTS.calendar.eventById(id));
}
