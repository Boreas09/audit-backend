import { body, validationResult } from "express-validator";
import { verifySignature } from "../utils/verifySignature.js";
import User from "../models/user.js";
import mongoose from "mongoose";

// Authentication middleware for POST requests only
export const authenticateUser = async (req, res, next) => {
  try {
    const { signedMessage, publicAddress, signData } = req.body;

    if (!signedMessage || !publicAddress || !signData) {
      return res.status(401).json({
        message: "Missing authentication data: signedMessage, publicAddress, and signData required"
      });
    }

    // Verify StarkNet signature
    const isValidSignature = await verifySignature(publicAddress, signData, signedMessage);
    if (!isValidSignature) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Find user by public address
    const user = await User.findOne({ publicAddress });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};

// General role-based access control using public address from headers
export const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const publicAddress = req.headers['x-public-address'];

      if (!publicAddress) {
        return res.status(401).json({ message: "Public address required in headers (x-public-address)" });
      }

      const user = await User.findOne({ publicAddress });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Handle multiple roles (for auditor or admin case)
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!allowedRoles.includes(user.role)) {
        const roleText = allowedRoles.join(' or ');
        return res.status(403).json({ message: `Access denied. ${roleText} role required` });
      }

      req.user = user; // Set user for downstream use
      next();
    } catch (error) {
      return res.status(500).json({ message: "Authentication failed", error: error.message });
    }
  };
};


// Comprehensive audit validation rules
export const auditValidationRules = [
  // Status validation
  body("status")
    .isIn(['Draft', 'In Progress', 'Completed'])
    .withMessage("Status must be one of: Draft, In Progress, Completed"),

  // Scope validation
  body("scope")
    .isArray()
    .withMessage("Scope must be an array")
    .custom((value) => {
      if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
        throw new Error("Scope must be an array of strings");
      }
      return true;
    }),

  // Summary validation
  body("summary").isObject().withMessage("Summary must be an object"),
  body("summary.protocol")
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("Protocol name must be a string between 1-100 characters"),
  body("summary.website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),
  body("summary.description")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Description must be a string with max 1000 characters"),
  body("summary.cairoVer")
    .optional()
    .isString()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage("Cairo version must be in format x.y.z"),
  body("summary.finalReportDate")
    .optional()
    .isISO8601()
    .withMessage("Final report date must be a valid ISO date"),
  body("summary.repo")
    .optional()
    .isURL()
    .withMessage("Repository must be a valid URL"),
  body("summary.initialCommit")
    .optional()
    .isString()
    .matches(/^[a-f0-9]{7,40}$/)
    .withMessage("Initial commit must be a valid Git commit hash"),
  body("summary.finalCommit")
    .optional()
    .isString()
    .matches(/^[a-f0-9]{7,40}$/)
    .withMessage("Final commit must be a valid Git commit hash"),
  body("summary.docs")
    .optional()
    .isURL()
    .withMessage("Documentation must be a valid URL"),
  body("summary.testSuiteAssesment")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Test suite assessment must be a string with max 500 characters"),

  // Test validation
  body("test").optional().isObject().withMessage("Test must be an object"),
  body("test.compilation")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Compilation info must be a string with max 1000 characters"),
  body("test.tests")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Tests info must be a string with max 1000 characters"),

  // Issues validation
  body("issues").optional().isObject().withMessage("Issues must be an object"),
  body("issues.critical").optional().isArray().withMessage("Critical issues must be an array"),
  body("issues.high").optional().isArray().withMessage("High issues must be an array"),
  body("issues.medium").optional().isArray().withMessage("Medium issues must be an array"),
  body("issues.low").optional().isArray().withMessage("Low issues must be an array"),
  body("issues.info").optional().isArray().withMessage("Info issues must be an array"),
  body("issues.bestPractices").optional().isArray().withMessage("Best practices must be an array"),
];

// Issue validation for nested issue objects
export const validateIssue = [
  body("*.title")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Issue title must be a string between 1-200 characters"),
  body("*.files")
    .optional()
    .isArray()
    .withMessage("Files must be an array"),
  body("*.description")
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage("Description must be a string with max 2000 characters"),
  body("*.recommendation")
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage("Recommendation must be a string with max 2000 characters"),
  body("*.status")
    .optional()
    .isIn(['Open', 'Fixed', 'Acknowledged'])
    .withMessage("Status must be one of: Open, Fixed, Acknowledged"),
  body("*.clientUpdate")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Client update must be a string with max 1000 characters"),
  body("*.code")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("Code must be a string with max 5000 characters"),
];

// ObjectId validation helper
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${paramName}: must be a valid ObjectId` });
    }
    next();
  };
};
