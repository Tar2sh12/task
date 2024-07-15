import mongoose from "mongoose";
const { Schema, model } = mongoose;
const taskSchema = new Schema(
  {
    list: [
        {
          type: String,
          default: [],
        },
      ],
    text: {
      type: String,
      default:""
    },
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Category",
    },
    owner:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
  },
  { timestamps: true }
);
export default mongoose.models.Task || model("Task", taskSchema);
