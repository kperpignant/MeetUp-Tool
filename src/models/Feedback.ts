import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const responseSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const feedbackSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    responses: { type: [responseSchema], default: [] },
    submittedAt: { type: Date, default: () => new Date() },
    source: {
      type: String,
      enum: ["csv", "manual"],
      default: "csv",
    },
  },
  { timestamps: true },
);

export type FeedbackDoc = InferSchemaType<typeof feedbackSchema>;

export const Feedback: Model<FeedbackDoc> =
  mongoose.models.Feedback ??
  mongoose.model<FeedbackDoc>("Feedback", feedbackSchema);
