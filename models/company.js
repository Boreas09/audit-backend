import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    role: {
      required: true,
      type: String,
      enum: ['client', 'auditor'],
    },
    companyName: {
      required: true,
      type: String,
      unique: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [25, 'Name must be at most 25 characters long'],
    },
    companyReportId: {
      required: true,
      type: [Schema.Types.ObjectId],
      ref: 'Audits',
    },
    companyManagers: {
      type: [Schema.Types.ObjectId],
      ref: 'Users',
      required: true,
    },
    companyUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'Users',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let Company = mongoose.models.Company || mongoose.model("Companies", companySchema);

export default Company;
