import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const [serverError, setServerError] = useState("");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const res = await registerUser(values);
      if (res?.success) {
        navigate("/dashboard");
      } else if (res?.message) {
        setServerError(res.message);
      } else {
        setServerError("Registration failed. Please try again.");
      }
    } catch (err) {
      setServerError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-gray-900 via-[#232332] to-black relative">
      {/* Glowing BG decorations */}
      <div
        aria-hidden
        className="fixed top-[5%] left-[5%] w-80 h-80 bg-blue-500 opacity-20 blur-3xl rounded-full pointer-events-none"
      />
      <div
        aria-hidden
        className="fixed bottom-[10%] right-[-8%] w-[28rem] h-[28rem] bg-purple-600 opacity-10 blur-3xl rounded-full pointer-events-none"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto px-4 sm:px-0 py-12 sm:py-0 flex flex-col
        justify-center bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl
        border border-gray-800 p-7 sm:p-10 gap-6"
      >
        <div className="flex flex-col items-center mb-1">
          <div className="h-16 w-16 bg-gradient-to-tr from-purple-700 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-3">
            <span className="text-white font-black text-2xl tracking-widest">
              CG
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-white font-black text-center tracking-tight">
            Create Your Account
          </h1>
          <p className="text-[15px] text-gray-400 text-center">
            Join{" "}
            <span className="text-blue-400 font-semibold">
              Coffee Guardian Pro
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="text-gray-200 block mb-1">
              Name
            </label>
            <input
              id="name"
              autoComplete="name"
              className={`w-full px-4 py-3 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:border-blue-400 outline-none
                ${errors.name ? "border-red-500" : ""}`}
              {...register("name", { required: "Name is required" })}
              placeholder="Your name"
            />
            {errors.name && (
              <div className="text-sm text-red-400 mt-1">
                {errors.name.message}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="text-gray-200 block mb-1">
              Email
            </label>
            <input
              id="email"
              autoComplete="email"
              type="email"
              className={`w-full px-4 py-3 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:border-blue-400 outline-none
                ${errors.email ? "border-red-500" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              })}
              placeholder="you@email.com"
            />
            {errors.email && (
              <div className="text-sm text-red-400 mt-1">
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="text-gray-200 block mb-1">
              Password
            </label>
            <input
              id="password"
              autoComplete="new-password"
              type="password"
              className={`w-full px-4 py-3 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:border-blue-400 outline-none
                ${errors.password ? "border-red-500" : ""}`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="text-sm text-red-400 mt-1">
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="text-red-400 text-sm text-center mt-1">
              {serverError}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-lg text-white shadow-md transition-all
            bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-600
            hover:from-blue-600 hover:via-purple-600 hover:to-pink-700
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            ${
              isSubmitting
                ? "opacity-60 grayscale cursor-not-allowed"
                : "opacity-100"
            }
          `}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="text-center text-gray-400 text-[15px] mt-1">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-300 hover:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
