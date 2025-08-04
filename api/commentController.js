import express from "express";
import Comment from "../models/comment.js";
import { dbConnect } from "../db/mongoDatabase.js";
import { validationResult } from "express-validator";
import {
  postCommentValidationRules,
  deleteCommentValidationRules,
  updateCommentValidationRules,
} from "../validations/commentValidations.js";

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

router.post(
  "/postComment",
  connectDbMiddleware,
  postCommentValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, author, auditId, issueId } = req.body;

      const newComment = new Comment({
        content,
        author,
        auditId,
        issueId,
      });

      await newComment.save();

      return res
        .status(201)
        .json({ message: "Comment posted successfully", newComment });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/deleteComment",
  connectDbMiddleware,
  deleteCommentValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const body = req.body; // Parse the request body
      const commentId = { _id: body.commentId };

      const result = await Comment.deleteOne(commentId);
      if (result.deletedCount === 1) {
        res.status(200).send({ message: "Comment deleted successfully" });
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/updateComment",
  connectDbMiddleware,
  updateCommentValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const body = req.body; // Parse the request body
      const commentId = body.commentId;
      // Fields to update
      const updates = {
        content: body.content,
      };

      // Find and update the user by ID
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId, // Query filter (id)
        updates, // Updates to apply
        {
          new: true, // Return the updated document
          runValidators: true, // Ensure validation is run on the update
        }
      );

      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      return res.status(200).json({
        message: "Comment updated successfully",
        comment: updatedComment,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/", connectDbMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find();
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/byAuthor/:authorId", connectDbMiddleware, async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!authorId) {
      return res
        .status(400)
        .json({ message: "'authorId' parameter is required, must be string" });
    }

    const comments = await Comment.find({ author: authorId });
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/byAudit/:auditId", connectDbMiddleware, async (req, res) => {
  try {
    const { auditId } = req.params; // Extract auditId from route parameters

    if (!auditId) {
      return res
        .status(400)
        .json({ message: "'auditId' parameter is required, must be string" });
    }

    const comments = await Comment.find({ auditId: auditId }); // Assuming 'audit' is the field in your model
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/byIssue/:issueId", connectDbMiddleware, async (req, res) => {
  try {
    const { issueId } = req.params;

    if (!issueId) {
      return res
        .status(400)
        .json({ message: "'issueId' parameter is required, must be string" });
    }

    const comments = await Comment.find({ issueId: issueId });
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
