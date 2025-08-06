import React from "react";
import {
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaClipboardList,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { formatCurrency, formatNumber } from "../../utils/format";

const QuickStats = ({ stats, expStats }) => {
  const statCards = [
    {
      title: "Total Workers",
      value: stats?.totalWorkers || 0,
      icon: FaUsers,
      colorFrom: "from-blue-500",
      colorTo: "to-blue-600",
      change: stats?.workerChange,
    },
    {
      title: "Monthly Expenses",
      value: Array.isArray(expStats?.monthlyStats)
        ? expStats.monthlyStats.reduce(
            (sum, item) => sum + (item?.totalAmount || 0),
            0
          )
        : 0,
      icon: FaMoneyBillWave,
      colorFrom: "from-green-500",
      colorTo: "to-green-600",
      change: expStats?.expenseChange,
    },
    {
      title: "Arabica",
      value: stats?.coffeePrice
        ? `${formatCurrency(stats.coffeePrice)}/50 kg`
        : "₹25,000 / 50 kg",
      icon: FaChartLine,
      colorFrom: "from-orange-500",
      colorTo: "to-orange-600",
      change: stats?.priceChange,
    },
    {
      title: "Robusta",
      value: stats?.coffeePrice
        ? `${formatCurrency(stats.coffeePrice)}/50 kg`
        : "₹10,000 / 50 kg",
      icon: FaChartLine,
      colorFrom: "from-yellow-500",
      colorTo: "to-yellow-600",
      change: stats?.priceChange,
    },
    // Uncomment if you want Active Tasks card
    // {
    //   title: "Active Tasks",
    //   value: stats?.activeTasks || 0,
    //   icon: FaClipboardList,
    //   colorFrom: "from-purple-500",
    //   colorTo: "to-purple-600",
    //   change: null,
    // },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const hasChange = stat.change !== null && stat.change !== undefined;
        const isChangePositive = stat.change > 0;
        const ChangeIcon = isChangePositive ? FaArrowUp : FaArrowDown;
        const changeColor = isChangePositive
          ? "text-green-600"
          : "text-red-600";
        const changeBg = isChangePositive ? "bg-green-100" : "bg-red-100";

        return (
          <div
            key={index}
            className={`relative rounded-xl p-6 shadow-lg bg-white/10 backdrop-blur-md border border-white/20 transition hover:shadow-xl hover:bg-white/20 cursor-pointer flex items-center space-x-4
              bg-gradient-to-br ${stat.colorFrom} ${stat.colorTo}`}
          >
            <div className="flex items-center justify-center rounded-lg bg-white/20 p-3 shadow-inner">
              <Icon className="h-7 w-7 text-white drop-shadow" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold tracking-wide text-white/90 truncate">
                {stat.title}
              </p>
              <p className="mt-1 text-3xl font-bold text-white truncate">
                {stat.title === "Monthly Expenses" ||
                stat.title === "Total Workers" ||
                stat.title === "Active Tasks"
                  ? formatNumber(stat.value)
                  : stat.value}
              </p>
              {hasChange && (
                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeColor} ${changeBg}`}
                  >
                    <ChangeIcon className="-ml-0.5 mr-1 h-4 w-4" />
                    {formatNumber(Math.abs(stat.change))}%
                  </span>
                  <span className="text-xs text-white/70">from last month</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
