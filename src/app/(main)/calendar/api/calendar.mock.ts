import { ENDPOINTS, mockError, mockReply, type MockRoute } from "@/lib/http";
import { mockDateTime, mockId, patchById, removeById } from "@/mocks/utils";
import type { CalendarEvent, CreateCalendarEventInput, UpdateCalendarEventInput } from "../types";

export const eventsDb: CalendarEvent[] = [
  { id: "evt_1", title: "Project Meeting", description: "Roadmap review with the team.", start: mockDateTime(0, "10:00"), end: mockDateTime(0, "11:00"), allDay: false, location: "https://meet.google.com/abc-defg-hij", color: "primary" },
  { id: "evt_2", title: "Lunch with Sara", start: mockDateTime(0, "13:30"), end: mockDateTime(0, "14:30"), allDay: false, location: "Zamalek" },
  { id: "evt_3", title: "Design review", start: mockDateTime(1, "12:00"), end: mockDateTime(1, "13:00"), allDay: false, location: "https://zoom.us/j/123456" },
  { id: "evt_4", title: "Gym", start: mockDateTime(2, "18:00"), end: mockDateTime(2, "19:00"), allDay: false },
  { id: "evt_5", title: "Family day", start: mockDateTime(5, "00:00"), end: mockDateTime(5, "23:59"), allDay: true },
  { id: "evt_6", title: "Quarterly planning", start: mockDateTime(9, "09:00"), end: mockDateTime(9, "12:00"), allDay: false },
  { id: "evt_7", title: "Dentist", start: mockDateTime(-3, "16:00"), end: mockDateTime(-3, "16:45"), allDay: false },
];

function inRange(event: CalendarEvent, from: string | null, to: string | null) {
  const day = event.start.slice(0, 10);
  return (!from || day >= from) && (!to || day <= to);
}

export const calendarMock: MockRoute[] = [
  {
    method: "GET",
    path: ENDPOINTS.calendar.events,
    handler: ({ query }) => {
      const events = eventsDb
        .filter((event) => inRange(event, query.get("from"), query.get("to")))
        .sort((a, b) => a.start.localeCompare(b.start));
      return mockReply(events);
    },
  },
  {
    method: "GET",
    path: ENDPOINTS.calendar.eventById(":id"),
    handler: ({ params }) => {
      const event = eventsDb.find((item) => item.id === params.id);
      return event ? mockReply(event) : mockError(404, "Event not found");
    },
  },
  {
    method: "POST",
    path: ENDPOINTS.calendar.events,
    handler: ({ body }) => {
      const event: CalendarEvent = { allDay: false, ...(body as CreateCalendarEventInput), id: mockId("evt") };
      eventsDb.push(event);
      return mockReply(event, 201);
    },
  },
  {
    method: "PATCH",
    path: ENDPOINTS.calendar.eventById(":id"),
    handler: ({ params, body }) => {
      const event = patchById(eventsDb, params.id, body as Omit<UpdateCalendarEventInput, "id">);
      return event ? mockReply(event) : mockError(404, "Event not found");
    },
  },
  {
    method: "DELETE",
    path: ENDPOINTS.calendar.eventById(":id"),
    handler: ({ params }) => (removeById(eventsDb, params.id) ? mockReply(null, 204) : mockError(404, "Event not found")),
  },
];
