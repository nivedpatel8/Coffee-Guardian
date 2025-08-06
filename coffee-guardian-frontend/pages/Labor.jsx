import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getLaborRecords,
  addLaborRecord,
  deleteLaborRecord,
  updateLaborRecord,
  markAttendance,
  getLaborStats,
  getAttendanceReport,
  getWorkerNames,
  // New advance and weekly payment imports
  addAdvancePayment,
  updateAdvancePayment,
  getWeeklyWagesSummary,
  markWeeklyPayment,
  getPaymentHistory,
  // Helper function imports
  formatCurrency,
  getPaymentDayOptions,
  validateAdvanceDeduction,
  calculateNetPayment,
  formatDate,
  formatDateRange,
  calculateWeekRange,
} from "../services/labor";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import {
  FaTrashAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserCheck,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaHistory,
  FaPlus,
  FaCalculator,
  FaHandHoldingUsd,
  FaWallet,
} from "react-icons/fa";

// StatCard component defined at the top
function StatCard({ title, value, className, icon: Icon }) {
  return (
    <div className={`rounded-lg p-6 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="bg-white/20 rounded-full p-3">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Labor() {
  const qc = useQueryClient();

  // ===================== EXISTING STATE (unchanged) =====================

  // State for adding new labor
  const [form, setForm] = useState({
    workerName: "",
    gender: "",
    workType: "",
    skillLevel: "unskilled",
    dailyRate: 400,
  });

  // State for editing labor (store id of editing record)
  const [editingId, setEditingId] = useState(null);
  // State for editable labor form
  const [editForm, setEditForm] = useState({});

  // Attendance modal states
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceWage, setAttendanceWage] = useState(0);
  const [selectedLabor, setSelectedLabor] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(true);

  // Attendance report filters
  const [reportStartDate, setReportStartDate] = useState(new Date());
  const [reportEndDate, setReportEndDate] = useState(new Date());
  const [selectedWorker, setSelectedWorker] = useState("");

  // ===================== NEW STATE FOR ADVANCE & WEEKLY PAYMENTS =====================

  // Advance payment modal states
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceNotes, setAdvanceNotes] = useState("");
  const [selectedWorkerForAdvance, setSelectedWorkerForAdvance] =
    useState(null);

  // Weekly payment states
  const [paymentDay, setPaymentDay] = useState(() => {
    return localStorage.getItem("labor_payment_day") || "Sunday";
  });
  const [weeklyPaymentModalOpen, setWeeklyPaymentModalOpen] = useState(false);
  const [selectedWeeklyPayment, setSelectedWeeklyPayment] = useState(null);
  const [advanceDeductionAmount, setAdvanceDeductionAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState("");

  // to handle paymentDay in local storage
  const handlePaymentDayChange = (e) => {
    setPaymentDay(e.target.value);
    localStorage.setItem("labor_payment_day", e.target.value);
  };

  // Payment history modal
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
  const [selectedWorkerForHistory, setSelectedWorkerForHistory] =
    useState(null);

  // View toggles
  const [activeTab, setActiveTab] = useState("workers"); // workers, payments, reports

  // ===================== EXISTING QUERIES (unchanged) =====================

  // Fetch labor records
  const {
    data: laborData,
    isLoading: laborLoading,
    isError: laborError,
    error: laborErrorMsg,
  } = useQuery({
    queryKey: ["labor"],
    queryFn: () => getLaborRecords(),
  });

  // Fetch worker names for dropdown
  const { data: workerNamesData } = useQuery({
    queryKey: ["workerNames"],
    queryFn: () => getWorkerNames(),
  });

  // Fetch labor stats with current date
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["laborStats", new Date().toISOString().split("T")[0]],
    queryFn: () =>
      getLaborStats({ date: new Date().toISOString().split("T")[0] }),
  });

  // Fetch attendance report for selected filters
  const {
    data: attendanceReport,
    isLoading: attendanceReportLoading,
    refetch: refetchAttendanceReport,
  } = useQuery({
    queryKey: [
      "attendanceReport",
      reportStartDate.toISOString().split("T")[0],
      reportEndDate.toISOString().split("T")[0],
      selectedWorker,
    ],
    queryFn: () =>
      getAttendanceReport({
        startDate: reportStartDate.toISOString().split("T")[0],
        endDate: reportEndDate.toISOString().split("T")[0],
        ...(selectedWorker && { workerId: selectedWorker }),
      }),
  });

  // ===================== NEW QUERIES FOR ADVANCE & WEEKLY PAYMENTS =====================

  // Fetch weekly wages summary
  // Fetch weekly wages summary
  const {
    data: weeklyWagesData,
    isLoading: weeklyWagesLoading,
    refetch: refetchWeeklyWages,
  } = useQuery({
    queryKey: ["weeklyWages", paymentDay],
    queryFn: () => getWeeklyWagesSummary({ paymentDay }),
    // Add these options for better UX
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate updates
  });

  // Fetch payment history for selected worker
  const { data: paymentHistoryData, isLoading: paymentHistoryLoading } =
    useQuery({
      queryKey: ["paymentHistory", selectedWorkerForHistory?._id],
      queryFn: () =>
        selectedWorkerForHistory
          ? getPaymentHistory(selectedWorkerForHistory._id)
          : null,
      enabled: !!selectedWorkerForHistory,
    });

  // ===================== EXISTING MUTATIONS (unchanged) =====================

  // Mutation to add labor
  const addLabor = useMutation({
    mutationFn: () => addLaborRecord(form),
    onSuccess: () => {
      qc.invalidateQueries(["labor"]);
      qc.invalidateQueries(["laborStats"]);
      qc.invalidateQueries(["workerNames"]);
      qc.invalidateQueries(["weeklyWages"]);
      setForm({
        workerName: "",
        gender: "",
        workType: "",
        skillLevel: "unskilled",
        dailyRate: 400,
      });
    },
  });

  // Mutation to delete labor
  const deleteLabor = useMutation({
    mutationFn: deleteLaborRecord,
    onSuccess: () => {
      qc.invalidateQueries(["labor"]);
      qc.invalidateQueries(["laborStats"]);
      qc.invalidateQueries(["workerNames"]);
      qc.invalidateQueries(["weeklyWages"]);
    },
  });

  // Mutation to update labor record
  const updateLabor = useMutation({
    mutationFn: ({ id, data }) => updateLaborRecord(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["labor"]);
      qc.invalidateQueries(["laborStats"]);
      qc.invalidateQueries(["workerNames"]);
      qc.invalidateQueries(["weeklyWages"]);
      setEditingId(null);
      setEditForm({});
    },
  });

  // Mutation to mark attendance
  const markLaborAttendance = useMutation({
    mutationFn: ({ workerId, attendanceData }) =>
      markAttendance(workerId, attendanceData),
    onSuccess: () => {
      qc.invalidateQueries(["labor"]);
      qc.invalidateQueries(["attendanceReport"]);
      qc.invalidateQueries(["laborStats"]);
      qc.invalidateQueries(["weeklyWages"]);
      refetchAttendanceReport();
      // Close modal and show success
      setAttendanceModalOpen(false);
      // Reset form
      setSelectedLabor(null);
      setAttendanceDate(new Date());
      setAttendanceStatus(true);
      setAttendanceWage(0);
    },
  });

  // ===================== NEW MUTATIONS FOR ADVANCE & WEEKLY PAYMENTS =====================

  // Mutation to add advance payment
  const addAdvancePaymentMutation = useMutation({
    mutationFn: ({ workerId, advanceData }) =>
      addAdvancePayment(workerId, advanceData),
    onSuccess: () => {
      qc.invalidateQueries(["labor"]);
      qc.invalidateQueries(["workerNames"]);
      qc.invalidateQueries(["weeklyWages"]);
      setAdvanceModalOpen(false);
      setAdvanceAmount("");
      setAdvanceNotes("");
      setSelectedWorkerForAdvance(null);
    },
  });

  // Mutation to mark weekly payment

  const markWeeklyPaymentMutation = useMutation({
    mutationFn: ({ workerId, paymentData }) =>
      markWeeklyPayment(workerId, paymentData),
    onSuccess: () => {
      // Invalidate all related queries
      qc.invalidateQueries(["labor"]);
      qc.invalidateQueries(["weeklyWages"]); // This is key!
      qc.invalidateQueries(["paymentHistory"]);
      qc.invalidateQueries(["laborStats"]);

      // Force refetch weekly wages immediately
      refetchWeeklyWages();

      // Close modal and reset state
      setWeeklyPaymentModalOpen(false);
      setSelectedWeeklyPayment(null);
      setAdvanceDeductionAmount(0);
      setPaymentNotes("");
    },
    onError: (error) => {
      console.error("Payment failed:", error);
      // You can add toast notification here if needed
    },
  });

  // ===================== LOADING AND ERROR HANDLING =====================

  if (laborLoading || statsLoading) return <Loading />;

  if (laborError)
    return (
      <div className="text-center text-red-400 mt-10 bg-gray-900 p-8 rounded-lg">
        Error loading labor records: {laborErrorMsg?.message || "Unknown error"}
      </div>
    );

  // ===================== EXISTING HANDLERS (unchanged) =====================

  // Handler for starting edit
  const startEdit = (labor) => {
    setEditingId(labor._id);
    setEditForm({ ...labor });
  };

  // Handler for cancelling edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleWageChange = (e) => {
    const newValue = e.target.value;
    if (!Number.isNaN(Number(newValue)) || newValue === "") {
      setAttendanceWage(newValue);
    }
  };

  // Handler for saving edited labor
  const saveEdit = (id) => {
    if (!editForm.workerName || !editForm.dailyRate) return;
    updateLabor.mutate({ id, data: editForm });
  };

  // Handler to open attendance modal
  const openAttendanceModal = (labor) => {
    setSelectedLabor(labor);
    setAttendanceDate(new Date());
    setAttendanceStatus(true);
    setAttendanceWage(labor.dailyRate);
    setAttendanceModalOpen(true);
  };

  // Handler to submit attendance marking
  const submitAttendance = () => {
    if (!selectedLabor) return;
    const attendanceData = {
      date: attendanceDate.toISOString().split("T")[0],
      present: attendanceStatus,
      wage: attendanceWage,
    };
    markLaborAttendance.mutate({ workerId: selectedLabor._id, attendanceData });
  };

  // Helpers to update form values
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  // Filter handlers
  const onReportStartDateChange = (date) => {
    setReportStartDate(date);
  };

  const onReportEndDateChange = (date) => {
    setReportEndDate(date);
  };

  const onWorkerSelectionChange = (e) => {
    setSelectedWorker(e.target.value);
  };

  // ===================== NEW HANDLERS FOR ADVANCE & WEEKLY PAYMENTS =====================

  // Handler to open advance payment modal
  const openAdvanceModal = (worker) => {
    setSelectedWorkerForAdvance(worker);
    setAdvanceAmount("");
    setAdvanceNotes("");
    setAdvanceModalOpen(true);
  };

  // Handler to submit advance payment
  const submitAdvancePayment = () => {
    if (!selectedWorkerForAdvance || !advanceAmount || advanceAmount <= 0)
      return;

    const advanceData = {
      amount: parseFloat(advanceAmount),
      notes: advanceNotes,
    };

    addAdvancePaymentMutation.mutate({
      workerId: selectedWorkerForAdvance._id,
      advanceData,
    });
  };

  // Handler to open weekly payment modal
  const openWeeklyPaymentModal = (paymentSummary) => {
    setSelectedWeeklyPayment(paymentSummary);
    setAdvanceDeductionAmount(0);
    setPaymentNotes("");
    setWeeklyPaymentModalOpen(true);
  };

  // Handler to submit weekly payment
  const submitWeeklyPayment = () => {
    if (!selectedWeeklyPayment) return;

    const paymentData = {
      weekStartDate: selectedWeeklyPayment.weekStartDate,
      weekEndDate: selectedWeeklyPayment.weekEndDate,
      totalWages: selectedWeeklyPayment.totalWeekWages,
      advanceDeducted: advanceDeductionAmount,
      paymentDay,
      notes: paymentNotes,
    };

    markWeeklyPaymentMutation.mutate({
      workerId: selectedWeeklyPayment._id,
      paymentData,
    });
  };

  // Handler to open payment history
  const openPaymentHistory = (worker) => {
    setSelectedWorkerForHistory(worker);
    setPaymentHistoryModalOpen(true);
  };

  // Handler for advance deduction validation
  const handleAdvanceDeductionChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const validation = validateAdvanceDeduction(
      value,
      selectedWeeklyPayment?.advance || 0,
      selectedWeeklyPayment?.totalWeekWages || 0
    );

    if (validation.isValid) {
      setAdvanceDeductionAmount(value);
    }
  };

  // Calculate net payment for display
  const netPayment = selectedWeeklyPayment
    ? calculateNetPayment(
        selectedWeeklyPayment.totalWeekWages,
        advanceDeductionAmount
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Labor Management
          </h1>
          <p className="text-gray-400">Manage your workforce efficiently</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("workers")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "workers"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaUsers className="inline mr-2" />
            Workers
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "payments"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Weekly Payments
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "reports"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaChartLine className="inline mr-2" />
            Reports
          </button>
        </div>

        {/* Enhanced Labor Stats */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <StatCard
              title="Total Workers"
              value={statsData.stats?.totalWorkers || 0}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
              icon={FaUsers}
            />
            <StatCard
              title="Average Daily Rate"
              value={formatCurrency(statsData.stats?.avgDailyRate || 0)}
              className="bg-gradient-to-r from-green-500 to-green-600"
              icon={FaChartLine}
            />
            <StatCard
              title="Today's Workers"
              value={statsData.dailyStats?.workersPresent || 0}
              className="bg-gradient-to-r from-orange-500 to-orange-600"
              icon={FaCalendarDay}
            />
            <StatCard
              title="Today's Wages"
              value={formatCurrency(statsData.dailyStats?.totalDailyWages || 0)}
              className="bg-gradient-to-r from-red-500 to-red-600"
              icon={FaCalendarDay}
            />
            <StatCard
              title="Weekly Wages"
              value={formatCurrency(
                statsData.dailyStats?.totalWeeklyWages || 0
              )}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600"
              icon={FaCalendarWeek}
            />
            <StatCard
              title="Monthly Wages"
              value={formatCurrency(
                statsData.dailyStats?.totalMonthlyWages || 0
              )}
              className="bg-gradient-to-r from-pink-500 to-pink-600"
              icon={FaCalendarAlt}
            />
          </div>
        )}

        {/* Workers Tab Content */}
        {activeTab === "workers" && (
          <>
            {/* Add Labor Form */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Add New Worker
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addLabor.mutate();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4"
              >
                <input
                  type="text"
                  name="workerName"
                  placeholder="Worker Name"
                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.workerName}
                  onChange={handleFormChange}
                  required
                />
                <select
                  name="gender"
                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.gender}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select
                  name="workType"
                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.workType}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Work Type</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Pruning">Pruning</option>
                  <option value="Weeding">Weeding</option>
                  <option value="Processing">Processing</option>
                  <option value="General">General</option>
                </select>
                <select
                  name="skillLevel"
                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.skillLevel}
                  onChange={handleFormChange}
                >
                  <option value="unskilled">Unskilled</option>
                  <option value="semi-skilled">Semi-skilled</option>
                  <option value="skilled">Skilled</option>
                </select>
                <input
                  type="number"
                  name="dailyRate"
                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Daily Rate"
                  value={form.dailyRate}
                  onChange={(e) =>
                    setForm({ ...form, dailyRate: Number(e.target.value) })
                  }
                  required
                  min={0}
                />
                <Button
                  type="submit"
                  disabled={addLabor.isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  {addLabor.isLoading ? "Adding..." : "Add Worker"}
                </Button>
              </form>
            </div>

            {/* Labor List with Enhanced Actions */}
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  Workers List
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Work Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Skill
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Daily Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Advance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {laborData?.laborRecords?.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-400"
                        >
                          No labor records found.
                        </td>
                      </tr>
                    )}
                    {laborData?.laborRecords?.map((rec) => {
                      const isEditing = editingId === rec._id;
                      return (
                        <tr
                          key={rec._id}
                          className="hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                name="workerName"
                                value={editForm.workerName}
                                onChange={handleEditFormChange}
                                className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                              />
                            ) : (
                              <div className="text-sm font-medium text-white">
                                {rec.workerName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                name="gender"
                                value={editForm.gender || ""}
                                onChange={handleEditFormChange}
                                className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            ) : (
                              <div className="text-sm text-gray-300">
                                {rec.gender}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                name="workType"
                                value={editForm.workType || ""}
                                onChange={handleEditFormChange}
                                className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                              >
                                <option value="">Select Work Type</option>
                                <option value="Harvesting">Harvesting</option>
                                <option value="Pruning">Pruning</option>
                                <option value="Weeding">Weeding</option>
                                <option value="Processing">Processing</option>
                                <option value="General">General</option>
                              </select>
                            ) : (
                              <div className="text-sm text-gray-300">
                                {rec.workType}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                name="skillLevel"
                                value={editForm.skillLevel || "unskilled"}
                                onChange={handleEditFormChange}
                                className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                              >
                                <option value="unskilled">Unskilled</option>
                                <option value="semi-skilled">
                                  Semi-skilled
                                </option>
                                <option value="skilled">Skilled</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  rec.skillLevel === "skilled"
                                    ? "bg-green-100 text-green-800"
                                    : rec.skillLevel === "semi-skilled"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {rec.skillLevel}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                name="dailyRate"
                                type="number"
                                value={editForm.dailyRate || 0}
                                onChange={handleEditFormChange}
                                className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                                min={0}
                              />
                            ) : (
                              <div className="text-sm text-white">
                                {formatCurrency(rec.dailyRate)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-start space-y-1">
                              <div className="text-sm font-medium text-white">
                                {formatCurrency(rec.advance || 0)}
                              </div>
                              <button
                                onClick={() => openAdvanceModal(rec)}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                              >
                                <FaPlus className="h-2 w-2" />
                                Add
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => openAttendanceModal(rec)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              <FaUserCheck className="h-3 w-3" />
                              Mark
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openPaymentHistory(rec)}
                                className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                                aria-label="Payment history"
                              >
                                <FaHistory className="h-4 w-4" />
                              </button>
                              {!isEditing && (
                                <button
                                  onClick={() => startEdit(rec)}
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                                  aria-label="Edit labor"
                                >
                                  <FaEdit className="h-4 w-4" />
                                </button>
                              )}
                              {isEditing && (
                                <>
                                  <button
                                    onClick={() => saveEdit(rec._id)}
                                    disabled={updateLabor.isLoading}
                                    className="text-green-400 hover:text-green-300 transition-colors duration-200"
                                    aria-label="Save labor"
                                  >
                                    <FaSave className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                    aria-label="Cancel edit"
                                  >
                                    <FaTimes className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteLabor.mutate(rec._id)}
                                className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                aria-label="Delete labor"
                              >
                                <FaTrashAlt className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Weekly Payments Tab Content */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Payment Day Selection */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Weekly Payment Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Day:
                  </label>
                  <select
                    value={paymentDay}
                    onChange={handlePaymentDayChange}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getPaymentDayOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => refetchWeeklyWages()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full"
                  >
                    <FaCalculator className="inline mr-2" />
                    Refresh Wages
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Wages Summary */}
            {weeklyWagesLoading ? (
              <Loading />
            ) : weeklyWagesData &&
              weeklyWagesData.weeklyWagesSummary?.length > 0 ? (
              <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Weekly Wages Summary
                    </h2>
                    <p className="text-gray-400">
                      Week:{" "}
                      {formatDateRange(
                        weeklyWagesData.weekRange.startDate,
                        weeklyWagesData.weekRange.endDate
                      )}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Worker Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Days Worked
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total Wages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Advance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {weeklyWagesData.weeklyWagesSummary.map((summary) => (
                        <tr
                          key={summary._id}
                          className="hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {summary.workerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {summary.daysWorked}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {formatCurrency(summary.totalWeekWages)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-yellow-400">
                              {formatCurrency(summary.advance)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {summary.paymentMade ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!summary.paymentMade &&
                              summary.totalWeekWages > 0 && (
                                <button
                                  onClick={() =>
                                    openWeeklyPaymentModal(summary)
                                  }
                                  disabled={markWeeklyPaymentMutation.isLoading}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                                >
                                  <FaHandHoldingUsd className="h-3 w-3" />
                                  {markWeeklyPaymentMutation.isLoading
                                    ? "Processing..."
                                    : "Pay Now"}
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                <div className="text-gray-400">
                  No weekly wages data available for the selected payment day.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab Content */}
        {activeTab === "reports" && (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Attendance Report
            </h2>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Worker:
                </label>
                <select
                  value={selectedWorker}
                  onChange={onWorkerSelectionChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Workers</option>
                  {workerNamesData?.workers?.map((worker) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.workerName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date:
                </label>
                <DatePicker
                  selected={reportStartDate}
                  onChange={onReportStartDateChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date:
                </label>
                <DatePicker
                  selected={reportEndDate}
                  onChange={onReportEndDateChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  minDate={reportStartDate}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => refetchAttendanceReport()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Report Summary */}
            {attendanceReport && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-300">
                    Total Present Days
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {attendanceReport.totalPresentDays || 0}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-300">Total Wages</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(attendanceReport.grandTotalWages || 0)}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-300">Workers in Report</div>
                  <div className="text-2xl font-bold text-white">
                    {attendanceReport.workers?.length || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Report Table */}
            {attendanceReportLoading ? (
              <Loading />
            ) : attendanceReport && attendanceReport.workers?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Worker Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Wage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {attendanceReport.workers.map((worker) =>
                      worker.attendance.map((att, index) => (
                        <tr
                          key={`${worker._id}-${index}`}
                          className="hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {worker.workerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {att.formattedDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {att.dayName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {att.present ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {formatCurrency(att.wage)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400">
                  No attendance records found for the selected filters.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================== EXISTING MODALS ===================== */}

      {/* Attendance Modal */}
      {attendanceModalOpen && selectedLabor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Mark Attendance for {selectedLabor.workerName}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <DatePicker
                selected={attendanceDate}
                onChange={(date) => setAttendanceDate(date)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wage
              </label>
              <input
                type="number"
                value={attendanceWage}
                onChange={handleWageChange}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter daily wage"
                min="0"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={attendanceStatus}
                onChange={() => setAttendanceStatus((s) => !s)}
                className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Present</span>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setAttendanceModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitAttendance}
                disabled={markLaborAttendance.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {markLaborAttendance.isLoading
                  ? "Saving..."
                  : "Save Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== NEW MODALS FOR ADVANCE & WEEKLY PAYMENTS ===================== */}

      {/* Advance Payment Modal */}
      {advanceModalOpen && selectedWorkerForAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Add Advance for {selectedWorkerForAdvance.workerName}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Advance:{" "}
                {formatCurrency(selectedWorkerForAdvance.advance || 0)}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Advance Amount *
              </label>
              <input
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter advance amount"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={advanceNotes}
                onChange={(e) => setAdvanceNotes(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional notes"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setAdvanceModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitAdvancePayment}
                disabled={
                  addAdvancePaymentMutation.isLoading ||
                  !advanceAmount ||
                  advanceAmount <= 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {addAdvancePaymentMutation.isLoading
                  ? "Adding..."
                  : "Add Advance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Payment Modal */}
      {weeklyPaymentModalOpen && selectedWeeklyPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Weekly Payment for {selectedWeeklyPayment.workerName}
            </h2>

            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Week Period:</span>
                <span className="text-white">
                  {formatDateRange(
                    selectedWeeklyPayment.weekStartDate,
                    selectedWeeklyPayment.weekEndDate
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Days Worked:</span>
                <span className="text-white">
                  {selectedWeeklyPayment.daysWorked}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Wages:</span>
                <span className="text-white font-semibold">
                  {formatCurrency(selectedWeeklyPayment.totalWeekWages)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Available Advance:</span>
                <span className="text-yellow-400 font-semibold">
                  {formatCurrency(selectedWeeklyPayment.advance)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Advance Deduction
              </label>
              <input
                type="number"
                value={advanceDeductionAmount}
                onChange={handleAdvanceDeductionChange}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount to deduct"
                min="0"
                max={Math.min(
                  selectedWeeklyPayment.advance,
                  selectedWeeklyPayment.totalWeekWages
                )}
                step="0.01"
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum:{" "}
                {formatCurrency(
                  Math.min(
                    selectedWeeklyPayment.advance,
                    selectedWeeklyPayment.totalWeekWages
                  )
                )}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-300">Net Payment:</span>
                <span className="text-green-400">
                  {formatCurrency(netPayment)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Notes
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional payment notes"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setWeeklyPaymentModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitWeeklyPayment}
                disabled={markWeeklyPaymentMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {markWeeklyPaymentMutation.isLoading
                  ? "Processing..."
                  : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {paymentHistoryModalOpen && selectedWorkerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 space-y-4 shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Payment History - {selectedWorkerForHistory.workerName}
              </h2>
              <button
                onClick={() => setPaymentHistoryModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            {paymentHistoryLoading ? (
              <Loading />
            ) : paymentHistoryData &&
              paymentHistoryData.paymentHistory?.length > 0 ? (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Current Advance:</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatCurrency(paymentHistoryData.currentAdvance)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Week Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total Wages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Advance Deducted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Net Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {paymentHistoryData.paymentHistory.map(
                        (payment, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-700 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">
                                {formatDate(payment.paymentDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {formatDateRange(
                                  payment.weekStartDate,
                                  payment.weekEndDate
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">
                                {formatCurrency(payment.totalWages)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-yellow-400">
                                {formatCurrency(payment.advanceDeducted)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-400">
                                {formatCurrency(payment.netPayment)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {payment.notes || "-"}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FaWallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-gray-400">
                  No payment history found for this worker.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
