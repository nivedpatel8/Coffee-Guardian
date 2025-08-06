const User = require("../models/User");
const { validationResult } = require("express-validator");
const authConfig = require("../config/auth");

// ✅ Register new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, plantation, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate password strength
    const passwordValidation = authConfig.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ errors: passwordValidation.errors });
    }

    // Hash the password securely

    // Create and save user
    const user = await User.create({
      name,
      email,
      password,
      plantation,
      profile,
    });

    // Generate tokens (you can also generate refreshToken if needed)
    const tokens = authConfig.generateTokenPair(user);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plantation: user.plantation,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    console.error("[Register Error]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await authConfig.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const tokens = authConfig.generateTokenPair(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plantation: user.plantation,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    console.error("[Login Error]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get logged-in user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("[Profile Error]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update current user's profile
const bcrypt = require("bcryptjs");

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, plantation, profile } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If email is changed, check for uniqueness
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (plantation) user.plantation = plantation;
    if (profile) user.profile = profile;

    if (password) {
      // Hash new password
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save user, triggers pre-save middleware and validation
    await user.save();

    // Return user data without password
    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    console.error("[Update Profile Error]", error);
    res.status(500).json({ message: "Server error" });
  }
};
