import { body, validationResult } from "express-validator"; // For validation

// NEED IMPROVEMENT

export const auditValidationRules = [
  body("summary").notEmpty().withMessage("Summary is required."),
  body("summary.protocol").isString().withMessage("Protocol must be a string."),
  body("summary.website").isString().withMessage("Website must be a string."),
  body("scope").isArray().withMessage("Scope needs to be an array"),
];
