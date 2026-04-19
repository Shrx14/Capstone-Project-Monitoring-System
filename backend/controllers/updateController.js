const mongoose = require("mongoose");
const path = require("path");
const Project = require("../models/Project");
const Update = require("../models/Update");
const cloudinary = require("../utils/cloudinary");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

const getSignedDownloadUrl = (filePublicId) => {
  if (!filePublicId) {
    return null;
  }

  try {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

    return cloudinary.utils.private_download_url(filePublicId, undefined, {
      resource_type: "raw",
      type: "upload",
      expires_at: expiresAt,
      attachment: false,
    });
  } catch {
    return null;
  }
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
    const normalizedText = (text || content || "").trim();

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
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "capstone-updates",
          req.file.originalname,
          req.file.mimetype
        );
        fileUrl = uploadResult.secure_url;
        filePublicId = uploadResult.public_id;
      } catch {
        return res.status(502).json({
          success: false,
          message: "File upload failed. Please try again.",
        });
      }
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

    const serializedUpdates = updates.map((update) => {
      const data = update.toObject();

      if (data.filePublicId) {
        data.fileAccessUrl = getSignedDownloadUrl(data.filePublicId) || data.fileUrl;
      }

      return data;
    });

    return res.status(200).json({ success: true, data: serializedUpdates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reviewUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback = "" } = req.body;
    const normalizedFeedback = feedback.trim();

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

    if (update.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Update has already been reviewed",
      });
    }

    update.status = status;
    update.feedback = normalizedFeedback;
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
