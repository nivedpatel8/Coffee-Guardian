const express = require("express");
const { body } = require("express-validator");
const expensesController = require("../controllers/expensesController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for receipt image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/receipts/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) and PDF files are allowed"));
    }
  },
});

// Validation middleware for expenses
const expenseValidation = [
  body("category")
    .isIn(["Fertilizers", "Pesticides", "Equipment", "Labor", "Seeds", "Other"])
    .withMessage("Invalid category"),
  body("itemName").notEmpty().trim().withMessage("Item name is required"),
  body("quantity").isNumeric().withMessage("Quantity must be a number"),
  body("unit").notEmpty().trim().withMessage("Unit is required"),
  body("unitPrice").isNumeric().withMessage("Unit price must be a number"),
  body("purchaseDate")
    .optional()
    .isISO8601()
    .withMessage("Valid purchase date required"),
  body("supplier").optional().trim(),
  body("notes").optional().trim(),
];

// Get all expenses with pagination and filtering
router.get("/", auth, expensesController.getExpenses);

// Add new expense (with optional receipt upload)
router.post(
  "/",
  auth,
  upload.single("receipt"),
  expenseValidation,
  expensesController.addExpense
);

// Update expense
router.put(
  "/:id",
  auth,
  upload.single("receipt"),
  expenseValidation,
  expensesController.updateExpense
);

// Delete expense
router.delete("/:id", auth, expensesController.deleteExpense);

// Get expense statistics
router.get("/stats", auth, expensesController.getExpenseStats);

// Get expense report by category
router.get("/report", auth, expensesController.getExpenseReport);

// Get top expenses
router.get("/top", auth, expensesController.getTopExpenses);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size too large. Maximum 5MB allowed." });
    }
  }
  if (
    error.message === "Only images (JPEG, JPG, PNG) and PDF files are allowed"
  ) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router;
