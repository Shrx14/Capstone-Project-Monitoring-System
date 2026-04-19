const Announcement = require("../models/Announcement");

const createAnnouncement = async (req, res) => {
  try {
    const { title = "", message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      Announcement.find()
      .populate("createdBy", "name email role")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
      Announcement.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
};
