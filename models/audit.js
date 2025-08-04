import mongoose, { Schema } from "mongoose";

const issueSchema = new Schema(
  {
    title: String,
    files: Array,
    description: String,
    recommendation: String,
    status: String,
    clientUpdate: String,
    code: String,
  },
  { timestamps: true }
);

const summarySchema = new Schema(
  {
    protocol: String,
    website: String,
    description: String,
    cairoVer: String,
    finalReportDate: String,
    repo: String,
    initialCommit: String,
    finalCommit: String,
    docs: String,
    testSuiteAssesment: String,
  },
  { timestamps: true }
);

const testSchema = new Schema(
  {
    compilation: String,
    tests: String,
  },
  { timestamps: true }
);

const auditSchema = new Schema(
  {
    status: String,
    scope: Array,
    summary: summarySchema,
    issues: {
      critical: [issueSchema],
      high: [issueSchema],
      medium: [issueSchema],
      low: [issueSchema],
      info: [issueSchema],
      bestPractices: [issueSchema],
    },
    test: testSchema,
  },
  {
    timestamps: true,
  }
);

let Audit = mongoose.models.Audit || mongoose.model("Audit", auditSchema);

export default Audit;
