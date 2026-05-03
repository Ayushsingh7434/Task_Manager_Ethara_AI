import axios from "./axios";

export const createProject = async (data: any) => {
  const res = await axios.post("/projects", data);  // ✅ Fixed: was /projects/create
  return res.data;
};

export const getProjects = async () => {
  const res = await axios.get("/projects");
  return res.data;
};

export const getProjectById = async (id: string) => {
  const res = await axios.get(`/projects/${id}`);
  return res.data;
};

export const updateProject = async (id: string, data: any) => {
  const res = await axios.put(`/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id: string) => {
  const res = await axios.delete(`/projects/${id}`);
  return res.data;
};

export const addMember = async (projectId: string, userId: string) => {
  const res = await axios.post(`/projects/${projectId}/members`, { userId });
  return res.data;
};

export const removeMember = async (projectId: string, userId: string) => {
  const res = await axios.delete(`/projects/${projectId}/members/${userId}`);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await axios.get("/projects/users/all");
  return res.data;
};
