import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../config/firebase";

// Use the same computer IP the phone used to load the app (from the QR code),
// so the API is always reachable and requests don't hang until timeout.
const devHost = Constants.expoConfig?.hostUri?.split(":")[0];

const api = axios.create({
  baseURL: devHost ? `http://${devHost}:5000/api` : "https://playmate-backend-jfox.onrender.com/api",
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
