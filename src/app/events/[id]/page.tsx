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
import { format } from "date-fns";
import type { Types } from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await Event.findById(id).lean();
  if (!doc) notFound();
  const ev = serializeEvent(doc as EventDoc & { _id: Types.ObjectId });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{ev.type}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{ev.title}</h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(ev.calendar.start), "PPP p")} ·{" "}
            {ev.durationMinutes} minutes
          </p>
        </div>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
        >
          All events
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Meetup criteria</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div>
            <span className="text-muted-foreground font-medium">Location</span>
            <p className="mt-1">{ev.location}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Budget</span>
            <p className="mt-1">${ev.budget}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Amenities</span>
            <p className="mt-1">
              {ev.amenities.length ? ev.amenities.join(", ") : "—"}
            </p>
          </div>
          {ev.description ? (
            <div>
              <span className="text-muted-foreground font-medium">
                Description
              </span>
              <p className="mt-1 whitespace-pre-wrap">{ev.description}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
