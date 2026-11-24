import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.11:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// NEW: Automatically attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("eduportal_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Verify Student Admission
export const verifyStudentAdmission = (data) => {
  return api.post("/auth/student/verify-admission", data);
};

// Register Student
export const registerStudent = (data) => {
  return api.post("/auth/student/register", data);
};

// Student Login
export const loginStudent = (data) => {
  return api.post("/auth/student/login", data);
};

export default api;
