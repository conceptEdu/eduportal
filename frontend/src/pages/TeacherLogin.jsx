import { useState } from "react";
import api from "../services/api";
import "./TeacherLogin.css";

function TeacherLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/teacher-login", {
        email,
        password
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid server response");
      }

      // Token ko current browser session tak rakhen
      sessionStorage.setItem("eduportal_token", token);

      onLogin(user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-login-container">
      <form className="teacher-login-card" onSubmit={handleSubmit}>
        <h2>EduPortal Teacher Login</h2>

        <p>अपने Teacher Account से Login करें</p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default TeacherLogin;
