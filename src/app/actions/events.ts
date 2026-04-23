"use server";

import { auth } from "@/auth";
import { parseEventDateInput } from "@/lib/event-dates";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM (24-hour)"),
  durationMinutes: z.coerce.number().int().positive(),
  location: z.string().min(1, "Location is required"),
  budget: z.coerce.number().min(0).default(0),
  amenities: z.string().optional(),
  description: z.string().optional(),
});

async function requireOrganizer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "organizer") {
    throw new Error("Unauthorized");
  }
  return session;
}

function parseAmenities(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(/[,;\n]/)
    .map((a) => a.trim())
    .filter(Boolean);
}

export type EventActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createEvent(
  _prev: EventActionState | undefined,
  formData: FormData,
): Promise<EventActionState> {
  await requireOrganizer();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  await connectDB();
  const session = await auth();
  const doc = await Event.create({
    title: parsed.data.title,
    type: parsed.data.type,
    date: parseEventDateInput(parsed.data.date),
    startTime: parsed.data.startTime,
    durationMinutes: parsed.data.durationMinutes,
    location: parsed.data.location,
    budget: parsed.data.budget,
    amenities: parseAmenities(parsed.data.amenities),
    description: parsed.data.description ?? "",
    createdByEmail: session?.user?.email ?? undefined,
  });
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect(`/dashboard/events/${String(doc._id)}/edit`);
}

export async function updateEvent(
  eventId: string,
  _prev: EventActionState | undefined,
  formData: FormData,
): Promise<EventActionState> {
  await requireOrganizer();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  await connectDB();
  const updated = await Event.findByIdAndUpdate(
    eventId,
    {
      title: parsed.data.title,
      type: parsed.data.type,
      date: parseEventDateInput(parsed.data.date),
      startTime: parsed.data.startTime,
      durationMinutes: parsed.data.durationMinutes,
      location: parsed.data.location,
      budget: parsed.data.budget,
      amenities: parseAmenities(parsed.data.amenities),
      description: parsed.data.description ?? "",
    },
    { new: true },
  );
  if (!updated) {
    return { error: "Event not found" };
  }
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${eventId}/edit`);
  revalidatePath(`/events/${eventId}`);
  return {};
}

export async function deleteEvent(eventId: string, _formData?: FormData) {
  await requireOrganizer();
  await connectDB();
  await Event.findByIdAndDelete(eventId);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}
