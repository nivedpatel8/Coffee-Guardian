const Practices = require("../models/Practices");

exports.getPractices = async (req, res) => {
  try {
    const { crop, month } = req.query;
    let query = {};
    if (crop) query.crop = crop;
    if (month) query.month = month;

    const practices = await Practices.find(query);
    res.json(practices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCurrentMonthPractices = async (req, res) => {
  try {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const { crop = "Coffee" } = req.query;

    const practices = await Practices.findOne({
      crop,
      month: currentMonth,
    });

    if (!practices) {
      return res
        .status(404)
        .json({ message: "No practices found for current month" });
    }

    res.json(practices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPracticesForCrop = async (req, res) => {
  try {
    const { crop } = req.params;

    const practices = await Practices.find({ crop }).sort({ month: 1 });
    res.json(practices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};