import api from "./api";

/* Dashboard */
export const getSystemStats = () =>
  api.get("/admin/dashboard").then((r) => r.data);

/* Users */
export const listUsers = (page = 1, limit = 20) =>
  api.get(`/admin/users?page=${page}&limit=${limit}`).then((r) => r.data);
export const updateUser = (id, body) =>
  api.put(`/admin/users/${id}`, body).then((r) => r.data);
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`).then((r) => r.data);

/* Practices */
export const listPractices = () =>
  api.get("/admin/practices").then((r) => r.data);
export const addPractice = (body) =>
  api.post("/admin/practices", body).then((r) => r.data);
export const updatePractice = (id, body) =>
  api.put(`/admin/practices/${id}`, body).then((r) => r.data);
export const deletePractice = (id) =>
  api.delete(`/admin/practices/${id}`).then((r) => r.data);

/* Maintenance */
export const cleanupOldData = (days) =>
  api.post(`/admin/cleanup?days=${days}`).then((r) => r.data);

/* Export */
export const exportData = async (type, format = "json") => {
  const res = await api.get(`/admin/export?type=${type}&format=${format}`, {
    responseType: "blob",
  });
  return new Blob([res.data], { type: res.headers["content-type"] });
};
