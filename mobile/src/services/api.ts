import axios from "axios";
import { auth } from "../config/firebase";

const api = axios.create({
  baseURL: "http://172.21.4.139:5000/api",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
