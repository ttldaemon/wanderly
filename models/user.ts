import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  userName: string;
  email: string;
  imgUrl: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
// userSchema is schema- format in which info is saved
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    imgUrl: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
// User is model used to query DB, models follow userSchema 
export const User = mongoose.models.User || mongoose.model("User", userSchema);
