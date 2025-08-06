const mongoose = require("mongoose");

const weeklyPaymentSchema = new mongoose.Schema(
  {
    weekStartDate: {
      // Start date of the payment week (Monday)
      type: Date,
      required: true,
    },
    weekEndDate: {
      // End date of the payment week (Sunday)
      type: Date,
      required: true,
    },
    paymentDate: {
      // Actual date of payment (user selected payment day)
      type: Date,
      required: true,
    },
    totalWages: {
      // Sum of wages for that week before advance deduction
      type: Number,
      required: true,
    },
    advanceDeducted: {
      // Amount of advance deducted in this payment
      type: Number,
      default: 0,
    },
    netPayment: {
      // Actual amount paid (totalWages - advanceDeducted)
      type: Number,
      required: true,
    },
    expenseId: {
      type: mongoose.Schema.ObjectId,
      ref: "Expense",
    },
    notes: String,
  },
  { _id: false }
);

const laborSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    workType: {
      type: String,
      required: true,
      enum: ["Harvesting", "Pruning", "Weeding", "Processing", "General"],
    },
    skillLevel: {
      type: String,
      enum: ["skilled", "semi-skilled", "unskilled"],
      required: true,
    },
    dailyRate: {
      type: Number,
      required: true,
    },
    attendance: [
      {
        date: {
          type: Date,
          required: true,
        },
        present: {
          type: Boolean,
          default: false,
        },
        hoursWorked: {
          type: Number,
          default: 8,
        },
        wage: {
          type: Number,
          required: true,
          default: 450,
        },
        expenseId: {
          type: mongoose.Schema.ObjectId,
          ref: "Expense",
        },
        notes: String,
      },
    ],
    advance: {
      type: Number,
      default: 0, // Total outstanding advance amount
    },
    weeklyPayments: [weeklyPaymentSchema], // New field to track weekly payment records
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Labor", laborSchema);
