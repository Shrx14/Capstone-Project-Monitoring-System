const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    groupMembers: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one group member is required",
      },
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ createdBy: 1, createdAt: -1 });
projectSchema.index({ mentorId: 1, createdAt: -1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model("Project", projectSchema);
