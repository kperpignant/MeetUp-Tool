import { eventStartEnd, formatEventDateInput } from "@/lib/event-dates";
import type { EventDoc } from "@/models/Event";

export type SerializedEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  location: string;
  budget: number;
  amenities: string[];
  description: string;
  calendar: { start: string; end: string };
};

export function serializeEvent(doc: EventDoc & { _id: unknown }): SerializedEvent {
  const { start, end } = eventStartEnd({
    date: doc.date,
    startTime: doc.startTime,
    durationMinutes: doc.durationMinutes,
  });
  return {
    id: String(doc._id),
    title: doc.title,
    type: doc.type,
    date: formatEventDateInput(doc.date),
    startTime: doc.startTime,
    durationMinutes: doc.durationMinutes,
    location: doc.location,
    budget: doc.budget ?? 0,
    amenities: doc.amenities ?? [],
    description: doc.description ?? "",
    calendar: { start: start.toISOString(), end: end.toISOString() },
  };
}
