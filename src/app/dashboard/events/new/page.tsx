import { CreateEventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
        <p className="text-muted-foreground text-sm">
          Day, time, duration, location, budget, amenities, and type.
        </p>
      </div>
      <CreateEventForm />
    </div>
  );
}
