const User = require("../models/User");
const Practices = require("../models/Practices");
const Labor = require("../models/Labor");
const Expense = require("../models/Expense");
const Price = require("../models/Price");
const { validationResult } = require("express-validator");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalLabor, totalExpenses, recentPrices] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Labor.countDocuments(),
        Expense.countDocuments(),
        Price.countDocuments({
          date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        }),
      ]);

    // Monthly user registrations
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalUsers,
      totalLabor,
      totalExpenses,
      recentPrices,
      monthlyUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow password updates through this endpoint
    delete updateData.password;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Also delete user's related data
    await Promise.all([
      User.findByIdAndDelete(id),
      Labor.deleteMany({ userId: id }),
      Expense.deleteMany({ userId: id }),
    ]);

    res.json({ message: "User and related data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Practices Management
exports.getAllPractices = async (req, res) => {
  try {
    const practices = await Practices.find().sort({ crop: 1, month: 1 });
    res.json(practices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePractices = async (req, res) => {
  try {
    const { id } = req.params;
    const practices = await Practices.findByIdAndUpdate(
      id,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );

    if (!practices) {
      return res.status(404).json({ message: "Practices not found" });
    }

    res.json(practices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addPractices = async (req, res) => {
  try {
    const practices = new Practices(req.body);
    await practices.save();
    res.status(201).json(practices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePractices = async (req, res) => {
  try {
    const { id } = req.params;
    const practices = await Practices.findByIdAndDelete(id);

    if (!practices) {
      return res.status(404).json({ message: "Practices not found" });
    }

    res.json({ message: "Practices deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// System Analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // User analytics
    const userAnalytics = await User.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Activity analytics
    const laborActivity = await Labor.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$workType",
          count: { $sum: 1 },
          totalRate: { $sum: "$dailyRate" },
        },
      },
    ]);

    const expenseAnalytics = await Expense.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      userAnalytics,
      laborActivity,
      expenseAnalytics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Content Management
exports.bulkUpdatePractices = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, practices }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: {
          ...update.practices,
          lastUpdated: new Date(),
        },
      },
    }));

    const result = await Practices.bulkWrite(bulkOps);
    res.json({
      message: "Bulk update completed",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// System Maintenance
exports.cleanupOldData = async (req, res) => {
  try {
    const { days = 365 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const results = await Promise.all([
      Price.deleteMany({ date: { $lt: cutoffDate } }),
      // Add other cleanup operations as needed
    ]);

    res.json({
      message: "Data cleanup completed",
      deletedRecords: results.reduce(
        (sum, result) => sum + result.deletedCount,
        0
      ),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export data
exports.exportData = async (req, res) => {
  try {
    const { type, format = "json" } = req.query;

    let data;
    switch (type) {
      case "users":
        data = await User.find().select("-password");
        break;
      case "practices":
        data = await Practices.find();
        break;
      case "labor":
        data = await Labor.find();
        break;
      case "expenses":
        data = await Expense.find();
        break;
      case "prices":
        data = await Price.find();
        break;
      default:
        return res.status(400).json({ message: "Invalid export type" });
    }

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}-export.csv`
      );
      return res.send(csv);
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" ? `"${value}"` : value;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}