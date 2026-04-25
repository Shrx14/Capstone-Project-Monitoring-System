const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
    },
    filePublicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const contributionSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    workDone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { _id: false }
);

const gradeSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const taskSubmissionSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSchedule",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "submitted", "completed", "reassigned"],
      default: "not_started",
    },
    statusNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    files: {
      type: [fileSchema],
      default: [],
    },
    memberContributions: {
      type: [contributionSchema],
      default: [],
    },
    mentorRemarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    reassignNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    grades: {
      type: [gradeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

taskSubmissionSchema.index({ scheduleId: 1, taskId: 1, teamId: 1 }, { unique: true });
taskSubmissionSchema.index({ teamId: 1, status: 1 });
taskSubmissionSchema.index({ reviewedBy: 1 });

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);
