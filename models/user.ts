import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
  name: string,
  email: string,
  password: string,
  createdAt: Date
  
}

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true
  }, 
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
}, {timestamps: true})


export const User = mongoose.models.User as mongoose.Model<IUser> || mongoose.model("User", userSchema)