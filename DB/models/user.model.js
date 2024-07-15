import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    status: {
        // (online : true , offline:false )
        type: Boolean,
        required: true,
        default: false,
      },
  },
  { timestamps: true }
);
export default mongoose.models.User || model("User", userSchema);
