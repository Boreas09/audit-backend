import { body, param } from "express-validator"; // For validation
import { getUserByPublicAddressInternal } from "../db/read.js";

export const createUserValidationRules = [
  body("data.name")
    .notEmpty()
    .withMessage("name is required.")
    .isString()
    .withMessage("name must be a string."),
  body("data.publicAddress")
    .notEmpty()
    .withMessage("publicAddress is required.")
    .isString()
    .withMessage("publicAddress must be a string."),
  body("data.mail")
    .notEmpty()
    .withMessage("mail is required.")
    .isString()
    .withMessage("mail must be a string.")
    .isEmail()
    .withMessage("E-mail address needs to be valid."),
  body("data.isAuditor")
    .notEmpty()
    .withMessage("isAuditor is required.")
    .matches(/^[01]$/)
    .withMessage("The isAuditor must be either 0 or 1."),
  body("data.isClient")
    .notEmpty()
    .withMessage("isClient is required.")
    .matches(/^[01]$/)
    .withMessage("The isClient must be either 0 or 1."),

  body("data.github")
    .optional()
    .isString()
    .withMessage("github must be a string."),
  body("data.telegram")
    .optional()
    .isString()
    .withMessage("telegram must be a string."),

  body("data.publicAddress")
    .isString()
    .custom(async (value) => {
      const existingUser = await getUserByPublicAddressInternal(value);
      if (existingUser) {
        throw new Error("An user already exists with this public address");
      }
      // No need to handle errors from getUserByPublicAddress here
      return true;
    }),

  body().custom(({ data }) => {
    const roles = [data.isAdmin, data.isClient, data.isAuditor];
    const validRoles = roles.filter((role) => role === 1);

    if (validRoles.length !== 1) {
      throw new Error("Can not have multiple roles or no roles.");
    }

    return true; // Validation passed
  }),
];

export const updateUserValidationRules = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("name is required.")
    .isString()
    .withMessage("name must be a string."),
  body("publicAddress")
    .optional()
    .notEmpty()
    .withMessage("publicAddress is required.")
    .isString()
    .withMessage("publicAddress must be a string."),
  body("mail")
    .optional()
    .notEmpty()
    .withMessage("mail is required.")
    .isString()
    .withMessage("mail must be a string.")
    .isEmail()
    .withMessage("E-mail address needs to be valid."),

  body("github").optional().isString().withMessage("github must be a string."),
  body("telegram")
    .optional()
    .isString()
    .withMessage("telegram must be a string."),

  body().custom(({ isAdmin, isClient, isAuditor }) => {
    if (
      isClient === undefined &&
      isAuditor === undefined &&
      isAdmin === undefined
    ) {
      return true;
    }
    const roles = [isClient, isAuditor, isAdmin];
    const validRoles = roles.filter((role) => role === 1);

    if (validRoles.length !== 1) {
      throw new Error("Can not have multiple roles or no roles.");
    }

    return true;
  }),
];

export const getUserByPublicAddressValidationRules = [
  param("publicAddress")
    .notEmpty()
    .withMessage("publicAddress is required.")
    .isString()
    .withMessage("publicAddress must be a string and needs to have 0x prefix."),
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length > 0) {
      throw new Error("Request body must be empty.");
    }
    return true; // Validation passed
  }),
];

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
