const mongoose = require("mongoose");

const userPracticeStatusSchema = new mongoose.Schema({
  userId: {
    // Reference to User
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  crop: {
    type: String,
    required: true,
    enum: ["Coffee", "Black Pepper", "Coorg Mandrin"],
  },
  month: {
    type: String,
    required: true,
  },
  // For each section in practices, store checked indices
  completedSections: [
    {
      section: { type: String, required: true },
      completedIndexes: [Number], // Indices of checked tasks in this section
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

userPracticeStatusSchema.index(
  { userId: 1, crop: 1, month: 1 },
  { unique: true }
);
// Unique per user, crop, month

module.exports = mongoose.model("UserPracticeStatus", userPracticeStatusSchema);
