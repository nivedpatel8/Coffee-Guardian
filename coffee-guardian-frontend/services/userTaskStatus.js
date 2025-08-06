import api from "./api";

export async function getCompletedStatus(crop, month) {
  const res = await axios.get(`/api/task-status?crop=${crop}&month=${month}`);
  return res.data; // [{section, completedIndexes}, ...]
}

export async function saveCompletedStatus(
  crop,
  month,
  section,
  completedIndexes
) {
  await api.post("/api/task-status", {
    crop,
    month,
    section,
    completedIndexes,
  });
}