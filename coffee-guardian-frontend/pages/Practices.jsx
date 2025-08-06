import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPracticesForCrop } from "../services/practices";
import Loading from "../components/common/Loading";

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const crops = ["Coffee", "Black Pepper", "Coorg Mandrin"];

export default function Practices() {
  const [selectedCrop, setSelectedCrop] = useState("Coffee");
  const [selectedMonth, setSelectedMonth] = useState("");

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allPractices", selectedCrop],
    queryFn: () => getAllPracticesForCrop(selectedCrop),
    keepPreviousData: true,
  });

  const sortedData = useMemo(() => {
    return data
      .slice()
      .sort(
        (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
      );
  }, [data]);

  const filteredData = useMemo(() => {
    if (!selectedMonth) return sortedData;
    return sortedData.filter((entry) => entry.month === selectedMonth);
  }, [sortedData, selectedMonth]);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-center text-red-500 py-8">
        Error loading practices: {error?.message || "Unknown error"}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      {/* Filters */}
      <div className="flex sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-0 sm:space-x-8 mb-8">
        <div className=" text-gray-400">
          <label
            htmlFor="crop-select"
            className="mb-1 font-semibold text-amber-400 select-none"
          >
            Select Crop
          </label>
          <select
            id="crop-select"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="rounded-lg bg-gray-800 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        <div className=" text-gray-400">
          <label
            htmlFor="month-select"
            className="mb-1 font-semibold text-amber-400 select-none"
          >
            Select Month
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg bg-gray-800 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Months</option>
            {monthOrder.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      

      {/* Heading */}
      <h1 className="!text-amber-500 font-extrabold text-3xl text-center drop-shadow-lg uppercase">
        {/* !text-3xl sm:text-4xl font-extrabold text-center text-amber-400 drop-shadow-lg */}
        Agricultural Practices for{" "}
        <span className="text-white">{selectedCrop}</span> for{" "}
        <span className="text-white">{selectedMonth || "All Months"}</span>
      </h1>

      {/* Practices */}
      {filteredData.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">
          No practices found for selected filters.
        </p>
      ) : (
        filteredData.map(({ month, practices }) => (
          <div key={month} className="space-y-6">
            {!selectedMonth && (
              <h2 className="!text-amber-300 font-semibold text-2xl md:text-2xl mb-4 border-b-2 border-amber-500 pb-2 drop-shadow-md uppercase">
                {month}
              </h2>
            )}

            <div className="flex flex-col gap-6 max-w-full mx-auto pt-3">
              {Object.entries(practices).map(([category, items]) => (
                <section
                  key={category}
                  className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-600 max-w-full mx-auto"
                  aria-label={`${category} practices`}
                  style={{ minWidth: "100%" }}
                >
                  {/* <h3 className="!text-xl md:text-2xl font-bold mb-4 border-b border-amber-500 pb-2 text-amber-400 uppercase tracking-wide select-none drop-shadow"> */}
                  <h3 className="!text-amber-300 font-extrabold text-xl md:text-2xl mb-4 border-b border-amber-400 pb-2 tracking-wider uppercase">
                    {category}
                  </h3>

                  {items.length === 0 ? (
                    <p className="text-center text-gray-400 italic">
                      No tasks for {category} in {month}
                    </p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-base">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
