import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Checklist } from "@/models/Checklist";
import { Event } from "@/models/Event";
import type { EventDoc } from "@/models/Event";
import { format, isAfter, startOfDay } from "date-fns";
import type { Types } from "mongoose";
import Link from "next/link";

export default async function DashboardHomePage() {
  await connectDB();
  const today = startOfDay(new Date());
  const rawEvents = await Event.find().sort({ date: 1 }).lean();
  const events = rawEvents.map((e) =>
    serializeEvent(e as EventDoc & { _id: Types.ObjectId }),
  );
  const upcoming = events.filter((e) =>
    isAfter(new Date(e.calendar.end), today),
  );
  const next = upcoming[0];

  const openItems = await Checklist.aggregate<{ count: number }>([
    { $unwind: "$items" },
    { $match: { "items.done": false } },
    { $count: "count" },
  ]);
  const openCount = openItems[0]?.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Next meetup and open checklist items.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next event</CardTitle>
            <CardDescription>Earliest upcoming meetup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {next ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-medium">{next.title}</span>
                  <Badge variant="secondary">{next.type}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(next.calendar.start), "PPP p")} ·{" "}
                  {next.location}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/events/${next.id}/edit`}
                    className={cn(buttonVariants({ size: "sm" }), "justify-center")}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/events/${next.id}/feedback`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "justify-center",
                    )}
                  >
                    Feedback
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No upcoming events.{" "}
                <Link className="text-primary underline" href="/dashboard/events/new">
                  Create one
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklists</CardTitle>
            <CardDescription>Open tasks across all lists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold tabular-nums">{openCount}</p>
            <p className="text-muted-foreground text-sm">items not done</p>
            <Link
              href="/dashboard/checklists"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "justify-center",
              )}
            >
              Manage checklists
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All events</CardTitle>
          <CardDescription>Quick links</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events yet.</p>
          ) : (
            events.map((e) => (
              <Link
                key={e.id}
                href={`/dashboard/events/${e.id}/edit`}
                className="hover:bg-accent flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>{e.title}</span>
                <span className="text-muted-foreground">
                  {format(new Date(e.calendar.start), "MMM d")}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
