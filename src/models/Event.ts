import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    budget: { type: Number, default: 0 },
    amenities: [{ type: String }],
    description: { type: String, default: "" },
    createdByEmail: { type: String },
  },
  { timestamps: true },
);

eventSchema.index({ date: 1 });

export type EventDoc = InferSchemaType<typeof eventSchema>;

export const Event: Model<EventDoc> =
  mongoose.models.Event ?? mongoose.model<EventDoc>("Event", eventSchema);
