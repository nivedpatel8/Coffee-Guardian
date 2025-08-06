// components/dashboard/Activity.jsx - Recent activity widget
import React from "react";
import {
  FaUsers,
  FaMoneyBillWave,
  FaLeaf,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
import { formatDate } from "../../utils/format";

const Activity = () => {
  // Demo activity data - in production, this would come from your API
  const activities = [
    {
      id: 1,
      type: "labor",
      title: "Added new worker",
      description: "Ramesh Kumar joined as a harvesting worker",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: FaUsers,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "expense",
      title: "Expense recorded",
      description: "Fertilizer purchase - ₹5,200",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      icon: FaMoneyBillWave,
      color: "text-green-600",
    },
    {
      id: 3,
      type: "practice",
      title: "Practice completed",
      description: "Pruning activities in Block A completed",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      icon: FaLeaf,
      color: "text-green-500",
    },
    {
      id: 4,
      type: "price",
      title: "Price updated",
      description: "Coffee price updated to ₹24,500/50kg",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: FaChartLine,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <FaClock className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white`}
                      >
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {activity.title}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {formatDate(activity.timestamp, "relative")}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{activity.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6">
        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default Activity;