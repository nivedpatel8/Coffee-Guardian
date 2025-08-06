const express = require("express");
const { body } = require("express-validator");
const laborController = require("../controllers/laborController");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware for labor records
const laborValidation = [
  body("workerName").notEmpty().trim().withMessage("Worker name is required"),
  body("gender")
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female"),
  body("workType")
    .isIn(["Harvesting", "Pruning", "Weeding", "Processing", "General"])
    .withMessage("Invalid work type"),
  body("skillLevel")
    .isIn(["skilled", "semi-skilled", "unskilled"])
    .withMessage("Invalid skill level"),
  body("dailyRate").isNumeric().withMessage("Daily rate must be a number"),
];

const attendanceValidation = [
  body("date").isISO8601().withMessage("Valid date is required"),
  body("present").isBoolean().withMessage("Present must be true or false"),
  body("wage").isNumeric().withMessage("Wage must be number"),
  body("hoursWorked")
    .optional()
    .isNumeric()
    .withMessage("Hours worked must be a number"),
];

// ===================== EXISTING ROUTES =====================

// Get all labor records with pagination and filtering
router.get("/", auth, laborController.getLaborRecords);

// Add new labor record
router.post("/", auth, laborValidation, laborController.addLaborRecord);

// Update labor record
router.put("/:id", auth, laborValidation, laborController.updateLaborRecord);

// Delete labor record
router.delete("/:id", auth, laborController.deleteLaborRecord);

// Mark attendance for a worker
router.post(
  "/:id/attendance",
  auth,
  attendanceValidation,
  laborController.markAttendance
);

// Get labor statistics
router.get("/stats", auth, laborController.getLaborStats);

// Get attendance report
router.get("/attendance-report", auth, laborController.getAttendanceReport);

// Get worker names
router.get("/worker-names", auth, laborController.getWorkerNames);

// ===================== NEW ADVANCE PAYMENT & WEEKLY PAYMENT ROUTES =====================

// Validation middleware for advance payments
const advancePaymentValidation = [
  body("amount")
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("notes")
    .optional()
    .isString()
    .trim()
    .withMessage("Notes must be a string"),
];

// Validation middleware for weekly payment
const weeklyPaymentValidation = [
  body("weekStartDate")
    .isISO8601()
    .withMessage("Valid week start date is required"),
  body("weekEndDate")
    .isISO8601()
    .withMessage("Valid week end date is required"),
  body("totalWages")
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Total wages must be a non-negative number"),
  body("advanceDeducted")
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Advance deducted must be a non-negative number"),
  body("paymentDay")
    .optional()
    .isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .withMessage("Invalid payment day"),
  body("notes")
    .optional()
    .isString()
    .trim()
    .withMessage("Notes must be a string"),
];

// Validation middleware for advance update
const advanceUpdateValidation = [
  body("newAdvanceAmount")
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("New advance amount must be a non-negative number"),
  body("notes")
    .optional()
    .isString()
    .trim()
    .withMessage("Notes must be a string"),
];

// Add advance payment to a worker
router.post(
  "/:id/advance",
  auth,
  advancePaymentValidation,
  laborController.addAdvancePayment
);

// Update advance payment for a worker (for corrections)
router.put(
  "/:id/advance",
  auth,
  advanceUpdateValidation,
  laborController.updateAdvancePayment
);

// Get weekly wages summary for all workers (based on payment day)
router.get(
  "/weekly-wages-summary",
  auth,
  laborController.getWeeklyWagesSummary
);

// Mark weekly payment for a worker
router.post(
  "/:id/weekly-payment",
  auth,
  weeklyPaymentValidation,
  laborController.markWeeklyPayment
);

// Get payment history for a specific worker
router.get("/:id/payment-history", auth, laborController.getPaymentHistory);

module.exports = router;