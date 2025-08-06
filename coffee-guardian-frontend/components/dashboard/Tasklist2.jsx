// components/dashboard/TasksList.jsx
import React from "react";
import { FaLeaf, FaCheckCircle } from "react-icons/fa";

const Tasklist2 = ({ title, items = [] }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
    <h3 className="text-amber-800 font-semibold text-lg mb-4 flex items-center">
      <FaLeaf className="h-5 w-5 mr-2" />
      {title}
    </h3>
    {items.length > 0 ? (
      <ul className="flex-1 space-y-2">
        {items.map((task, idx) => (
          <li key={task} className="flex items-start">
            {/* <FaCheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" /> */}
            <span className="text-sm text-gray-700">{task}</span>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-400 text-sm text-center py-4">
        No practices under this category
      </div>
    )}
  </div>
);

export default Tasklist2;
