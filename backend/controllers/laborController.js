const Labor = require("../models/Labor");
const Expense = require("../models/Expense");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Get all labor records for authenticated user
exports.getLaborRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, workType, skillLevel } = req.query;

    let query = { userId: req.userId };
    if (workType) query.workType = workType;
    if (skillLevel) query.skillLevel = skillLevel;

    const laborRecords = await Labor.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Labor.countDocuments(query);

    res.json({
      laborRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new labor record
exports.addLaborRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const laborData = {
      ...req.body,
      userId: req.userId,
    };

    const labor = new Labor(laborData);
    await labor.save();

    res.status(201).json(labor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update labor record
exports.updateLaborRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const labor = await Labor.findOne({ _id: id, userId: req.userId });
    if (!labor) {
      return res.status(404).json({ message: "Labor record not found" });
    }

    Object.assign(labor, req.body);
    await labor.save();

    res.json(labor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete labor record
exports.deleteLaborRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const labor = await Labor.findOneAndDelete({ _id: id, userId: req.userId });
    if (!labor) {
      return res.status(404).json({ message: "Labor record not found" });
    }

    res.json({ message: "Labor record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, present, hoursWorked, wage, notes, expenseId } = req.body;

    const labor = await Labor.findOne({ _id: id, userId: req.userId });
    if (!labor) return res.status(404).json({ message: "Worker not found" });

    const targetDateStr = new Date(date).toDateString();

    // Find attendance record by comparing dates ignoring time
    let attendance = labor.attendance.find(
      (att) => att.date.toDateString() === targetDateStr
    );

    if (attendance) {
      // Update existing attendance record fields
      attendance.present = present;
      attendance.hoursWorked = hoursWorked || 8;
      attendance.wage = wage; // The wage can be updated
      attendance.notes = notes;
    } else {
      // Create new attendance record
      attendance = {
        date: new Date(date),
        present,
        hoursWorked: hoursWorked || 8,
        wage,
        notes,
        expenseId: req.expenseId,
      };
      labor.attendance.push(attendance);
      await labor.save();
    }

    // // Handle expense sync with attendance

    // // Case 1: Attendance marked PRESENT
    // if (present === true) {
    //   if (attendance.expenseId) {
    //     // Expense already exists, update if wage or date changed
    //     await Expense.findOneAndUpdate(
    //       { _id: attendance.expenseId, userId: req.userId },
    //       {
    //         totalAmount: wage,
    //         unitPrice: wage,
    //         purchaseDate: attendance.date,
    //         notes: `Labor wage updated for ${labor.workerName} on ${targetDateStr}`,
    //       }
    //     );
    //   } else {
    //     // No expense linked yet, create new expense record
    //     const expense = new Expense({
    //       userId: req.userId,
    //       itemName: `${labor.workerName} ${labor.workType}`,
    //       category: "Labor",
    //       quantity: 1,
    //       unit: "lb", // or whatever unit fits
    //       unitPrice: wage,
    //       purchaseDate: attendance.date,
    //       totalAmount: wage,
    //       notes: `Labor wage for ${labor.workerName} on ${targetDateStr}`,
    //     });
    //     await expense.save();
    //     attendance.expenseId = expense._id; // Link expense with attendance
    //   }
    // } else {
    //   // Case 2: Attendance marked ABSENT or unmarked (present = false)
    //   if (attendance.expenseId) {
    //     // Delete linked expense
    //     await Expense.findOneAndDelete({
    //       _id: attendance.expenseId,
    //       userId: req.userId,
    //     });
    //     attendance.expenseId = null; // Unlink the expense
    //   }
    // }

    await labor.save();

    res.json(labor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get labor statistics
exports.getLaborStats = async (req, res) => {
  try {
    // Convert string to ObjectId for matching
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const { startDate, endDate, date } = req.query;

    let matchQuery = { userId: userObjectId };

    const stats = await Labor.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalWorkers: { $sum: 1 },
          avgDailyRate: { $avg: "$dailyRate" },
          skilledWorkers: {
            $sum: {
              $cond: [{ $eq: ["$skillLevel", "skilled"] }, 1, 0],
            },
          },
          skillBreakdown: {
            $push: {
              skill: "$skillLevel",
              rate: "$dailyRate",
            },
          },
        },
      },
    ]);

    // Calculate daily, weekly, and monthly stats for the specified date or today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Weekly range (start of week to end of week)
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Monthly range
    const startOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    );
    endOfMonth.setHours(23, 59, 59, 999);

    const laborRecords = await Labor.find(matchQuery);

    // Calculate daily stats
    let dailyWorkers = 0;
    let dailyWages = 0;
    let weeklyWages = 0;
    let monthlyWages = 0;

    laborRecords.forEach((worker) => {
      worker.attendance.forEach((att) => {
        const attDate = new Date(att.date);

        // Daily stats
        if (attDate >= startOfDay && attDate <= endOfDay && att.present) {
          dailyWorkers++;
          dailyWages += att.wage || worker.dailyRate;
        }

        // Weekly stats
        if (attDate >= startOfWeek && attDate <= endOfWeek && att.present) {
          weeklyWages += att.wage || worker.dailyRate;
        }

        // Monthly stats
        if (attDate >= startOfMonth && attDate <= endOfMonth && att.present) {
          monthlyWages += att.wage || worker.dailyRate;
        }
      });
    });

    res.json({
      stats: stats[0] || {
        totalWorkers: 0,
        skillBreakdown: [],
        avgDailyRate: 0,
        skilledWorkers: 0,
      },
      dailyStats: {
        workersPresent: dailyWorkers,
        totalDailyWages: dailyWages,
        totalWeeklyWages: weeklyWages,
        totalMonthlyWages: monthlyWages,
        date: targetDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, workerId, workerName } = req.query;

    let matchQuery = { userId: req.userId };
    if (workerId) matchQuery._id = workerId;
    if (workerName)
      matchQuery.workerName = { $regex: workerName, $options: "i" };

    // Find worker(s)
    const workers = await Labor.find(matchQuery).select(
      "workerName attendance dailyRate workType"
    );

    // Filter attendance within date range
    const filteredWorkers = workers.map((worker) => {
      const filteredAttendance = worker.attendance.filter((att) => {
        if (!startDate || !endDate) return true;
        const attDate = new Date(att.date);
        return attDate >= new Date(startDate) && attDate <= new Date(endDate);
      });

      // Sum wages for filtered attendance
      const totalWages = filteredAttendance.reduce((sum, att) => {
        const wage =
          att.wage !== undefined && att.wage !== null
            ? att.wage
            : worker.dailyRate;
        return att.present ? sum + wage : sum;
      }, 0);

      // Format attendance with day names
      const formattedAttendance = filteredAttendance.map((att) => ({
        ...att.toObject(),
        dayName: new Date(att.date).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        formattedDate: new Date(att.date).toLocaleDateString(),
        wage: att.present ? att.wage || worker.dailyRate : 0,
      }));

      return {
        _id: worker._id,
        workerName: worker.workerName,
        workType: worker.workType,
        dailyRate: worker.dailyRate,
        attendance: formattedAttendance,
        totalWages,
      };
    });

    // Calculate grand total wages for all workers combined
    const grandTotalWages = filteredWorkers.reduce(
      (sum, worker) => sum + worker.totalWages,
      0
    );

    // Calculate total present days across all workers
    const totalPresentDays = filteredWorkers.reduce((sum, worker) => {
      return sum + worker.attendance.filter((att) => att.present).length;
    }, 0);

    res.json({
      workers: filteredWorkers,
      grandTotalWages,
      totalPresentDays,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all worker names for dropdown
exports.getWorkerNames = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const workers = await Labor.find({ userId: userObjectId }).select(
      "workerName _id advance"
    );
    res.json({ workers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== NEW ADVANCE PAYMENT FEATURES ====================

// Add or update advance payment for a worker
exports.addAdvancePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const labor = await Labor.findOne({ _id: id, userId: req.userId });
    if (!labor) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Add amount to existing advance
    const previousAdvance = labor.advance || 0;
    labor.advance = previousAdvance + amount;

    // Create expense record for advance payment
    const expense = new Expense({
      userId: req.userId,
      itemName: `Labor advance for ${labor.workerName}`,
      category: "Labor",
      quantity: 1,
      unit: "payment",
      unitPrice: amount,
      purchaseDate: new Date(),
      totalAmount: amount,
      notes: notes || `Advance payment to ${labor.workerName}`,
    });

    await expense.save();
    await labor.save();

    res.json({
      message: "Advance payment added successfully",
      worker: labor,
      expense: expense,
      previousAdvance,
      newAdvance: labor.advance,
      amountAdded: amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get weekly wages summary for workers (for payment preparation)
exports.getWeeklyWagesSummary = async (req, res) => {
  try {
    const { paymentDay = "Sunday" } = req.query; // Default to Sunday

    // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const paymentDayNum = dayMap[paymentDay] || 0;

    // Calculate the current week based on payment day
    const today = new Date();
    const todayDayNum = today.getDay();

    // Calculate days since last payment day
    let daysSincePayment = (todayDayNum - paymentDayNum + 7) % 7;
    if (daysSincePayment === 0 && today.getHours() < 12) {
      // If it's payment day morning, consider previous week
      daysSincePayment = 7;
    }

    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - daysSincePayment);
    weekStartDate.setHours(0, 0, 0, 0);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    const workers = await Labor.find({ userId: req.userId }).select(
      "workerName attendance dailyRate advance weeklyPayments"
    );

    const weeklyWagesSummary = workers.map((worker) => {
      // Filter attendance for current week
      const weekAttendance = worker.attendance.filter((att) => {
        const attDate = new Date(att.date);
        return (
          attDate >= weekStartDate && attDate <= weekEndDate && att.present
        );
      });

      // Calculate total wages for the week
      const totalWeekWages = weekAttendance.reduce((sum, att) => {
        return sum + (att.wage || worker.dailyRate);
      }, 0);

      // Check if payment already made for this week
      function isSameDayDS(dateA, dateB) {
        // Ensures both are date objects, and compares Y/M/D
        const a = new Date(dateA);
        const b = new Date(dateB);
        return (
          a.getUTCFullYear() === b.getUTCFullYear() &&
          a.getUTCMonth() === b.getUTCMonth() &&
          a.getUTCDate() === b.getUTCDate()
        );
      }

      const existingPayment = worker.weeklyPayments.find(
        (payment) =>
          isSameDayDS(payment.weekStartDate, weekStartDate) &&
          isSameDayDS(payment.weekEndDate, weekEndDate)
      );

      return {
        _id: worker._id,
        workerName: worker.workerName,
        totalWeekWages,
        advance: worker.advance || 0,
        daysWorked: weekAttendance.length,
        weekStartDate: weekStartDate.toISOString().split("T")[0],
        weekEndDate: weekEndDate.toISOString().split("T")[0],
        paymentMade: !!existingPayment,
        paymentDetails: existingPayment || null,
        dailyRate: worker.dailyRate,
      };
    });

    res.json({
      weeklyWagesSummary,
      paymentDay,
      weekRange: {
        startDate: weekStartDate.toISOString().split("T")[0],
        endDate: weekEndDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark weekly payment for a worker
exports.markWeeklyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      weekStartDate,
      weekEndDate,
      totalWages,
      advanceDeducted = 0,
      notes,
      paymentDay = "Sunday",
    } = req.body;

    if (!weekStartDate || !weekEndDate || totalWages === undefined) {
      return res.status(400).json({
        message: "Week dates and total wages are required",
      });
    }

    const labor = await Labor.findOne({ _id: id, userId: req.userId });
    if (!labor) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Validate advance deduction
    if (advanceDeducted > labor.advance) {
      return res.status(400).json({
        message: "Cannot deduct more than available advance amount",
      });
    }

    // Check if payment already exists for this week
    const existingPayment = labor.weeklyPayments.find((payment) => {
      const paymentWeekStart = new Date(payment.weekStartDate);
      const paymentWeekEnd = new Date(payment.weekEndDate);
      return (
        paymentWeekStart.getTime() === new Date(weekStartDate).getTime() &&
        paymentWeekEnd.getTime() === new Date(weekEndDate).getTime()
      );
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already marked for this week",
      });
    }

    // Calculate net payment
    const netPayment = Math.max(0, totalWages - advanceDeducted);

    // Create expense record for weekly payment (only if net payment > 0)
    let expense = null;
    if (netPayment > 0) {
      expense = new Expense({
        userId: req.userId,
        itemName: `Weekly payment for ${labor.workerName}`,
        category: "Labor",
        quantity: 1,
        unit: "payment",
        unitPrice: netPayment,
        purchaseDate: new Date(),
        totalAmount: netPayment,
        notes:
          notes ||
          `Weekly payment to ${labor.workerName} (${weekStartDate} to ${weekEndDate})`,
      });
      await expense.save();
    }

    // Update advance balance
    labor.advance = (labor.advance || 0) - advanceDeducted;

    // Add weekly payment record
    const weeklyPayment = {
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      paymentDate: new Date(),
      totalWages,
      advanceDeducted,
      netPayment,
      expenseId: expense ? expense._id : null,
      notes,
    };

    labor.weeklyPayments.push(weeklyPayment);
    await labor.save();

    res.json({
      message: "Weekly payment marked successfully",
      worker: labor,
      paymentDetails: weeklyPayment,
      expense: expense,
      remainingAdvance: labor.advance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payment history for a worker
exports.getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const labor = await Labor.findOne({ _id: id, userId: req.userId })
      .populate("weeklyPayments.expenseId")
      .select("workerName advance weeklyPayments");

    if (!labor) {
      return res.status(404).json({ message: "Worker not found" });
    }

    let filteredPayments = labor.weeklyPayments;

    // Filter by date range if provided
    if (startDate && endDate) {
      filteredPayments = labor.weeklyPayments.filter((payment) => {
        const paymentDate = new Date(payment.paymentDate);
        return (
          paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate)
        );
      });
    }

    // Sort by payment date (newest first)
    filteredPayments.sort(
      (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
    );

    res.json({
      workerName: labor.workerName,
      currentAdvance: labor.advance,
      paymentHistory: filteredPayments,
      totalPayments: filteredPayments.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update advance payment (for corrections)
exports.updateAdvancePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAdvanceAmount, notes } = req.body;

    if (newAdvanceAmount < 0) {
      return res
        .status(400)
        .json({ message: "Advance amount cannot be negative" });
    }

    const labor = await Labor.findOne({ _id: id, userId: req.userId });
    if (!labor) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const previousAdvance = labor.advance || 0;
    const difference = newAdvanceAmount - previousAdvance;

    // Update labor advance
    labor.advance = newAdvanceAmount;

    // Create expense record for the adjustment if there's a difference
    if (difference !== 0) {
      const expense = new Expense({
        userId: req.userId,
        itemName: `Labor advance adjustment for ${labor.workerName}`,
        category: "Labor",
        quantity: 1,
        unit: "adjustment",
        unitPrice: Math.abs(difference),
        purchaseDate: new Date(),
        totalAmount: Math.abs(difference),
        notes:
          notes ||
          `Advance adjustment for ${labor.workerName} (${
            difference > 0 ? "increase" : "decrease"
          })`,
      });
      await expense.save();
    }

    await labor.save();

    res.json({
      message: "Advance payment updated successfully",
      worker: labor,
      previousAdvance,
      newAdvance: labor.advance,
      adjustment: difference,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
