"use client";

import {
  createEvent,
  type EventActionState,
  updateEvent,
} from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="text-destructive mt-1 text-sm" role="alert">
      {errors.join(" ")}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function CreateEventForm() {
  const initial: EventActionState = {};
  const [state, formAction] = useActionState(createEvent, initial);

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <EventFields state={state} />
      <SubmitButton label="Create event" />
    </form>
  );
}

export function EditEventForm({
  eventId,
  defaults,
}: {
  eventId: string;
  defaults: {
    title: string;
    type: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    location: string;
    budget: number;
    amenities: string;
    description: string;
  };
}) {
  const initial: EventActionState = {};
  const boundUpdate = updateEvent.bind(null, eventId);
  const [state, formAction] = useActionState(boundUpdate, initial);

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <EventFields state={state} defaults={defaults} />
      <SubmitButton label="Save changes" />
    </form>
  );
}

function EventFields({
  state,
  defaults,
}: {
  state: EventActionState;
  defaults?: {
    title: string;
    type: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    location: string;
    budget: number;
    amenities: string;
    description: string;
  };
}) {
  const fe = state.fieldErrors;

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={defaults?.title}
        />
        <FieldError errors={fe?.title} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Type of event</Label>
        <Input
          id="type"
          name="type"
          placeholder="e.g. Workshop, Social, Lightning talks"
          required
          defaultValue={defaults?.type}
        />
        <FieldError errors={fe?.type} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Day</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaults?.date}
          />
          <FieldError errors={fe?.date} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="startTime">Start time (24h)</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            required
            defaultValue={defaults?.startTime}
          />
          <FieldError errors={fe?.startTime} />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={defaults?.durationMinutes ?? 120}
          />
          <FieldError errors={fe?.durationMinutes} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            min={0}
            step={1}
            defaultValue={defaults?.budget ?? 0}
          />
          <FieldError errors={fe?.budget} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          required
          defaultValue={defaults?.location}
        />
        <FieldError errors={fe?.location} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amenities">Amenities</Label>
        <Input
          id="amenities"
          name="amenities"
          placeholder="Comma-separated: pizza, drinks, Wi‑Fi"
          defaultValue={defaults?.amenities}
        />
        <FieldError errors={fe?.amenities} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description}
        />
        <FieldError errors={fe?.description} />
      </div>
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
    </>
  );
}
