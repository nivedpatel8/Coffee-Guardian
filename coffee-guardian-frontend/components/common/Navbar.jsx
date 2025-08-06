import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUserCircle, FaSignOutAlt, FaCog, FaCoffee } from "react-icons/fa";
import Button from "./Button";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="backdrop-blur-lg bg-white/20 border-b border-white/30 shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center hover:opacity-90 transition-opacity duration-300">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-700 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-2xl select-none">CG</span>
              </div>
              <span className="ml-3 text-lg font-extrabold text-white drop-shadow-md select-none">
                Coffee Guardian Pro
              </span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">

            {/* User Info - hidden on small screens */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white font-semibold select-none">{user?.name || "User"}</p>
                <p className="text-xs text-gray-300 capitalize select-none">{user?.role || "Guest"}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
                <FaUserCircle className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">

              <Link to="/profile" aria-label="Profile settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-purple-400 transition-colors duration-300"
                  aria-label="Profile Settings"
                >
                  <FaCog className="h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:text-red-400 flex items-center space-x-1 transition-colors duration-300"
                aria-label="Logout"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span className="hidden sm:inline select-none font-medium">Logout</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
