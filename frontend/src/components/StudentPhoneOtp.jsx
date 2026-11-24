import React, { useState } from "react";

import {
  sendPhoneOtp,
  verifyPhoneOtp,
  resetRecaptcha
} from "../services/phoneAuth";

function StudentPhoneOtp({ onVerified }) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Send OTP
  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const result = await sendPhoneOtp(
        mobile,
        "recaptcha-container"
      );

      setConfirmationResult(result);
      setMessage("OTP successfully sent. Please enter OTP.");
    } catch (err) {
      setError(err.message || "OTP send failed.");
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const result = await verifyPhoneOtp(
        confirmationResult,
        otp
      );

      setMessage("Mobile number verified successfully!");

      // Send verified token to parent component
      if (onVerified) {
        onVerified({
          mobile,
          firebaseIdToken: result.firebaseIdToken
        });
      }
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto" }}>
      <h2>Student Mobile Verification</h2>

      {!confirmationResult && (
        <>
          <label>Mobile Number</label>

          <input
            type="tel"
            placeholder="Enter 10 digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
          />

          <div id="recaptcha-container"></div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || mobile.length !== 10}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {confirmationResult && (
        <>
          <p>OTP sent to +91 {mobile}</p>

          <input
            type="text"
            placeholder="Enter 6 digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
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

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}
    </div>
  );
}

export default StudentPhoneOtp;
