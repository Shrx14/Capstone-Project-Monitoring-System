const { body, param, query } = require("express-validator");

const allowedRoles = ["student", "mentor", "coordinator"];
const allowedProjectStatuses = ["not_started", "in_progress", "completed"];
const allowedUpdateStatuses = ["approved", "rejected"];
const allowedMilestoneStatuses = ["pending", "completed"];

const registerValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("valid email is required").normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("role").isIn(allowedRoles).withMessage("Invalid role"),
];

const loginValidator = [
  body("email").isEmail().withMessage("valid email is required").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("password is required"),
];

const createProjectValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").trim().notEmpty().withMessage("description is required"),
  body("mentorId").isMongoId().withMessage("mentorId must be a valid id"),
  body("coordinatorId").optional().isMongoId().withMessage("coordinatorId must be a valid id"),
  body("groupMembers")
    .isArray({ min: 1 })
    .withMessage("groupMembers must be a non-empty array"),
  body("groupMembers.*")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("groupMembers must contain non-empty strings"),
];

const updateProjectStatusValidator = [
  param("id").isMongoId().withMessage("Invalid project id"),
  body("status").isIn(allowedProjectStatuses).withMessage("Invalid status"),
];

const createUpdateValidator = [
  body("projectId").isMongoId().withMessage("projectId must be a valid id"),
  body("text")
    .if((value, { req }) => req.body.content === undefined)
    .isString()
    .trim()
    .notEmpty()
    .withMessage("text is required"),
  body("content")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("content must be a non-empty string"),
  body("text")
    .optional()
    .isLength({ max: 3000 })
    .withMessage("text cannot exceed 3000 characters"),
  body("content")
    .optional()
    .isLength({ max: 3000 })
    .withMessage("content cannot exceed 3000 characters"),
];

const getProjectUpdatesValidator = [
  param("projectId").isMongoId().withMessage("Invalid projectId"),
];

const reviewUpdateValidator = [
  param("id").isMongoId().withMessage("Invalid update id"),
  body("status").isIn(allowedUpdateStatuses).withMessage("Invalid review status"),
  body("feedback")
    .optional()
    .isString()
    .isLength({ max: 3000 })
    .withMessage("feedback cannot exceed 3000 characters"),
];

const replaceAttachmentValidator = [
  param("id").isMongoId().withMessage("Invalid update id"),
];

const createMilestoneValidator = [
  body("projectId").isMongoId().withMessage("projectId must be a valid id"),
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage("description cannot exceed 2000 characters"),
  body("dueDate")
    .isISO8601()
    .withMessage("dueDate must be a valid ISO-8601 date")
    .custom((value) => {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        throw new Error("dueDate cannot be in the past");
      }

      return true;
    }),
];

const getMilestonesByProjectValidator = [
  param("projectId").isMongoId().withMessage("Invalid projectId"),
];

const updateMilestoneStatusValidator = [
  param("id").isMongoId().withMessage("Invalid milestone id"),
  body("status").isIn(allowedMilestoneStatuses).withMessage("Invalid status"),
];

const createAnnouncementValidator = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("title cannot exceed 200 characters"),
  body("message")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("message is required")
    .isLength({ max: 3000 })
    .withMessage("message cannot exceed 3000 characters"),
];

const getAnnouncementsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50"),
];

const getUsersValidator = [
  query("role").optional().isIn(allowedRoles).withMessage("Invalid role filter"),
];

module.exports = {
  registerValidator,
  loginValidator,
  createProjectValidator,
  updateProjectStatusValidator,
  createUpdateValidator,
  getProjectUpdatesValidator,
  reviewUpdateValidator,
  replaceAttachmentValidator,
  createMilestoneValidator,
  getMilestonesByProjectValidator,
  updateMilestoneStatusValidator,
  createAnnouncementValidator,
  getAnnouncementsValidator,
  getUsersValidator,
};