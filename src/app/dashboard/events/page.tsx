import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { connectDB } from "@/lib/mongodb";
import { serializeEvent } from "@/lib/serialize-event";
import { Event } from "@/models/Event";
import type { EventDoc } from "@/models/Event";
import { format } from "date-fns";
import type { Types } from "mongoose";
import Link from "next/link";

export default async function DashboardEventsPage() {
  await connectDB();
  const raw = await Event.find().sort({ date: -1 }).lean();
  const rows = raw.map((e) =>
    serializeEvent(e as EventDoc & { _id: Types.ObjectId }),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-muted-foreground text-sm">
            Create and edit meetups, then attach feedback CSVs.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className={cn(buttonVariants(), "justify-center")}
        >
          New event
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  No events yet.{" "}
                  <Link className="text-primary underline" href="/dashboard/events/new">
                    Create one
                  </Link>
                  .
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>
                    {format(new Date(r.calendar.start), "PPP p")}
                  </TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link
                      href={`/dashboard/events/${r.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "justify-center",
                      )}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/events/${r.id}/feedback`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "justify-center",
                      )}
                    >
                      Feedback
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
