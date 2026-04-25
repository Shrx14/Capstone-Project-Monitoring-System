const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");

const getPendingTeams = async (req, res) => {
  try {
    const teams = await Team.find({ status: "pending" })
      .populate("teamLeaderId", "name email rollNo branch")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid team id" });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.status !== "pending") {
      return res.status(400).json({ success: false, message: "Team already processed" });
    }

    const mentor = await User.findOne({ _id: mentorId, role: "mentor" });
    if (!mentor) {
      return res.status(400).json({ success: false, message: "Invalid mentorId" });
    }

    team.status = "approved";
    team.mentorId = mentorId;
    team.coordinatorId = req.user.userId;
    team.approvedAt = new Date();
    team.rejectionReason = "";

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("teamLeaderId", "name email rollNo branch")
      .populate("mentorId", "name email");

    return res.status(200).json({ success: true, data: populatedTeam });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid team id" });
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ success: false, message: "rejectionReason is required" });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.status !== "pending") {
      return res.status(400).json({ success: false, message: "Team already processed" });
    }

    team.status = "rejected";
    team.rejectionReason = rejectionReason.trim();
    team.coordinatorId = req.user.userId;

    await team.save();

    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const teams = await Team.find(filter)
      .populate("teamLeaderId", "name email rollNo")
      .populate("mentorId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ teamLeaderId: req.user.userId })
      .populate("mentorId", "name email")
      .populate("coordinatorId", "name email");

    if (!team) {
      return res.status(404).json({ success: false, message: "No team found" });
    }

    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMentorTeams = async (req, res) => {
  try {
    const teams = await Team.find({ mentorId: req.user.userId, status: "approved" })
      .populate("teamLeaderId", "name email rollNo");

    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTeamStats = async (req, res) => {
  try {
    const grouped = await Team.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    };

    grouped.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(stats, item._id)) {
        stats[item._id] = item.count;
      }
      stats.total += item.count;
    });

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPendingTeams,
  approveTeam,
  rejectTeam,
  getAllTeams,
  getMyTeam,
  getMentorTeams,
  getTeamStats,
};
