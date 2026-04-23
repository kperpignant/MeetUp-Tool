import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const checklistItemSchema = new Schema(
  {
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: true },
);

const checklistSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null,
      index: true,
    },
    title: { type: String, required: true },
    items: { type: [checklistItemSchema], default: [] },
    assignedByEmail: { type: String },
  },
  { timestamps: true },
);

export type ChecklistDoc = InferSchemaType<typeof checklistSchema>;

export const Checklist: Model<ChecklistDoc> =
  mongoose.models.Checklist ??
  mongoose.model<ChecklistDoc>("Checklist", checklistSchema);
