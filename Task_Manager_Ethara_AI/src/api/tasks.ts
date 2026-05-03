import axios from "./axios";

export const createTask = async (data: any) => {
  const res = await axios.post("/tasks", data);
  return res.data;
};

export const getTasks = async (params?: any) => {
  const res = await axios.get("/tasks", { params });
  return res.data;
};

export const getTaskById = async (id: string) => {
  const res = await axios.get(`/tasks/${id}`);
  return res.data;
};

export const updateTask = async (id: string, data: any) => {
  const res = await axios.put(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id: string) => {
  const res = await axios.delete(`/tasks/${id}`);
  return res.data;
};

export const getTaskStats = async () => {
  const res = await axios.get("/tasks/stats/overview");
  return res.data;
};
