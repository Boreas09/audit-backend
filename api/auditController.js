import express from "express";
import Audit from "../models/audit.js";
import mongodb from "../db/mongoDatabase.js";
import { validationResult } from "express-validator";
import {
  auditValidationRules,
  validateObjectId
} from "../validations/auditValidations.js";
import { requireRole, authenticateUser } from "../validations/validations.js";

const router = express.Router();

// Middleware to connect to the database
const connectDbMiddleware = async (req, res, next) => {
  try {
    await mongodb.connect(); // Ensure MongoDB is connected
    next();
  } catch (error) {
    return res.status(500).json({ message: "Database connection failed" });
  }
};

// GET /audit/ - Get all audits (admin only)
router.get(
  "/",
  connectDbMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const audits = await Audit.find();
      return res.status(200).json(audits);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /audit/:id - Get audit by ID (any user)
router.get(
  "/:id",
  connectDbMiddleware,
  requireRole(['admin', 'auditor', 'client']),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const audit = await Audit.findById(id);

      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }

      return res.status(200).json(audit);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /audit/company/:companyId - Get audits by company
router.get(
  "/company/:companyId",
  connectDbMiddleware,
  requireRole(['admin', 'auditor', 'client']),
  validateObjectId("companyId"),
  async (req, res) => {
    try {
      const { companyId } = req.params;

      // Find audits where users from this company are involved
      const audits = await Audit.find().populate({
        path: 'customerReportId',
        match: { companyId: companyId }
      });

      return res.status(200).json(audits);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /audit/user/:userId - Get audits by user
router.get(
  "/user/:userId",
  connectDbMiddleware,
  requireRole(['admin', 'auditor', 'client']),
  validateObjectId("userId"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Find audits where this user is referenced in customerReportId
      const audits = await Audit.find({
        $or: [
          { 'customerReportId': userId }
        ]
      });

      return res.status(200).json(audits);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /audit/user/:userId/company/:companyId - Get audits by user and company
router.get(
  "/user/:userId/company/:companyId",
  connectDbMiddleware,
  requireRole(['admin', 'auditor', 'client']),
  validateObjectId("userId"),
  validateObjectId("companyId"),
  async (req, res) => {
    try {
      const { userId, companyId } = req.params;

      // Find audits where the user is involved AND belongs to the specified company
      const audits = await Audit.find().populate({
        path: 'customerReportId',
        match: {
          _id: userId,
          companyId: companyId
        }
      });

      return res.status(200).json(audits);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /audit/search/:name - Search audits by protocol name
router.get(
  "/search/:name",
  requireRole(['admin', 'auditor', 'client']),
  connectDbMiddleware,
  async (req, res) => {
    try {
      const { name } = req.params;

      // Search by protocol name (case insensitive)
      const audits = await Audit.find({
        'summary.protocol': { $regex: name, $options: 'i' }
      });

      return res.status(200).json(audits);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
