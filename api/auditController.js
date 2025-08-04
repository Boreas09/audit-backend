import express from "express";
import Audit from "../models/audit.js";
import { dbConnect } from "../db/mongoDatabase.js";
import { body, validationResult } from "express-validator";
import { auditValidationRules } from "../validations/auditValidations.js";

const router = express.Router();

// Middleware to connect to the database
const connectDbMiddleware = async (req, res, next) => {
  try {
    await dbConnect(); // Ensure MongoDB is connected
    next();
  } catch (error) {
    return res.status(500).json({ message: "Database connection failed" });
  }
};

// POST route for creating a new Audit document
// router.post(
//   "/postAudit",
//   connectDbMiddleware,
//   auditValidationRules,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const body = req.body; // Parse the request body
//       const audit = new Audit(body); // Create a new Audit document

//       await audit.save(); // Save the new audit to MongoDB
//       return res
//         .status(201)
//         .json({ message: "Audit created successfully", audit });
//     } catch (error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// );

//! audit post method olmayacak, ilk önce client oluşturulacak, sonra client üzerinden id alınarak audit oluşturulacak

// GET route for retrieving all Audit documents with optional filters
router.get("/", connectDbMiddleware, async (req, res) => {
  try {
    const audits = await Audit.find();
    return res.status(200).json(audits);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// GET route for retrieving a specific Audit document by ID
router.get("/:id", connectDbMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const audit = await Audit.findById(id);

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    return res.status(200).json(audit);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// PUT route for updating an existing Audit document by ID
router.put(
  "/:id",
  connectDbMiddleware,
  auditValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params; // Get the ID from the URL parameters
      const updateData = req.body; // Parse the request body for update data

      const updatedAudit = await Audit.findByIdAndUpdate(id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Validate the update against the model schema
      });

      if (!updatedAudit) {
        return res.status(404).json({ message: "Audit not found" });
      }

      return res
        .status(200)
        .json({ message: "Audit updated successfully", audit: updatedAudit });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// DELETE route for deleting an Audit document by ID
router.delete("/:id", connectDbMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters

    const deletedAudit = await Audit.findByIdAndDelete(id);

    if (!deletedAudit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    return res.status(200).json({ message: "Audit deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
