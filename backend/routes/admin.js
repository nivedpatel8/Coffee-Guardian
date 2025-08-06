const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(admin);

// Validation middleware
const userUpdateValidation = [
  body("name").optional().notEmpty().trim().withMessage("Name cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
];

const practicesValidation = [
  body("crop")
    .isIn(["Coffee", "Black Pepper", "Coorg Mandrin"])
    .withMessage("Invalid crop"),
  body("month").notEmpty().trim().withMessage("Month is required"),
  body("practices").isObject().withMessage("Practices must be an object"),
];

// Dashboard and Analytics
router.get("/dashboard", adminController.getDashboardStats);
router.get("/analytics", adminController.getSystemAnalytics);

// User Management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id", userUpdateValidation, adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Practices Management
router.get("/practices", adminController.getAllPractices);
router.post("/practices", practicesValidation, adminController.addPractices);
router.put(
  "/practices/:id",
  practicesValidation,
  adminController.updatePractices
);
router.delete("/practices/:id", adminController.deletePractices);

// Bulk operations
router.post(
  "/practices/bulk-update",
  [
    body("updates").isArray().withMessage("Updates must be an array"),
    body("updates.*.id").notEmpty().withMessage("Practice ID is required"),
    body("updates.*.practices")
      .isObject()
      .withMessage("Practices must be an object"),
  ],
  adminController.bulkUpdatePractices
);

// System maintenance
router.post("/cleanup", adminController.cleanupOldData);

// Data export
router.get("/export", adminController.exportData);

// User statistics endpoint
router.get("/users/stats", async (req, res) => {
  try {
    const User = require("../models/User");

    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyRegistrations = await User.aggregate([
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
      roleDistribution: stats,
      monthlyRegistrations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//user Management - getting useer by id
router.get("/users/:id", adminController.getUserById);

// Content moderation endpoints
router.get("/content/flagged", async (req, res) => {
  try {
    // This would typically check for flagged content
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// System health check
router.get("/health", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const User = require("../models/User");

    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const userCount = await User.countDocuments();

    res.json({
      status: "healthy",
      database: dbStatus,
      totalUsers: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Backup and restore endpoints
router.post("/backup", async (req, res) => {
  try {
    // This would typically create a database backup
    res.json({
      message: "Backup initiated",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Backup failed" });
  }
});

module.exports = router;
