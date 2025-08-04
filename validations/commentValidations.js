import { body, validationResult } from "express-validator"; // For validation
import Comment from "../models/comment.js";

export const postCommentValidationRules = [
  body("content").notEmpty().withMessage("Content is required."),
  body("author").notEmpty().withMessage("Author is required."),
];

export const deleteCommentValidationRules = [
  body("commentId").notEmpty().withMessage("CommentId is required."),
  body("commentId").isString().withMessage("CommentId needs to be string"),
];

export const updateCommentValidationRules = [
  body("commentId")
    .notEmpty()
    .withMessage("commentId is required.")
    .isString()
    .withMessage("commentId must be a string."),
  body("content")
    .notEmpty()
    .withMessage("content is required.")
    .isString()
    .withMessage("content must be a string."),
];
