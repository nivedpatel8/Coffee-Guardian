import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Loading from "../components/common/Loading";
import { getLaborStats } from "../services/labor";
import { getCurrentPractices } from "../services/practices";
import { getLatestPrices } from "../services/prices";
import {
  getCompletedStatus,
  saveCompletedStatus,
} from "../services/userTaskStatus";

export default function Dashboard() {
  const { data: labor } = useQuery({
    queryKey: ["laborStats"],
    queryFn: getLaborStats,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getCurrentPractices("Coffee"),
  });

  const { data: prices } = useQuery({
    queryKey: ["latestPrices"],
    queryFn: getLatestPrices,
  });

  // Fetch completed state after tasks are loaded:
  const {
    data: completedState,
    refetch: refetchCompletedState,
    isLoading: isCompletedLoading,
  } = useQuery({
    queryKey: ["completedTasks", tasks?.crop, tasks?.month],
    queryFn: () => getCompletedStatus(tasks.crop, tasks.month),
    enabled: !!tasks,
  });

  // Mutation to update completed status
  const mutation = useMutation({
    mutationFn: ({ section, completedIndexes }) =>
      saveCompletedStatus(tasks.crop, tasks.month, section, completedIndexes),
    onSettled: () => refetchCompletedState(),
  });

  const isLoading = !labor || !tasks || !prices || isCompletedLoading;
  if (isLoading) return <Loading />;

  // Prepare a map: section -> [bool, bool, bool...]
  const completedMap = {};
  if (completedState && tasks) {
    completedState.forEach((stat) => {
      // Defensive fallback: if task not found, map to empty array
      const practiceItems = tasks.practices[stat.section] || [];
      completedMap[stat.section] = practiceItems.map((_, idx) =>
        stat.completedIndexes.includes(idx)
      );
    });
  }

  return (
    <div className="space-y-10 px-4 md:px-8 py-6 bg-gray-50 min-h-screen">
      {/* Quick summary cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Workers" value={labor.stats.totalWorkers} />
        <Card
          title="Arabica ₹/50 kg"
          value={
            prices.find((p) => p.variety.includes("Arabica"))?.price ?? "N/A"
          }
        />
        <Card
          title="Robusta ₹/50 kg"
          value={
            prices.find((p) => p.variety.includes("Robusta"))?.price ?? "N/A"
          }
        />
      </div>

      {/* Heading */}
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-800">
          {tasks.crop} – {tasks.month} practices
        </h2>
        <div className="w-24 h-1 bg-amber-700 rounded mt-2"></div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
        {Object.entries(tasks.practices).map(([section, list]) => (
          <TaskCard
            key={section}
            title={section}
            items={list}
            initialChecked={
              // Use stored status if available, else default to false array
              completedMap[section] || Array(list.length).fill(false)
            }
            onStatusChange={(section, checkedArray) => {
              const completedIndexes = checkedArray.reduce(
                (arr, checked, idx) => (checked ? [...arr, idx] : arr),
                []
              );
              mutation.mutate({ section, completedIndexes });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-6 flex flex-col items-center">
      <span className="text-sm text-gray-700">{title}</span>
      <span className="text-3xl font-semibold mt-1">{value}</span>
    </div>
  );
}

function TaskCard({ title, items, initialChecked, onStatusChange }) {
  // Properly initialize and synchronize checkedItems state with initialChecked prop
  const [checkedItems, setCheckedItems] = React.useState(() => [
    ...initialChecked,
  ]);

  // When initialChecked changes asynchronously, update local state accordingly
  React.useEffect(() => {
    setCheckedItems([...initialChecked]);
  }, [initialChecked]);

  const toggleItem = (idx) => {
    const updated = checkedItems.map((checked, i) =>
      i === idx ? !checked : checked
    );
    setCheckedItems(updated);
    if (onStatusChange) onStatusChange(title, updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
      <h3 className="text-amber-800 font-semibold text-lg mb-4">{title}</h3>
      <ul className="flex-1 space-y-2">
        {items.map((item, idx) => (
          <li key={`${title}-${item}`} className="flex items-start">
            <input
              type="checkbox"
              checked={checkedItems[idx]}
              onChange={(e) => {
                e.preventDefault(); // Prevent default browser action (not always necessary for checkboxes)
                toggleItem(idx);
              }}
              className="form-checkbox mt-1 text-amber-600"
              id={`${title}-${idx}`}
            />
            <label
              htmlFor={`${title}-${idx}`}
              className="ml-3 text-sm text-gray-700 cursor-pointer"
            >
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
