import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
  name: string,
  userName: string,
  email: string,
  imgUrl: string,
  password: string,
  createdAt: Date,
  updatedAt: Date
  
}

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  imgUrl: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
}, {timestamps: true})


export const User = mongoose.models.User || mongoose.model("User", userSchema)