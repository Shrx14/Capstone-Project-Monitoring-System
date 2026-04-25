const mongoose = require("mongoose");
const path = require("path");
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

const createSchedule = async (req, res) => {
  try {
    const { teamId, title, description = "", tasks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.status !== "approved") {
      return res.status(400).json({ success: false, message: "Team must be approved before uploading schedule" });
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: "tasks must be a non-empty array" });
    }

    const hasInvalidTask = tasks.some((task) => !task?.title || !task?.fromDate || !task?.toDate);
    if (hasInvalidTask) {
      return res.status(400).json({ success: false, message: "Each task must include title, fromDate and toDate" });
    }

    const orderedTasks = tasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    const schedule = await ProjectSchedule.create({
      teamId,
      coordinatorId: req.user.userId,
      title,
      description,
      tasks: orderedTasks,
    });

    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addTaskAttachment = async (req, res) => {
  try {
    const { scheduleId, taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    const schedule = await ProjectSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    if (String(schedule.coordinatorId) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const task = schedule.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "capstone-schedules",
        req.file.originalname,
        req.file.mimetype
      );
    } catch {
      return res.status(502).json({ success: false, message: "File upload failed. Please try again." });
    }

    task.attachments.push({
      fileUrl: uploadResult.secure_url,
      fileName: req.file.originalname,
      filePublicId: uploadResult.public_id,
    });

    await schedule.save();

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getScheduleForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (req.user.role === "teamleader" && String(team.teamLeaderId) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (req.user.role === "mentor" && String(team.mentorId || "") !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const schedule = await ProjectSchedule.findOne({ teamId });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "No schedule uploaded yet" });
    }

    const scheduleObj = schedule.toObject();
    scheduleObj.tasks = [...scheduleObj.tasks].sort(
      (a, b) => a.order - b.order || new Date(a.fromDate) - new Date(b.fromDate)
    );

    return res.status(200).json({ success: true, data: scheduleObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const { teamId } = req.query;
    const filter = {};

    if (teamId) {
      filter.teamId = teamId;
    }

    const schedules = await ProjectSchedule.find(filter)
      .populate("teamId", "teamId branch category")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { title, description } = req.body;

    const schedule = await ProjectSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    if (String(schedule.coordinatorId) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (title !== undefined) {
      schedule.title = title;
    }

    if (description !== undefined) {
      schedule.description = description;
    }

    await schedule.save();

    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSchedule,
  addTaskAttachment,
  getScheduleForTeam,
  getAllSchedules,
  updateSchedule,
};
