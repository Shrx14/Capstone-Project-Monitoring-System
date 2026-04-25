const mongoose = require("mongoose");
const path = require("path");
const TaskSubmission = require("../models/TaskSubmission");
const ProjectSchedule = require("../models/ProjectSchedule");
const Team = require("../models/Team");
const cloudinary = require("../utils/cloudinary");

const extensionByMimeType = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
};

const getSafePublicId = (originalName = "upload") => {
  const baseName = path.parse(originalName).name;
  const sanitizedBase = baseName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");

  return `${Date.now()}-${sanitizedBase || "upload"}`;
};

const getFileExtension = (originalName = "", mimeType = "") => {
  const extFromName = path.extname(originalName).replace(".", "").toLowerCase();
  if (extFromName) {
    return extFromName;
  }

  return extensionByMimeType[mimeType] || "";
};

const getCloudinaryResourceType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  return "raw";
};

const uploadToCloudinary = (fileBuffer, folder, originalName, mimeType) => {
  const fileExtension = getFileExtension(originalName, mimeType);
  const publicIdBase = getSafePublicId(originalName);
  const resourceType = getCloudinaryResourceType(mimeType);

  const uploadOptions = {
    folder,
    resource_type: resourceType,
    public_id:
      resourceType === "raw" && fileExtension
        ? `${publicIdBase}.${fileExtension}`
        : publicIdBase,
  };

  if (resourceType === "image" && fileExtension) {
    uploadOptions.format = fileExtension;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const stripGrades = (submissionObj) => {
  const obj = { ...submissionObj };
  delete obj.grades;
  return obj;
};

const upsertSubmission = async (req, res) => {
  try {
    const { scheduleId, taskId, statusNote = "", memberContributions = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(scheduleId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid scheduleId or taskId" });
    }

    const schedule = await ProjectSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    const task = schedule.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found in schedule" });
    }

    const team = await Team.findById(schedule.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (String(team.teamLeaderId) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const query = {
      scheduleId,
      taskId,
      teamId: schedule.teamId,
    };

    const existing = await TaskSubmission.findOne(query);

    const update = {
      $set: {
        statusNote,
        memberContributions,
        teamLeaderId: req.user.userId,
        teamId: schedule.teamId,
      },
      $setOnInsert: {
        status: "in_progress",
      },
    };

    if (existing && ["submitted", "completed"].includes(existing.status)) {
      delete update.$set.status;
    }

    const submission = await TaskSubmission.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, data: stripGrades(submission.toObject()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const submitTask = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (String(submission.teamLeaderId) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (submission.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot resubmit a completed task" });
    }

    if (req.file) {
      let uploadResult;
      try {
        uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "capstone-submissions",
          req.file.originalname,
          req.file.mimetype
        );
      } catch {
        return res.status(502).json({ success: false, message: "File upload failed. Please try again." });
      }

      submission.files.push({
        fileUrl: uploadResult.secure_url,
        fileName: req.file.originalname,
        filePublicId: uploadResult.public_id,
      });
    }

    submission.status = "submitted";
    submission.submittedAt = new Date();

    await submission.save();

    return res.status(200).json({ success: true, data: stripGrades(submission.toObject()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTeamSubmissions = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({ success: false, message: "Invalid scheduleId" });
    }

    const schedule = await ProjectSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    const team = await Team.findById(schedule.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (req.user.role === "mentor" && String(team.mentorId || "") !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let submissions = await TaskSubmission.find({ scheduleId }).sort({ createdAt: -1 });

    if (req.user.role === "teamleader") {
      submissions = submissions.filter((submission) => String(submission.teamLeaderId) === req.user.userId);
      return res.status(200).json({
        success: true,
        data: submissions.map((submission) => stripGrades(submission.toObject())),
      });
    }

    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMentorGrades = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await ProjectSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    const team = await Team.findById(schedule.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (String(team.mentorId || "") !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const submissions = await TaskSubmission.find({ scheduleId, status: "completed" }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (req.user.role === "teamleader") {
      if (String(submission.teamLeaderId) !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      return res.status(200).json({ success: true, data: stripGrades(submission.toObject()) });
    }

    if (req.user.role === "mentor") {
      const team = await Team.findById(submission.teamId);
      if (!team || String(team.mentorId || "") !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const mentorReviewTask = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const {
      action,
      mentorRemarks = "",
      reassignNote = "",
      completedDate,
      grades = [],
    } = req.body;

    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (submission.status !== "submitted") {
      return res.status(400).json({ success: false, message: "Only submitted tasks can be reviewed" });
    }

    const team = await Team.findById(submission.teamId);
    if (!team || String(team.mentorId || "") !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (action === "complete") {
      if (!Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({ success: false, message: "grades are required for completion" });
      }

      const hasInvalidGrade = grades.some((item) => !item?.grade);
      if (hasInvalidGrade) {
        return res.status(400).json({ success: false, message: "Each grade entry must include grade" });
      }

      submission.status = "completed";
      submission.mentorRemarks = mentorRemarks;
      submission.completedDate = completedDate ? new Date(completedDate) : new Date();
      submission.grades = grades;
      submission.reviewedBy = req.user.userId;
      submission.reviewedAt = new Date();
      submission.reassignNote = "";
    } else if (action === "reassign") {
      if (!reassignNote || reassignNote.trim().length < 10) {
        return res.status(400).json({ success: false, message: "Reassign note must be at least 10 characters" });
      }

      submission.status = "reassigned";
      submission.mentorRemarks = mentorRemarks;
      submission.reassignNote = reassignNote.trim();
      submission.reviewedBy = req.user.userId;
      submission.reviewedAt = new Date();
      submission.grades = [];
      submission.completedDate = null;
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await submission.save();

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  upsertSubmission,
  submitTask,
  getTeamSubmissions,
  getMentorGrades,
  getSingleSubmission,
  mentorReviewTask,
};
