
import React, { useState } from "react";

import {
  verifyStudentAdmission,
  registerStudent
} from "../services/api";

import {
  sendPhoneOtp,
  verifyPhoneOtp,
  resetRecaptcha
} from "../services/phoneAuth";

function StudentRegistration({ onRegistered }) {

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    admissionNumber: "",
    registrationPIN: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // STEP 1: Verify Admission
  const handleAdmissionVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const response = await verifyStudentAdmission({
        admissionNumber: form.admissionNumber,
        registrationPIN: form.registrationPIN,
        mobile: form.mobile
      });

      setStudent(response.data.student);
      setStep(2);
      setMessage("Admission verified successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Admission verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Send OTP
  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const result = await sendPhoneOtp(
        form.mobile,
        "registration-recaptcha"
      );

      setConfirmationResult(result);
      setMessage("OTP sent successfully.");
    } catch (err) {
      setError(err.message || "OTP sending failed.");
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const result = await verifyPhoneOtp(
        confirmationResult,
        otp
      );

      setFirebaseIdToken(result.firebaseIdToken);
      setStep(3);
      setMessage("Mobile verified successfully.");
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Create Student Account
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerStudent({
        admissionNumber: form.admissionNumber,
        registrationPIN: form.registrationPIN,
        mobile: form.mobile,
        password: form.password,
        firebaseIdToken
      });

      const { token, student: registeredStudent } = response.data;

      sessionStorage.setItem("eduportal_token", token);
      sessionStorage.setItem(
        "eduportal_user",
        JSON.stringify(registeredStudent)
      );

      setMessage("Student account created successfully!");
      setStudent(registeredStudent);
      setStep(4);
      if (onRegistered) {
        onRegistered(registeredStudent);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "450px",
      margin: "30px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px"
    }}>

      <h2>Student Registration</h2>

      <p>Step {step} / 4</p>

      {step === 1 && (
        <form onSubmit={handleAdmissionVerify}>
          <input
            name="admissionNumber"
            placeholder="Admission Number"
            value={form.admissionNumber}
            onChange={updateForm}
            required
          />

          <input
            name="registrationPIN"
            type="password"
            placeholder="Registration PIN"
            value={form.registrationPIN}
            onChange={updateForm}
            required
          />

          <input
            name="mobile"
            type="tel"
            placeholder="10 Digit Mobile Number"
            value={form.mobile}
            onChange={updateForm}
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Verify Admission"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <p>Student: {student?.studentName || student?.name}</p>
          <p>Mobile: +91 {form.mobile}</p>

          {!confirmationResult && (
            <>
              <div id="registration-recaptcha"></div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {confirmationResult && (
            <>
              <input
                placeholder="Enter 6 Digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                maxLength={6}
              />

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleRegister}>
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={updateForm}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={updateForm}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Student Account"}
          </button>
        </form>
      )}

      {step === 4 && (
        <div>
          <h3>Registration Successful!</h3>
          <p>Welcome, {student?.name || student?.studentName}</p>
          <p>Your student account has been created.</p>
        </div>
      )}

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

    </div>
  );
}

export default StudentRegistration;
