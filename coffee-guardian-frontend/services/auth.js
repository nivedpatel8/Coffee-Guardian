// services/auth.js - Authentication API calls
import api from "./api";

// Login user
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// Register user
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Get current user profile
export const fetchProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};