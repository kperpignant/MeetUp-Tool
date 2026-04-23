"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function CsvUpload({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      toast.error("Choose a CSV file");
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(`/api/feedback/${eventId}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { inserted?: number; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      toast.success(`Imported ${data.inserted ?? 0} row(s)`);
      input.value = "";
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3">
      <div className="grid gap-2">
        <Label htmlFor="file">Feedback CSV</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          disabled={pending}
        />
        <p className="text-muted-foreground text-xs">
          First row = column headers (questions). Each following row = one
          response set.
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload & import"}
      </Button>
    </form>
  );
}
