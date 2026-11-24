import React, { useState } from "react";
import { loginStudent } from "../services/api";

function StudentLogin({ onLogin, onRegister }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginStudent({
        mobile,
        password
      });

      const { token, student } = response.data;

      // Save login session
      sessionStorage.setItem("eduportal_token", token);
      sessionStorage.setItem(
        "eduportal_user",
        JSON.stringify(student)
      );

      if (onLogin) {
        onLogin(student);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "30px auto",
      padding: "25px",
      border: "1px solid #ddd",
      borderRadius: "10px"
    }}>
      <h2>Student Login</h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label>Mobile Number</label>

          <input
            type="tel"
            placeholder="Enter 10 digit mobile number"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            maxLength={10}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px"
            }}
          />

          <label style={{ display: "block", marginTop: "8px" }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            {" "}Show Password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            cursor: "pointer"
          }}
        >
          {loading ? "Logging in..." : "Student Login"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "15px" }}>
          {error}
        </p>
      )}

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        New Student?{" "}
        <button
          type="button"
          onClick={onRegister}
        >
          Register Here
        </button>
      </p>
    </div>
  );
}

export default StudentLogin;
