"use client";

import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

type CalEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: { id: string };
};

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: enUS }),
  getDay,
  locales,
});

export function EventsCalendar({
  events,
}: {
  events: { id: string; title: string; start: string; end: string }[];
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("month");

  const calEvents: CalEvent[] = useMemo(
    () =>
      events.map((e) => ({
        title: e.title,
        start: new Date(e.start),
        end: new Date(e.end),
        resource: { id: e.id },
      })),
    [events],
  );

  const [date, setDate] = useState<Date>(() =>
    events.length > 0 ? new Date(events[0]!.start) : new Date(),
  );

  return (
    <div className="bg-card text-card-foreground h-[560px] rounded-lg border p-2">
      <Calendar
        localizer={localizer}
        culture="en-US"
        date={date}
        onNavigate={setDate}
        events={calEvents}
        view={view}
        onView={setView}
        views={["month", "week", "agenda"]}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        onSelectEvent={(ev) => {
          router.push(`/events/${ev.resource.id}`);
        }}
      />
    </div>
  );
}
