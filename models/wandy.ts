import { Document, model, models, Schema } from "mongoose";

export interface IWandy extends Document {
  userId: Schema.Types.ObjectId,
  imgUrls: string[];
  caption: string;
  location: string;
  tags: string[];
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const wandySchema = new Schema<IWandy>(
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


export const Wandy = models.Wandy || model("Wandy", wandySchema)