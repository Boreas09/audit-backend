import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    role: {
      required: true,
      type: String,
      enum: ['client', 'auditor', 'admin'],
    },
    publicAddress: {
      required: true,
      type: String,
      unique: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Public address must be a valid StarkNet address (66 characters starting with 0x)'
      }
    },
    name: {
      required: true,
      type: String,
      unique: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [25, 'Name must be at most 25 characters long'],
    },
    customerReportId: {
      required: function() {
        return this.role !== 'admin';
      },
      type: [Schema.Types.ObjectId],
      ref: 'Audits',
    },
    companyId: {
      type: Schema.Types.ObjectId,
      required: function() {
        return this.role !== 'admin';
      },
      ref: 'Companies',
    },
  },
  {
    timestamps: true,
  }
);

let User = mongoose.models.User || mongoose.model("Users", userSchema);

export default User;
