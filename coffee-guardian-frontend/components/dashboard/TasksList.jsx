// components/dashboard/TasksList.jsx - Current month tasks and practices
import React from "react";
import { FaLeaf, FaCheckCircle } from "react-icons/fa";
import { getCurrentMonthName } from "../../utils/format";

const TasksList = ({ practices, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = getCurrentMonthName();
  const practiceCategories = practices?.practices || {};

  const renderPracticeCategory = (categoryName, tasks) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div key={categoryName} className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          {/* <FaLeaf className="h-4 w-4 text-green-600 mr-2" /> */}
          {categoryName}
        </h4>
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-start">
              <FaCheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{task}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden px-0 py-0 sm:px-4 sm:py-6">
    {/* // <div className="bg-white rounded-lg shadow"> */}
    {/* //   <div className="px-6 py-4 border-b border-gray-200">
    //     <h3 className="text-lg font-medium text-gray-900">
    //       {currentMonth} Practices - {practices?.crop || "Coffee"}
    //     </h3>
    //     <p className="text-sm text-gray-500 mt-1">
    //       Recommended farming practices for this month
    //     </p>
    //   </div> */}

         <div className="px-6 py-4 border-b border-gray-200 sticky top-0 z-10 bg-white">
             <h3 className="text-lg font-medium text-gray-900">
                 {currentMonth} Practices – {practices?.crop || "Coffee"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
                Recommended farming practices for this month
            </p>
        </div>


      <div className="p-6">
        {Object.keys(practiceCategories).length > 0 ? (
          <div className="space-y-6 text-lg">
            {Object.entries(practiceCategories).map(([category, tasks]) =>
              renderPracticeCategory(category, tasks)
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaLeaf className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No practices available for this month
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Check back later or contact your admin
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;



