const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const practicesRoutes = require("./routes/practices");
const laborRoutes = require("./routes/labor");
const expensesRoutes = require("./routes/expenses");
const pricesRoutes = require("./routes/prices");
const adminRoutes = require("./routes/admin");
const userPracticeStatusRoutes = require("./routes/userPracticeStatus");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/coffee-guardian",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/practices", practicesRoutes);
app.use("/api/labor", laborRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/prices", pricesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user-practice-status", userPracticeStatusRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
