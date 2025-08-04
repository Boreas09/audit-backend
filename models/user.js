import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    role: {
      required: true,
      type: String,
    },
    publicAddress: {
      required: true,
      type: String,
      unique: true,
    },
    name: {
      required: true,
      type: String,
    },
    customerReportId: {
      required: true,
      type: Array,
    },
    company: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let User = mongoose.models.User || mongoose.model("Users", userSchema);

export default User;
