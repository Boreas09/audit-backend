import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    author: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    auditId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    issueId: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: (value) =>
          mongoose.Types.ObjectId.isValid(value) || typeof value === "string",
        message: "issueId must be either a valid ObjectId or a empty string.",
      },
    },
  },
  { timestamps: true }
);

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
