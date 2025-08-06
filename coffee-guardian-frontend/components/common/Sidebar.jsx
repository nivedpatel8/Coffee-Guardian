import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaTachometerAlt,
  FaLeaf,
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaUserShield,
} from "react-icons/fa";

const Sidebar = ({ closeSidebar }) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FaTachometerAlt,
    },
    {
      name: "Practices",
      href: "/practices",
      icon: FaLeaf,
    },
    {
      name: "Labor",
      href: "/labor",
      icon: FaUsers,
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: FaMoneyBillWave,
    },
    {
      name: "Prices",
      href: "/prices",
      icon: FaChartLine,
    },
  ];

  // Add admin navigation if user is admin
  if (user?.role === "admin") {
    navigationItems.push({
      name: "Admin",
      href: "/admin",
      icon: FaUserShield,
    });
  }

  return (
    <aside
      className="sticky top-0 left-0 h-screen w-64 flex flex-col
                 bg-white/10 backdrop-blur-lg border-r border-white/20 shadow-lg
                 text-white z-30"
    >
      {/* Sidebar header/branding */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-white/20">
        {/* Replace with your logo or brand name */}
        <h1 className="!text-2xl to-blue-300 font-extrabold tracking-wide select-none">
          Coffee
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 select-none
                ${
                  isActive
                    ? "bg-gradient-to-r from-purple-700 to-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
              onClick={() => {
                if (closeSidebar) closeSidebar();
              }}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-5 w-5 transition-transform duration-150 ${
                  // Slight scale-up when active or on hover for subtle effect
                  "group-hover:scale-110"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
