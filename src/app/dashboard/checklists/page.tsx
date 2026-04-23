import {
  deleteChecklist,
  deleteChecklistItem,
  toggleChecklistItem,
} from "@/app/actions/checklists";
import {
  AddChecklistItemForm,
  CreateChecklistForm,
} from "@/components/checklist-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Circle } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { Checklist } from "@/models/Checklist";
import { Event } from "@/models/Event";
import type { Types } from "mongoose";

type Item = { _id: Types.ObjectId; text: string; done: boolean };

export default async function ChecklistsPage() {
  await connectDB();
  const [lists, eventsRaw] = await Promise.all([
    Checklist.find()
      .sort({ updatedAt: -1 })
      .populate<{ eventId: { title: string } | null }>("eventId", "title")
      .lean(),
    Event.find().sort({ date: 1 }).select("title").lean(),
  ]);

  const events = eventsRaw.map((e) => ({
    id: String((e as { _id: Types.ObjectId })._id),
    title: (e as { title: string }).title,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Checklists</h1>
        <p className="text-muted-foreground text-sm">
          Team tasks — optionally scoped to an event.
        </p>
      </div>

      <CreateChecklistForm events={events} />

      <div className="grid gap-6">
        {lists.length === 0 ? (
          <p className="text-muted-foreground text-sm">No checklists yet.</p>
        ) : (
          lists.map((raw) => {
            const c = raw as {
              _id: Types.ObjectId;
              title: string;
              eventId: { title: string } | null;
              items: Item[];
            };
            const id = String(c._id);
            return (
              <Card key={id}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2 pt-1">
                      {c.eventId ? (
                        <Badge variant="secondary">{c.eventId.title}</Badge>
                      ) : (
                        <Badge variant="outline">General</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <form action={deleteChecklist.bind(null, id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      Delete list
                    </Button>
                  </form>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AddChecklistItemForm checklistId={id} />
                  <ul className="space-y-2">
                    {c.items.length === 0 ? (
                      <li className="text-muted-foreground text-sm">No items.</li>
                    ) : (
                      c.items.map((item) => {
                        const itemId = String(item._id);
                        return (
                          <li
                            key={itemId}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <form
                                action={toggleChecklistItem.bind(
                                  null,
                                  id,
                                  itemId,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="hover:bg-accent/50 flex items-center gap-2 rounded-md py-1 pr-2 text-left text-sm"
                                >
                                  {item.done ? (
                                    <Check className="text-primary size-4 shrink-0" />
                                  ) : (
                                    <Circle className="text-muted-foreground size-4 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      item.done
                                        ? "text-muted-foreground line-through"
                                        : ""
                                    }
                                  >
                                    {item.text}
                                  </span>
                                </button>
                              </form>
                            </div>
                            <form
                              action={deleteChecklistItem.bind(
                                null,
                                id,
                                itemId,
                              )}
                            >
                              <Button type="submit" variant="ghost" size="sm">
                                Remove
                              </Button>
                            </form>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
