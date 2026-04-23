import { EventsCalendar } from "@/components/events-calendar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connectDB } from "@/lib/mongodb";
import { serializeEvent } from "@/lib/serialize-event";
import { Event } from "@/models/Event";
import type { EventDoc } from "@/models/Event";
import type { Types } from "mongoose";
import { format } from "date-fns";
import Link from "next/link";

export default async function HomePage() {
  await connectDB();
  const raw = await Event.find().sort({ date: 1 }).lean();
  const events = raw.map((e) =>
    serializeEvent(e as EventDoc & { _id: Types.ObjectId }),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Unity meetup</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Upcoming events and calendar. Organizers can sign in to manage events,
          feedback CSVs, and team checklists.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <EventsCalendar
          events={events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.calendar.start,
            end: e.calendar.end,
          }))}
        />
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Next meetups</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events yet.</p>
            ) : (
              events.slice(0, 8).map((ev) => {
                return (
                  <div
                    key={ev.id}
                    className="hover:bg-accent/50 flex flex-col gap-1 rounded-md border p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{ev.title}</span>
                      <Badge variant="secondary">{ev.type}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(ev.calendar.start), "PPP p")} ·{" "}
                      {ev.durationMinutes} min · {ev.location}
                    </p>
                    <Link
                      href={`/events/${ev.id}`}
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "h-auto p-0",
                      )}
                    >
                      Details
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
