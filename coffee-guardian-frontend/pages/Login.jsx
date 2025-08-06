import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(""); // For auth server errors

  // Responsive handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) navigate("/dashboard");
      else if (result.message) setAuthError(result.message);
    } catch {
      setAuthError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-gray-900 via-[#232332] to-black relative">
      {/* Glowing background circles */}
      <div
        aria-hidden
        className="fixed top-[5%] left-[5%] w-80 h-80 bg-blue-500 opacity-20 blur-3xl rounded-full pointer-events-none"
      />
      <div
        aria-hidden
        className="fixed bottom-[10%] right-[-8%] w-[28rem] h-[28rem] bg-purple-600 opacity-10 blur-3xl rounded-full pointer-events-none"
      />

      <div className="w-full max-w-md mx-auto px-4 sm:px-0 py-14 sm:py-0 flex items-center justify-center">
        <div className="w-full bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 p-7 sm:p-10 flex flex-col gap-8">
          <div className="flex flex-col items-center mb-2">
            <div className="h-16 w-16 bg-gradient-to-tr from-purple-700 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-3">
              <span className="text-white font-black text-2xl tracking-widest">
                CG
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-white font-black text-center mb-1 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-[15px] text-gray-400 text-center">
              Sign in to{" "}
              <span className="text-blue-400 font-semibold">
                Coffee Guardian Pro
              </span>
            </p>
          </div>

          {/* Login form */}
          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
            <div className="space-y-5">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoFocus
                required
                className="bg-gray-900/50 text-white border border-gray-700 focus:border-blue-500"
                placeholder="Enter your email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  className="bg-gray-900/50 text-white border border-gray-700 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-9 text-gray-400 hover:text-blue-400 transition-colors"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {(authError || errors.global) && (
              <div className="text-red-400 text-sm text-center mt-2">
                {authError || errors.global}
              </div>
            )}

            <div className="flex items-center justify-between mt-2 text-[14px]">
              <Link
                to="/forgot-password"
                className="text-blue-300 hover:text-blue-400 transition font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            {/* Gradient animated button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-lg text-white shadow-md transition-all
                bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-600
                hover:from-blue-600 hover:via-purple-600 hover:to-pink-700
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${
                  loading
                    ? "opacity-60 grayscale cursor-not-allowed"
                    : "opacity-100"
                }
              `}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <p className="text-center mt-4 text-gray-400 text-[15px]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-300 hover:text-blue-400"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
