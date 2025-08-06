// controllers/userTaskStatus.js
const UserTaskStatus = require("../models/UserTaskStatus");

// Get all completed tasks for user/crop/month
exports.getStatus = async (req, res) => {
  const { crop, month } = req.query;
  const user = req.user.id; // ensure authentication middleware sets req.user
  const statuses = await UserTaskStatus.find({ user, crop, month });
  res.json(statuses);
};

// Update (or create) status for a section
exports.saveStatus = async (req, res) => {
  const { crop, month, section, completedIndexes } = req.body;
  const user = req.user.id;
  const updated = await UserTaskStatus.findOneAndUpdate(
    { user, crop, month, section },
    { completedIndexes },
    { new: true, upsert: true }
  );
  res.json(updated);
};
