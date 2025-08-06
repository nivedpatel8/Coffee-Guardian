import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Loading from "../components/common/Loading";
import { getLaborStats } from "../services/labor";
import { getCurrentPractices } from "../services/practices";
import { getLatestPrices } from "../services/prices";
import { getExpenseStats } from "../services/expenses";
import {
  getCompletedStatus,
  saveCompletedStatus,
} from "../services/userPracticeStatus";
import QuickStats from "../components/dashboard/QuickStats";
import Weather from "../components/dashboard/Weather";
import PracticeSectionCard from "../components/dashboard/PracticeSectionCard";
import { useAuth } from "../context/AuthContext";

const PRACTICE_CARD_MIN_HEIGHT = 320; // Adjust if desired for uniform height


export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <div>Please login to view dashboard.</div>;
  }

  const userId = user._id;
  
  const { data: labor } = useQuery({
    queryKey: ["laborStats"],
    queryFn: getLaborStats,
  });

  const {
    data: tasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", "Coffee"], // Example: hardcoded crop here, adjust as needed
    queryFn: () => getCurrentPractices("Coffee"),
  });

  const { data: prices } = useQuery({
    queryKey: ["latestPrices"],
    queryFn: getLatestPrices,
  });

  const { data: expenses } = useQuery({
    queryKey: ["expensesStats"],
    queryFn: getExpenseStats,
  });

  const {
    data: completedState,
    refetch: refetchCompletedState,
    isLoading: isCompletedLoading,
  } = useQuery({
    queryKey: ["completedTasks", userId, tasks?.crop, tasks?.month],
    queryFn: () => getCompletedStatus(userId,tasks.crop, tasks.month),
    enabled: !!userId && !!tasks,
  });
console.log(userId)
  // const mutation = useMutation({
  //   mutationFn: ({ section, completedIndexes }) =>
  //     saveCompletedStatus(tasks.crop, tasks.month, section, completedIndexes),
  //   onSettled: () => refetchCompletedState(),
  // });

  // 3. Mutation to save completed status on checkbox toggle
  const mutation = useMutation({
    mutationFn: ({ section, completedIndexes }) =>
      saveCompletedStatus({
        crop: tasks.crop,
        month: tasks.month,
        section,
        completedIndexes,
      }),
    onSettled: () => {
      console.log("Refetching completedState after mutation");
      // Always refetch from backend after mutation to keep frontend in sync
      refetchCompletedState();
    },
  });

  const isLoading =
    !labor ||
    !tasks ||
    !prices ||
    !expenses ||
    isCompletedLoading ||
    isTasksLoading;
  if (isLoading) return <Loading />;

  if (tasksError)
    return (
      <div className="text-red-500 text-center mt-8">
        Error loading tasks: {tasksError.message}
      </div>
    );
  if (!tasks || !tasks.practices)
    return (
      <div className="text-center mt-8 text-gray-400">
        No practice data available.
      </div>
    );

  //   Prepare a map: section -> boolean array for completed items
  //  5. Map the completedState data to a section → boolean[] for checked array
  const completedMap = {};
  if (completedState) {
    completedState.forEach(({ section, completedIndexes }) => {
      const sectionItems = tasks.practices[section] || [];
      completedMap[section] = sectionItems.map((_, idx) =>
        completedIndexes.includes(idx)
      );
    });
  }

  // Get all section names for consistent order
  const allSections = Object.keys(tasks.practices);
console.log(completedState)

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 md:px-12 py-8 space-y-10">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <SummaryCard
          title="Total Workers"
          value={labor.stats?.totalWorkers ?? 0}
          icon="👷"
          gradient="from-purple-700 to-blue-600"
        />
        <SummaryCard
          title="Arabica ₹/50 kg"
          value={
            prices.find((p) => p.variety?.includes("Arabica"))?.price ?? "25000"
          }
          icon="☕"
          gradient="from-green-600 to-teal-500"
        />
        <SummaryCard
          title="Robusta ₹/50 kg"
          value={
            prices.find((p) => p.variety?.includes("Robusta"))?.price ?? "10300"
          }
          icon="🌱"
          gradient="from-yellow-600 to-orange-500"
        />
      </div>

      {/* Quick Stats */}
      <QuickStats stats={labor.stats} expStats={expenses} />
      <Weather />

      {/* Main Heading below stats */}
      <div className="flex flex-col items-center justify-center mb-8 max-w-4xl mx-auto">
        <h1 className="!text-amber-300 font-extrabold text-3xl md:text-4xl  tracking-wider drop-shadow-md text-center uppercase">
          {/* !text-3xl md:text-4xl font-extrabold text-amber-300 tracking-wide drop-shadow-md text-center */}
          {tasks.crop} – {tasks.month} Practices
        </h1>
        <div className="w-48 h-1 bg-amber-600 rounded mt-2" />
      </div>

      {/* Practice Sections stacked vertically */}
      <div className="max-w-6xl mx-auto flex flex-col gap-7">
        {/* Practice Sections */}
        <div className="flex flex-col gap-6">
          {Object.entries(tasks.practices).map(([section, items]) => (
            <PracticeSectionCard
              key={section}
              section={section}
              items={items}
              minHeight={PRACTICE_CARD_MIN_HEIGHT}
              initialChecked={
                completedMap[section] || Array(items.length).fill(false)
              }
              onStatusChange={(sectionName, checkedArray) => {
                // Compute all checked indexes for this section (full state)
                const completedIndexes = checkedArray.reduce(
                  (arr, checked, idx) => (checked ? [...arr, idx] : arr),
                  []
                );

                // Call mutation to save updated status
                mutation.mutate({ section: sectionName, completedIndexes });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, gradient }) {
  return (
    <div
      className={`bg-gradient-to-tr ${gradient} rounded-xl shadow-lg p-6 flex items-center space-x-4`}
    >
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="uppercase text-sm tracking-widest opacity-80">{title}</p>
        <p className="text-3xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}
