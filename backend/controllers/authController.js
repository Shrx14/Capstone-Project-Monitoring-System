const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Team = require("../models/Team");

const allowedRoles = ["mentor", "coordinator"];

const inviteCodesByRole = {
  mentor: process.env.MENTOR_INVITE_CODE,
  coordinator: process.env.COORDINATOR_INVITE_CODE,
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, inviteCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (!inviteCode || inviteCode !== inviteCodesByRole[role]) {
      return res.status(403).json({ success: false, message: "Invalid invite code for the selected role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const user = await User.create({ name, email, password, role });

    const token = jwt.sign(
      { userId: user._id, role: user.role, teamId: null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const registerTeam = async (req, res) => {
  try {
    const { teamLeader, team } = req.body;

    if (!teamLeader || !team) {
      return res.status(400).json({ success: false, message: "Team leader and team details are required" });
    }

    const {
      name,
      email,
      password,
      rollNo,
      branch: leaderBranch,
    } = teamLeader;

    const {
      members,
      branch,
      category,
      academicYear,
    } = team;

    if (!name || !email || !password || !rollNo || !leaderBranch || !branch || !category || !academicYear) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const allowedCategories = ["internal", "external", "interdisciplinary"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    if (!Array.isArray(members) || members.length < 1) {
      return res.status(400).json({ success: false, message: "Team members must be a non-empty array" });
    }

    const hasInvalidMember = members.some(
      (member) => !member?.name || !member?.rollNo || !member?.branch
    );

    if (hasInvalidMember) {
      return res.status(400).json({ success: false, message: "Each team member must include name, rollNo and branch" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const generatedTeamId = await Team.generateTeamId(academicYear);

    const newUser = await User.create({
      name,
      email,
      password,
      role: "teamleader",
      rollNo,
      branch: leaderBranch,
    });

    const newTeam = await Team.create({
      teamId: generatedTeamId,
      academicYear,
      teamLeaderId: newUser._id,
      members,
      branch,
      category,
      status: "pending",
    });

    const token = jwt.sign(
      { userId: newUser._id, role: "teamleader", teamId: newTeam._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        rollNo: newUser.rollNo,
        branch: newUser.branch,
      },
      team: {
        _id: newTeam._id,
        teamId: newTeam.teamId,
        status: newTeam.status,
        category: newTeam.category,
        branch: newTeam.branch,
        academicYear: newTeam.academicYear,
        members: newTeam.members,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    let team = null;
    let payloadTeamId = null;

    if (user.role === "teamleader") {
      team = await Team.findOne({ teamLeaderId: user._id })
        .select("_id teamId status category branch academicYear members mentorId rejectionReason")
        .populate("mentorId", "name email");

      payloadTeamId = team?._id || null;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, teamId: payloadTeamId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const response = {
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        branch: user.branch,
      },
    };

    if (user.role === "teamleader") {
      response.team = team || null;
    }

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  registerTeam,
};