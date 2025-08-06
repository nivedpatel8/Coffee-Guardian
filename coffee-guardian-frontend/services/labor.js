// services/labor.js - Labor management API calls
import api from "./api";

// ===================== EXISTING FUNCTIONS =====================

// Get all labor records with pagination and filtering
export const getLaborRecords = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/labor?${queryString}`);
  return response.data;
};

// Add new labor record
export const addLaborRecord = async (laborData) => {
  const response = await api.post("/labor", laborData);
  return response.data;
};

// Update labor record
export const updateLaborRecord = async (id, laborData) => {
  const response = await api.put(`/labor/${id}`, laborData);
  return response.data;
};

// Delete labor record
export const deleteLaborRecord = async (id) => {
  const response = await api.delete(`/labor/${id}`);
  return response.data;
};

// Mark attendance for a worker
export const markAttendance = async (workerId, attendanceData) => {
  const response = await api.post(
    `/labor/${workerId}/attendance`,
    attendanceData
  );
  return response.data;
};

// Get labor statistics
export const getLaborStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/labor/stats?${queryString}`);
  return response.data;
};

// Get attendance report
export const getAttendanceReport = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/labor/attendance-report?${queryString}`);
  return response.data;
};

// Get worker names for dropdown
export const getWorkerNames = async () => {
  const response = await api.get("/labor/worker-names");
  return response.data;
};

// ===================== NEW ADVANCE PAYMENT & WEEKLY PAYMENT FUNCTIONS =====================

// Add advance payment to a worker
export const addAdvancePayment = async (workerId, advanceData) => {
  const response = await api.post(`/labor/${workerId}/advance`, advanceData);
  return response.data;
};

// Update advance payment for a worker (for corrections)
export const updateAdvancePayment = async (workerId, updateData) => {
  const response = await api.put(`/labor/${workerId}/advance`, updateData);
  return response.data;
};

// Get weekly wages summary for all workers
export const getWeeklyWagesSummary = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/labor/weekly-wages-summary?${queryString}`);
  return response.data;
};

// Mark weekly payment for a worker
export const markWeeklyPayment = async (workerId, paymentData) => {
  const response = await api.post(
    `/labor/${workerId}/weekly-payment`,
    paymentData
  );
  return response.data;
};

// Get payment history for a specific worker
export const getPaymentHistory = async (workerId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/labor/${workerId}/payment-history?${queryString}`
  );
  return response.data;
};

// ===================== HELPER FUNCTIONS FOR FRONTEND =====================

// Calculate week range based on payment day
export const calculateWeekRange = (paymentDay = "Sunday") => {
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

  return {
    startDate: weekStartDate.toISOString().split("T")[0],
    endDate: weekEndDate.toISOString().split("T")[0],
    weekStartDate,
    weekEndDate,
  };
};

// Format currency for display
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Get payment day options for dropdown
export const getPaymentDayOptions = () => [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

// Validate advance deduction amount
export const validateAdvanceDeduction = (
  deductionAmount,
  availableAdvance,
  totalWages
) => {
  const errors = [];

  if (deductionAmount < 0) {
    errors.push("Deduction amount cannot be negative");
  }

  if (deductionAmount > availableAdvance) {
    errors.push("Cannot deduct more than available advance amount");
  }

  if (deductionAmount > totalWages) {
    errors.push("Deduction amount cannot exceed total wages");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Calculate net payment after advance deduction
export const calculateNetPayment = (totalWages, advanceDeducted = 0) => {
  return Math.max(0, totalWages - advanceDeducted);
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format date range for display
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

// Get week number of the year
export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

// Check if payment is overdue based on payment day
export const isPaymentOverdue = (lastPaymentDate, paymentDay = "Sunday") => {
  if (!lastPaymentDate) return false;

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
  const today = new Date();
  const lastPayment = new Date(lastPaymentDate);

  // Calculate next expected payment date
  const daysSinceLastPayment = Math.floor(
    (today - lastPayment) / (1000 * 60 * 60 * 24)
  );
  const daysSincePaymentDay = (today.getDay() - paymentDayNum + 7) % 7;

  // If more than 7 days since last payment and we've passed the payment day
  return daysSinceLastPayment > 7 && daysSincePaymentDay > 0;
};

// Group payments by month for reporting
export const groupPaymentsByMonth = (payments) => {
  return payments.reduce((groups, payment) => {
    const date = new Date(payment.paymentDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!groups[monthKey]) {
      groups[monthKey] = {
        month: date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
        }),
        payments: [],
        totalWages: 0,
        totalAdvanceDeducted: 0,
        totalNetPayment: 0,
      };
    }

    groups[monthKey].payments.push(payment);
    groups[monthKey].totalWages += payment.totalWages || 0;
    groups[monthKey].totalAdvanceDeducted += payment.advanceDeducted || 0;
    groups[monthKey].totalNetPayment += payment.netPayment || 0;

    return groups;
  }, {});
};

// Calculate summary statistics for payments
export const calculatePaymentSummary = (payments) => {
  return payments.reduce(
    (summary, payment) => {
      summary.totalPayments += 1;
      summary.totalWages += payment.totalWages || 0;
      summary.totalAdvanceDeducted += payment.advanceDeducted || 0;
      summary.totalNetPayments += payment.netPayment || 0;

      return summary;
    },
    {
      totalPayments: 0,
      totalWages: 0,
      totalAdvanceDeducted: 0,
      totalNetPayments: 0,
    }
  );
};
