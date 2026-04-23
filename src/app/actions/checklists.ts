"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Checklist } from "@/models/Checklist";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

async function requireOrganizer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "organizer") {
    throw new Error("Unauthorized");
  }
  return session;
}

export type ChecklistActionState = { error?: string };

export async function createChecklist(
  _prev: ChecklistActionState | undefined,
  formData: FormData,
): Promise<ChecklistActionState> {
  await requireOrganizer();
  const session = await auth();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required" };

  const eventRaw = formData.get("eventId");
  const eventStr =
    eventRaw && String(eventRaw) !== "none" ? String(eventRaw).trim() : "";
  const eventId =
    eventStr && mongoose.isValidObjectId(eventStr)
      ? new mongoose.Types.ObjectId(eventStr)
      : null;

  await connectDB();
  await Checklist.create({
    title,
    eventId,
    items: [],
    assignedByEmail: session?.user?.email ?? undefined,
  });
  revalidatePath("/dashboard/checklists");
  revalidatePath("/dashboard");
  return {};
}

export async function addChecklistItem(
  checklistId: string,
  _prev: ChecklistActionState | undefined,
  formData: FormData,
): Promise<ChecklistActionState> {
  await requireOrganizer();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Item text is required" };
  await connectDB();
  const c = await Checklist.findById(checklistId);
  if (!c) return { error: "Checklist not found" };
  c.items.push({ text, done: false });
  await c.save();
  revalidatePath("/dashboard/checklists");
  revalidatePath("/dashboard");
  return {};
}

export async function toggleChecklistItem(
  checklistId: string,
  itemId: string,
  _formData?: FormData,
) {
  await requireOrganizer();
  await connectDB();
  const c = await Checklist.findById(checklistId);
  if (!c) return;
  const item = c.items.id(itemId);
  if (item) {
    item.done = !item.done;
    await c.save();
  }
  revalidatePath("/dashboard/checklists");
  revalidatePath("/dashboard");
}

export async function deleteChecklistItem(
  checklistId: string,
  itemId: string,
  _formData?: FormData,
) {
  await requireOrganizer();
  await connectDB();
  await Checklist.updateOne(
    { _id: checklistId },
    { $pull: { items: { _id: itemId } } },
  );
  revalidatePath("/dashboard/checklists");
  revalidatePath("/dashboard");
}

export async function deleteChecklist(
  checklistId: string,
  _formData?: FormData,
) {
  await requireOrganizer();
  await connectDB();
  await Checklist.findByIdAndDelete(checklistId);
  revalidatePath("/dashboard/checklists");
  revalidatePath("/dashboard");
}
