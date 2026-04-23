import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Feedback } from "@/models/Feedback";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "organizer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await ctx.params;
  if (!mongoose.isValidObjectId(eventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  await connectDB();
  const exists = await Event.exists({ _id: eventId });
  if (!exists) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
  const rows = parsed.data.filter((r) => r.some((c) => String(c ?? "").trim()));
  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV needs a header row and at least one data row" },
      { status: 400 },
    );
  }

  const headers = rows[0].map((h) => String(h ?? "").trim());
  const docs = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const responses = headers.map((q, j) => ({
      question: q,
      answer: String(row[j] ?? "").trim(),
    }));
    docs.push({
      eventId: new mongoose.Types.ObjectId(eventId),
      responses,
      source: "csv" as const,
    });
  }

  if (docs.length) {
    await Feedback.insertMany(docs);
  }

  return NextResponse.json({ inserted: docs.length });
}
