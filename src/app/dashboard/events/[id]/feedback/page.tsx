import { CsvUpload } from "@/components/csv-upload";
import { FeedbackCharts, type FeedbackRow } from "@/components/feedback-charts";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Feedback } from "@/models/Feedback";
import type { Types } from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const event = await Event.findById(id).lean();
  if (!event) notFound();

  const raw = await Feedback.find({ eventId: id }).sort({ createdAt: -1 }).lean();
  const rows: FeedbackRow[] = raw.map((r) => ({
    id: String((r as { _id: Types.ObjectId })._id),
    responses: (r as { responses: { question: string; answer: string }[] })
      .responses,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground text-sm">
            {(event as { title: string }).title}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/events/${id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "justify-center",
            )}
          >
            Back to event
          </Link>
          <Link
            href={`/events/${id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "justify-center",
            )}
          >
            Public page
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Upload CSV</h2>
        <CsvUpload eventId={id} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Charts</h2>
        <FeedbackCharts rows={rows} />
      </section>
    </div>
  );
}
