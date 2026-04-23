"use client";

import {
  addChecklistItem,
  createChecklist,
  type ChecklistActionState,
} from "@/app/actions/checklists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useActionState } from "react";

export function CreateChecklistForm({
  events,
}: {
  events: { id: string; title: string }[];
}) {
  const initial: ChecklistActionState = {};
  const [state, formAction] = useActionState(createChecklist, initial);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-3 rounded-lg border p-4">
      <h2 className="font-medium">New checklist</h2>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Pre-event setup" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="eventId">Link to event (optional)</Label>
        <select
          id="eventId"
          name="eventId"
          defaultValue="none"
          className={cn(
            "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
            "focus-visible:ring-ring outline-none focus-visible:ring-2",
          )}
        >
          <option value="none">General</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
      <Button type="submit">Create checklist</Button>
    </form>
  );
}

export function AddChecklistItemForm({ checklistId }: { checklistId: string }) {
  const initial: ChecklistActionState = {};
  const bound = addChecklistItem.bind(null, checklistId);
  const [state, formAction] = useActionState(bound, initial);

  return (
    <form action={formAction} className="flex flex-wrap gap-2">
      <Input
        name="text"
        placeholder="New item…"
        className="max-w-xs flex-1"
        required
      />
      <Button type="submit" size="sm">
        Add
      </Button>
      {state.error ? (
        <p className="text-destructive w-full text-sm">{state.error}</p>
      ) : null}
    </form>
  );
}
