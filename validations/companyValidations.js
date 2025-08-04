import { body, param } from "express-validator"; // For validation
import { getCompanyType } from "../db/read.js";

export const getByIdValidationRules = [
  param("id")
    .notEmpty()
    .withMessage("Id is required.")
    .isString()
    .withMessage("Id must be a string.")
    .matches(/^[0-9]+$/)
    .withMessage("The Id must consist of digits only."),
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length > 0) {
      throw new Error("Request body must be empty.");
    }
    return true; // Validation passed
  }),
];

export const getAllValidationRules = [
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length > 0) {
      throw new Error("Request body must be empty.");
    }
    return true; // Validation passed
  }),
];

export const assignUserToCompanyValidationRules = [
  body("companyId")
    .notEmpty()
    .withMessage("companyId is required.")
    .isInt()
    .withMessage("companyId must be an integer."),
  body("userId")
    .notEmpty()
    .withMessage("userId is required.")
    .isInt()
    .withMessage("userId must be an integer."),
];

export const createCompanyValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("name is required.")
    .isString()
    .withMessage("name must be a string."),
  body("address")
    .notEmpty()
    .withMessage("address is required.")
    .isString()
    .withMessage("address must be a string."),
  body("email")
    .notEmpty()
    .withMessage("email is required.")
    .isEmail()
    .withMessage("E-mail address needs to be valid."),
  body("telegram")
    .optional()
    .isString()
    .withMessage("telegram must be a string."),
  body("website")
    .optional()
    .isString()
    .withMessage("website must be a string."),
  body("isAudit")
    .notEmpty()
    .withMessage("isAudit is required.")
    .matches(/^[01]$/)
    .withMessage("The isAudit must be either 0 or 1."),
  body("isClient")
    .notEmpty()
    .withMessage("isClient is required.")
    .matches(/^[01]$/)
    .withMessage("The isClient must be either 0 or 1."),

  body().custom(({ isClient, isAuditor }) => {
    const roles = [isClient, isAuditor];
    const validRoles = roles.filter((role) => role === 1);

    if (validRoles.length !== 1) {
      throw new Error("Can not have multiple roles or no roles.");
    }

    return true; // Validation passed
  }),
];

export const updateCompanyValidationRules = [
  body("name").optional().isString().withMessage("name must be a string."),
  body("address")
    .optional()
    .isString()
    .withMessage("address must be a string."),
  body("email")
    .optional()
    .isEmail()
    .withMessage("E-mail address needs to be valid."),
  body("telegram")
    .optional()
    .isString()
    .withMessage("telegram must be a string."),
  body("website")
    .optional()
    .isString()
    .withMessage("website must be a string."),
];
