const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().trim().withMessage("Name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.register
);

// Login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Get profile
router.get("/profile", auth, authController.getProfile);

// Update profile
router.put("/profile", auth, authController.updateProfile);

module.exports = router;