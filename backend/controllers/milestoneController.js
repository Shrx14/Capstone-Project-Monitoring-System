const mongoose = require("mongoose");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canAccessProject = (project, user) => {
  const projectOwner = String(project.createdBy);
  const mentor = String(project.mentorId);

  return (
    user.role === "coordinator" ||
    (user.role === "student" && projectOwner === user.userId) ||
    (user.role === "mentor" && mentor === user.userId)
  );
};

const createMilestone = async (req, res) => {
  try {
    const { projectId, title, description = "", dueDate } = req.body;

    if (!projectId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "projectId, title and dueDate are required",
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

    const milestone = await Milestone.create({
      projectId,
      title,
      description,
      dueDate,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMilestonesByProject = async (req, res) => {
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

    const milestones = await Milestone.find({ projectId }).sort({ dueDate: 1, createdAt: 1 });

    return res.status(200).json({ success: true, data: milestones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateMilestoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid milestone id" });
    }

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    const project = await Project.findById(milestone.projectId);

    if (!project || !canAccessProject(project, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    milestone.status = status;
    await milestone.save();

    return res.status(200).json({ success: true, data: milestone });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMilestone,
  getMilestonesByProject,
  updateMilestoneStatus,
};
