const mongoose = require("mongoose");
const Project = require("../models/Project");
const Update = require("../models/Update");
const cloudinary = require("../utils/cloudinary");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
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

const canAccessProject = (project, user) => {
  const projectOwner = String(project.createdBy);
  const mentor = String(project.mentorId);

  return (
    user.role === "coordinator" ||
    (user.role === "student" && projectOwner === user.userId) ||
    (user.role === "mentor" && mentor === user.userId)
  );
};

const createUpdate = async (req, res) => {
  try {
    const { projectId, text, content } = req.body;
    const normalizedText = text || content;

    if (!projectId || !normalizedText) {
      return res.status(400).json({
        success: false,
        message: "projectId and text are required",
      });
    }

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (String(project.createdBy) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let fileUrl = null;
    let filePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "capstone-updates");
      fileUrl = uploadResult.secure_url;
      filePublicId = uploadResult.public_id;
    }

    const update = await Update.create({
      projectId,
      text: normalizedText,
      submittedBy: req.user.userId,
      fileUrl,
      filePublicId,
    });

    return res.status(201).json({ success: true, data: update });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUpdatesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updates = await Update.find({ projectId })
      .populate("submittedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: updates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reviewUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback = "" } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid update id" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid review status" });
    }

    const update = await Update.findById(id).populate("projectId");

    if (!update) {
      return res.status(404).json({ success: false, message: "Update not found" });
    }

    if (String(update.projectId.mentorId) !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    update.status = status;
    update.feedback = feedback;
    update.reviewedBy = req.user.userId;
    update.reviewedAt = new Date();

    await update.save();

    return res.status(200).json({ success: true, data: update });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUpdate,
  getUpdatesByProject,
  reviewUpdate,
};
