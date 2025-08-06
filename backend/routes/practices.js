const express = require("express");
const practicesController = require("../controllers/practicesController");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all practices with optional filtering
router.get("/", auth, practicesController.getPractices);

// Get current month practices
router.get("/current", auth, practicesController.getCurrentMonthPractices);

// Get all practices for a specific crop
router.get("/crop/:crop", auth, practicesController.getAllPracticesForCrop);

module.exports = router;
