import { model, models, Schema } from "mongoose";

export interface ITour {
  userId: Schema.Types.ObjectId;
  imgUrls: string[];
  caption: string;
  location: string;
  tags: string[];
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const tourSchema = new Schema<ITour>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imgUrls: { type: [String], required: true },
    caption: { type: String, required: true },
    location: { type: String, required: true },
    tags: { type: [String], required: true },
    visibility: { type: String, enum: ["public", "private"], required: true },
  },
  { timestamps: true },
);

export const Tour = models.Tour || model("Tour", tourSchema);
