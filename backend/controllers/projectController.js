const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProject = async (req, res) => {
  try {
    const { title, description, groupMembers = [], mentorId, coordinatorId } = req.body;

    if (!title || !description || !mentorId) {
      return res.status(400).json({
        success: false,
        message: "title, description and mentorId are required",
      });
    }

    if (!Array.isArray(groupMembers) || groupMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "groupMembers must be a non-empty array",
      });
    }

    if (!isValidObjectId(mentorId)) {
      return res.status(400).json({ success: false, message: "Invalid mentorId" });
    }

    const mentor = await User.findOne({ _id: mentorId, role: "mentor" }).select("_id");
    if (!mentor) {
      return res.status(400).json({ success: false, message: "mentorId must belong to a mentor" });
    }

    let resolvedCoordinatorId = coordinatorId;

    if (!resolvedCoordinatorId) {
      const coordinator = await User.findOne({ role: "coordinator" }).select("_id");

      if (!coordinator) {
        return res.status(400).json({
          success: false,
          message: "No coordinator found. Provide coordinatorId or create a coordinator user.",
        });
      }

      resolvedCoordinatorId = coordinator._id;
    } else {
      const coordinator = await User.findOne({ _id: resolvedCoordinatorId, role: "coordinator" }).select("_id");
      if (!coordinator) {
        return res.status(400).json({
          success: false,
          message: "coordinatorId must belong to a coordinator",
        });
      }
    }

    const project = await Project.create({
      title,
      description,
      groupMembers,
      mentorId,
      coordinatorId: resolvedCoordinatorId,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.userId })
      .populate("mentorId", "name email role")
      .populate("coordinatorId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ mentorId: req.user.userId })
      .populate("createdBy", "name email role")
      .populate("coordinatorId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const projects = await Project.find(filter)
      .populate("createdBy", "name email role")
      .populate("mentorId", "name email role")
      .populate("coordinatorId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    if (!["not_started", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const project = await Project.findByIdAndUpdate(id, { status }, { new: true });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const grouped = await Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = {
      not_started: 0,
      in_progress: 0,
      completed: 0,
      total: 0,
    };

    grouped.forEach((item) => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getAssignedProjects,
  getAllProjects,
  updateProjectStatus,
  getProjectStats,
};
