import { body } from "express-validator";
import mongoose from "mongoose";

// Scope creation validation rules
export const scopeValidationRules = [
  // Protocol validation
  body("scopeData.protocol")
    .notEmpty()
    .withMessage("Protocol name is required")
    .isString()
    .withMessage("Protocol must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Protocol name must be between 1-100 characters"),

  // Website validation (optional)
  body("scopeData.website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),

  // Description validation (optional)
  body("scopeData.description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  // Cairo version validation (optional)
  body("scopeData.cairoVer")
    .optional()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage("Cairo version must be in format x.y.z"),

  // Repository validation (optional)
  body("scopeData.repo")
    .optional()
    .isURL()
    .withMessage("Repository must be a valid URL"),

  // Initial commit validation (optional)
  body("scopeData.initialCommit")
    .optional()
    .matches(/^[a-f0-9]{7,40}$/)
    .withMessage("Initial commit must be a valid Git commit hash"),

  // Documentation validation (optional)
  body("scopeData.docs")
    .optional()
    .isURL()
    .withMessage("Documentation must be a valid URL"),

  // Auditor company validation
  body("scopeData.auditorCompanyId")
    .notEmpty()
    .withMessage("Auditor company ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Auditor company ID must be a valid ObjectId");
      }
      return true;
    }),
];

// Rejection validation rules
export const rejectionValidationRules = [
  body("rejectionReason")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isString()
    .withMessage("Rejection reason must be a string")
    .isLength({ min: 1, max: 500 })
    .withMessage("Rejection reason must be between 1-500 characters")
    .trim()
];