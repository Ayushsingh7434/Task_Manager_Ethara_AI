import axios from "./axios";

export const loginUser = async (data: any) => {
  const res = await axios.post("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

export const registerUser = async (data: any) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};

// Alias for backward compatibility
export const signupUser = registerUser;

export const getMe = async () => {
  const res = await axios.get("/auth/me");
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
