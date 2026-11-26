import axios from "axios";


const api = axios.create({
  baseURL: "https://eduportal-backend-5ju8.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});


// Automatically attach JWT Token
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


// Student Admission Verification
export const verifyStudentAdmission = (data) => {
  return api.post("/auth/student/verify-admission", data);
};


// Student Registration
export const registerStudent = (data) => {
  return api.post("/auth/student/register", data);
};


// Student Login
export const loginStudent = (data) => {
  return api.post("/auth/student/login", data);
};


// Teacher and Admin Login
export const loginTeacher = (data) => {
  return api.post("/auth/teacher-login", data);
};


export default api;
