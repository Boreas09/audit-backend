import mongoose, { Schema } from "mongoose";

const scopeSchema = new Schema(
  {
    // Project details
    protocol: {
      type: String,
      required: true,
      minlength: [1, 'Protocol name is required'],
      maxlength: [100, 'Protocol name must be at most 100 characters']
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website must be a valid URL'
      }
    },
    description: {
      type: String,
      maxlength: [1000, 'Description must be at most 1000 characters']
    },
    cairoVer: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d+\.\d+\.\d+$/.test(v);
        },
        message: 'Cairo version must be in format x.y.z'
      }
    },
    repo: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Repository must be a valid URL'
      }
    },
    initialCommit: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[a-f0-9]{7,40}$/.test(v);
        },
        message: 'Initial commit must be a valid Git commit hash'
      }
    },
    docs: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Documentation must be a valid URL'
      }
    },

    // Workflow fields
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'audit_created'],
      default: 'pending',
      required: true
    },
    clientCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Companies',
      required: true
    },
    auditorCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Companies',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users'
    },
    approvalDate: {
      type: Date
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason must be at most 500 characters']
    },
    auditId: {
      type: Schema.Types.ObjectId,
      ref: 'Audits'
    }
  },
  { timestamps: true }
);


let Scope = mongoose.models.Scope || mongoose.model("Scope", scopeSchema);

export default Scope;
