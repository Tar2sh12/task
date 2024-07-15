import mongoose from "mongoose";
const { Schema, model } = mongoose;
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
  },
  { timestamps: true }
);
export default mongoose.models.Category || model("Category", categorySchema);
