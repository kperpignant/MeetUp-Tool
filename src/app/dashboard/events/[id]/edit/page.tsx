import { deleteEvent } from "@/app/actions/events";
import { EditEventForm } from "@/components/event-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { connectDB } from "@/lib/mongodb";
import { formatEventDateInput } from "@/lib/event-dates";
import { Event } from "@/models/Event";
import type { EventDoc } from "@/models/Event";
import type { Types } from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const doc = await Event.findById(id).lean();
  if (!doc) notFound();
  const e = doc as EventDoc & { _id: Types.ObjectId };

  const defaults = {
    title: e.title,
    type: e.type,
    date: formatEventDateInput(e.date),
    startTime: e.startTime,
    durationMinutes: e.durationMinutes,
    location: e.location,
    budget: e.budget ?? 0,
    amenities: (e.amenities ?? []).join(", "),
    description: e.description ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit event</h1>
          <p className="text-muted-foreground text-sm">{e.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/events/${id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "justify-center",
            )}
          >
            Public page
          </Link>
          <Link
            href={`/dashboard/events/${id}/feedback`}
            className={cn(buttonVariants({ size: "sm" }), "justify-center")}
          >
            Feedback CSV
          </Link>
        </div>
      </div>

      <EditEventForm eventId={id} defaults={defaults} />

      <div className="border-t pt-6">
        <h2 className="text-destructive mb-2 text-sm font-medium">Danger zone</h2>
        <form action={deleteEvent.bind(null, id)}>
          <Button type="submit" variant="destructive" size="sm">
            Delete event
          </Button>
        </form>
      </div>
    </div>
  );
}
