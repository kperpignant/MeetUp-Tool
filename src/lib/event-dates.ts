import { addMinutes } from "date-fns";

export type EventLike = {
  date: Date;
  startTime: string;
  durationMinutes: number;
};

/** Calendar day stored as UTC midnight YYYY-MM-DD */
export function parseEventDateInput(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function formatEventDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function eventStartEnd(event: EventLike): { start: Date; end: Date } {
  const start = new Date(event.date);
  const [hStr, mStr] = event.startTime.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  start.setUTCHours(h, m, 0, 0);
  const end = addMinutes(start, event.durationMinutes);
  return { start, end };
}
