export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  color?: string;
}

export interface CalendarRange {
  from: string;
  to: string;
}

export type CreateCalendarEventInput = Omit<CalendarEvent, "id" | "allDay"> & Partial<Pick<CalendarEvent, "allDay">>;

export type UpdateCalendarEventInput = Pick<CalendarEvent, "id"> & Partial<Omit<CalendarEvent, "id">>;
