import express from "express";
import Scope from "../models/scope.js";
import Audit from "../models/audit.js";
import User from "../models/user.js";
import Company from "../models/company.js";
import mongodb from "../db/mongoDatabase.js";
import { validationResult } from "express-validator";
import {
  authenticateUser,
  requireRole,
  validateObjectId
} from "../validations/auditValidations.js";
import {
  scopeValidationRules,
  rejectionValidationRules
} from "../validations/scopeValidations.js";

const router = express.Router();

// Middleware to connect to the database
const connectDbMiddleware = async (req, res, next) => {
  try {
    await mongodb.connect();
    next();
  } catch (error) {
    return res.status(500).json({ message: "Database connection failed" });
  }
};

// POST /scope/create - Client company creates scope
router.post(
  "/create",
  connectDbMiddleware,
  scopeValidationRules, // Validate scope data
  authenticateUser, // StarkNet signature verification
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { scopeData } = req.body;
      const user = req.user; // Set by authenticateUser

      // Verify user is from client company
      if (user.role !== 'client') {
        return res.status(403).json({ message: "Only client users can create scopes" });
      }

      // Verify user's company exists and is client type
      const clientCompany = await Company.findById(user.companyId);
      if (!clientCompany || clientCompany.role !== 'client') {
        return res.status(400).json({ message: "User must belong to a client company" });
      }

      // Verify auditor company exists and is auditor type
      const auditorCompany = await Company.findById(scopeData.auditorCompanyId);
      if (!auditorCompany || auditorCompany.role !== 'auditor') {
        return res.status(400).json({ message: "Invalid auditor company" });
      }

      // Create scope
      const scope = new Scope({
        ...scopeData,
        clientCompanyId: user.companyId,
        createdBy: user._id,
        status: 'pending'
      });

      await scope.save();

      return res.status(201).json({
        message: "Scope created successfully",
        scope
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// POST /scope/:scopeId/approve - Auditor company approves scope
router.post(
  "/:scopeId/approve",
  connectDbMiddleware,
  validateObjectId("scopeId"),
  authenticateUser,
  async (req, res) => {
    try {
      const { scopeId } = req.params;
      const user = req.user;

      // Verify user is from auditor company
      if (user.role !== 'auditor') {
        return res.status(403).json({ message: "Only auditor users can approve scopes" });
      }

      // Find scope
      const scope = await Scope.findById(scopeId);
      if (!scope) {
        return res.status(404).json({ message: "Scope not found" });
      }

      // Verify scope is pending
      if (scope.status !== 'pending') {
        return res.status(400).json({ message: "Scope is not pending approval" });
      }

      // Verify user belongs to target auditor company
      if (user.companyId.toString() !== scope.auditorCompanyId.toString()) {
        return res.status(403).json({ message: "You can only approve scopes assigned to your company" });
      }

      // Update scope status
      scope.status = 'approved';
      scope.approvedBy = user._id;
      scope.approvalDate = new Date();
      await scope.save();

      // Auto-create audit
      const audit = await createAuditFromScope(scope);

      // Update scope with audit reference
      scope.status = 'audit_created';
      scope.auditId = audit._id;
      await scope.save();

      return res.status(200).json({
        message: "Scope approved and audit created successfully",
        scope,
        audit
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// POST /scope/:scopeId/reject - Auditor company rejects scope
router.post(
  "/:scopeId/reject",
  connectDbMiddleware,
  validateObjectId("scopeId"),
  rejectionValidationRules, // Validate rejection reason
  authenticateUser,
  async (req, res) => {
    try {
      const { scopeId } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rejectionReason } = req.body;
      const user = req.user;

      // Verify user is from auditor company
      if (user.role !== 'auditor') {
        return res.status(403).json({ message: "Only auditor users can reject scopes" });
      }

      // Find scope
      const scope = await Scope.findById(scopeId);
      if (!scope) {
        return res.status(404).json({ message: "Scope not found" });
      }

      // Verify scope is pending
      if (scope.status !== 'pending') {
        return res.status(400).json({ message: "Scope is not pending approval" });
      }

      // Verify user belongs to target auditor company
      if (user.companyId.toString() !== scope.auditorCompanyId.toString()) {
        return res.status(403).json({ message: "You can only reject scopes assigned to your company" });
      }

      // Update scope status
      scope.status = 'rejected';
      scope.approvedBy = user._id; // Track who rejected
      scope.approvalDate = new Date();
      scope.rejectionReason = rejectionReason;
      await scope.save();

      return res.status(200).json({
        message: "Scope rejected successfully",
        scope
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /scope/ - Get all scopes (admin only)
router.get(
  "/",
  connectDbMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const scopes = await Scope.find()
        .populate('clientCompanyId', 'companyName')
        .populate('auditorCompanyId', 'companyName')
        .populate('createdBy', 'name')
        .populate('approvedBy', 'name');

      return res.status(200).json(scopes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /scope/company/:companyId - Get scopes by company
router.get(
  "/company/:companyId",
  connectDbMiddleware,
  validateObjectId("companyId"),
  requireRole(['admin', 'auditor', 'client']),
  async (req, res) => {
    try {
      const { companyId } = req.params;

      // Find scopes where company is either client or auditor
      const scopes = await Scope.find({
        $or: [
          { clientCompanyId: companyId },
          { auditorCompanyId: companyId }
        ]
      })
        .populate('clientCompanyId', 'companyName')
        .populate('auditorCompanyId', 'companyName')
        .populate('createdBy', 'name')
        .populate('approvedBy', 'name');

      return res.status(200).json(scopes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /scope/pending - Get pending scopes
router.get(
  "/pending",
  connectDbMiddleware,
  requireRole(['admin', 'auditor']),
  async (req, res) => {
    try {
      const scopes = await Scope.find({ status: 'pending' })
        .populate('clientCompanyId', 'companyName')
        .populate('auditorCompanyId', 'companyName')
        .populate('createdBy', 'name');

      return res.status(200).json(scopes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// GET /scope/:scopeId - Get single scope
router.get(
  "/:scopeId",
  connectDbMiddleware,
  validateObjectId("scopeId"),
  requireRole(['admin', 'auditor', 'client']),
  async (req, res) => {
    try {
      const { scopeId } = req.params;

      const scope = await Scope.findById(scopeId)
        .populate('clientCompanyId', 'companyName')
        .populate('auditorCompanyId', 'companyName')
        .populate('createdBy', 'name')
        .populate('approvedBy', 'name')
        .populate('auditId');

      if (!scope) {
        return res.status(404).json({ message: "Scope not found" });
      }

      return res.status(200).json(scope);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// Helper function to create audit from approved scope
async function createAuditFromScope(scope) {
  try {
    // Create audit with scope data
    const audit = new Audit({
      status: 'Draft',
      scope: [scope.repo || scope.protocol], // Add repo or protocol to scope array
      summary: {
        protocol: scope.protocol,
        website: scope.website,
        description: scope.description,
        cairoVer: scope.cairoVer,
        finalReportDate: '',
        repo: scope.repo,
        initialCommit: scope.initialCommit,
        finalCommit: '',
        docs: scope.docs,
        testSuiteAssesment: ''
      },
      issues: {
        critical: [],
        high: [],
        medium: [],
        low: [],
        info: [],
        bestPractices: []
      },
      test: {
        compilation: '',
        tests: ''
      }
    });

    await audit.save();
    
    // Update company reportIds if needed
    await Company.findByIdAndUpdate(
      scope.clientCompanyId,
      { $addToSet: { companyReportId: audit._id } }
    );
    
    await Company.findByIdAndUpdate(
      scope.auditorCompanyId,
      { $addToSet: { companyReportId: audit._id } }
    );

    // Update user reportIds
    const createdByUser = await User.findById(scope.createdBy);
    if (createdByUser) {
      await User.findByIdAndUpdate(
        scope.createdBy,
        { $addToSet: { customerReportId: audit._id } }
      );
    }

    const approvedByUser = await User.findById(scope.approvedBy);
    if (approvedByUser) {
      await User.findByIdAndUpdate(
        scope.approvedBy,
        { $addToSet: { customerReportId: audit._id } }
      );
    }

    return audit;
  } catch (error) {
    console.error('Error creating audit from scope:', error);
    throw error;
  }
}

export default router;