const UserPracticeStatus = require("../models/UserPracticeStatus");

/**
 * Save or update checked/completed indexes for a specific section
 * req.body: { user, crop, month, section, completedIndexes }
 */
exports.saveStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { crop, month, section, completedIndexes } = req.body;

    if (
      !userId ||
      !crop ||
      !month ||
      !section ||
      !Array.isArray(completedIndexes)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find or create user practice status doc
    let doc = await UserPracticeStatus.findOne({ userId, crop, month });
    if (!doc) {
      doc = new UserPracticeStatus({
        userId,
        crop,
        month,
        completedSections: [{ section, completedIndexes }],
      });
    } else {
      // Find the right section
      const idx = doc.completedSections.findIndex((s) => s.section === section);
      if (idx > -1) {
        doc.completedSections[idx].completedIndexes = completedIndexes;
      } else {
        doc.completedSections.push({ section, completedIndexes });
      }
      doc.lastUpdated = new Date();
    }
    await doc.save();
    res.json({ success: true, completedSections: doc.completedSections });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Get checked/completed indexes for each section for this user/crop/month
 * req.query: { user, crop, month }
 */
exports.getStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { crop, month } = req.query;
    if (!userId || !crop || !month) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const doc = await UserPracticeStatus.findOne({ userId, crop, month });
    // Returns: [{ section, completedIndexes }, ...]
    res.json(doc ? doc.completedSections : []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
