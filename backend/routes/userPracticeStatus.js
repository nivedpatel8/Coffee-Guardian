const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Ensure user authentication
const controller = require("../controllers/userPracticeStatus");

// POST /api/user-practice-status
router.post("/", auth, controller.saveStatus);

// GET /api/user-practice-status
router.get("/", auth, controller.getStatus);

module.exports = router;
