const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [teamMemberSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one team member is required",
      },
      required: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["internal", "external", "interdisciplinary"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.statics.generateTeamId = async function generateTeamId(academicYear) {
  const [startYearRaw, endYearRaw] = String(academicYear || "").split("-");
  const startYear = (startYearRaw || "").slice(-2);
  const endYear = (endYearRaw || "").slice(-2);

  const count = await this.countDocuments({ academicYear });
  const serial = String(count + 1).padStart(4, "0");

  return `FCRIT-${startYear}${endYear}-${serial}`;
};

teamSchema.index({ academicYear: 1, createdAt: -1 });
teamSchema.index({ teamLeaderId: 1 });
teamSchema.index({ status: 1 });

module.exports = mongoose.model("Team", teamSchema);
