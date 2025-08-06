const Expense = require("../models/Expense");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Get all expenses for authenticated user
exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    let query = { userId: req.userId };
    if (category) query.category = category;
    if (startDate && endDate) {
      query.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const expenses = await Expense.find(query)
      .sort({ purchaseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new expense
exports.addExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Calculate total amount
    const { quantity, unitPrice } = req.body;
    const totalAmount = quantity * unitPrice;

    const expenseData = {
      ...req.body,
      totalAmount,
      userId: req.userId,
    };

    const expense = new Expense(expenseData);
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Recalculate total if quantity or unit price changed
    if (req.body.quantity || req.body.unitPrice) {
      const quantity = req.body.quantity || expense.quantity;
      const unitPrice = req.body.unitPrice || expense.unitPrice;
      req.body.totalAmount = quantity * unitPrice;
    }

    Object.assign(expense, req.body);
    await expense.save();

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // Monthly stats
    const monthlyStats = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          purchaseDate: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Yearly stats
    const yearlyStats = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          purchaseDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$purchaseDate" },
            category: "$category",
          },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      monthlyStats,
      yearlyStats,
      totalExpenses: totalExpenses[0] || { total: 0, count: 0 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get expense report by category
exports.getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    let matchQuery = { userId: userObjectId };
    if (category) matchQuery.category = category;
    if (startDate && endDate) {
      matchQuery.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const report = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$category",
          expenses: {
            $push: {
              itemName: "$itemName",
              quantity: "$quantity",
              unitPrice: "$unitPrice",
              totalAmount: "$totalAmount",
              purchaseDate: "$purchaseDate",
              supplier: "$supplier",
            },
          },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get top expenses
exports.getTopExpenses = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const topExpenses = await Expense.find({ userId: userObjectId })
      .sort({ totalAmount: -1 })
      .limit(parseInt(limit))
      .select("itemName category totalAmount purchaseDate supplier");

    res.json(topExpenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
const Expense = require("../models/Expense");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// ... (your existing getExpenses, addExpense, updateExpense functions) ...

// Get overall summary (total amount, total count for all expenses)
exports.getOverallExpenseSummary = async (req, res) => {
  try {
    const userId = req.userId; // Assuming req.userId is set by an auth middleware

    const summary = await Expense.aggregate([
      {
        $match: { userId: userId } // Filter by the authenticated user
      },
      {
        $group: {
          _id: null, // Groups all documents into a single group
          totalAmount: { $sum: "$totalAmount" }, // Sums the totalAmount for all expenses
          totalCount: { $sum: 1 }, // Counts all documents
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the final output
          totalAmount: 1,
          totalCount: 1,
        }
      }
    ]);

    if (summary.length > 0) {
      res.json(summary[0]); // Returns the single summary object
    } else {
      res.json({ totalAmount: 0, totalCount: 0 }); // No expenses found
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get expenses with category-wise sums (original logic)
exports.getCategoryWiseExpenses = async (req, res) => {
  try {
    const userId = req.userId; // Assuming req.userId is set by an auth middleware

    const categorySummary = await Expense.aggregate([
      {
        $match: { userId: userId } // Filter by the authenticated user
      },
      {
        $group: {
          _id: "$category", // Groups by category
          totalAmount: { $sum: "$totalAmount" }, // Sums totalAmount per category
          count: { $sum: 1 }, // Counts documents per category
        },
      },
      {
        $sort: { _id: 1 } // Optional: Sort by category name
      }
    ]);

    res.json(categorySummary);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
*/
