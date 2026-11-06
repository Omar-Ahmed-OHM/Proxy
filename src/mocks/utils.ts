const pad = (value: number) => String(value).padStart(2, "0");

export function mockDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function mockDateTime(offsetDays: number, time: string): string {
  return `${mockDate(offsetDays)}T${time}:00`;
}

export function mockTimestamp(offsetMinutes = 0): string {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

export function mockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function patchById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T | null {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...patch, id };
  return items[index];
}

export function removeById<T extends { id: string }>(items: T[], id: string): boolean {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

export function mockFromNow(offsetMinutes: number): { date: string; time: string } {
  const date = new Date(Date.now() + offsetMinutes * 60_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function mockAllDay(offsetDays = 0): string {
  return `${mockDate(offsetDays)}T00:00:00.000Z`;
}

export function mockInstant(offsetDays: number, time: string): string {
  return new Date(mockDateTime(offsetDays, time)).toISOString();
}

export function mockLocalFromNow(offsetMinutes: number, timeZone: string): { instant: string; local: string } {
  const date = new Date(Date.now() + offsetMinutes * 60_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  return { instant: date.toISOString(), local: toZonedLocal(date, timeZone) };
}

export function toZonedLocal(date: Date, timeZone: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}
