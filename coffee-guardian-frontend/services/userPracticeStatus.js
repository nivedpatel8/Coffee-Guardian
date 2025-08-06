// services/userPracticeStatus.js
import api from "./api";

// Fetch completed practice status for a user, crop, and month
export const getCompletedStatus = async (userId, crop, month) => {
  const params = new URLSearchParams({ userId, crop, month }).toString();
  const response = await api.get(`/user-practice-status?${params}`);
  return response.data;
};

// Save/update completed indexes for a user practice section
export const saveCompletedStatus = async ({
  userId,
  crop,
  month,
  section,
  completedIndexes,
}) => {
  const payload = {
    userId,
    crop,
    month,
    section,
    completedIndexes,
  };
  const response = await api.post("/user-practice-status", payload);
  return response.data;
};
