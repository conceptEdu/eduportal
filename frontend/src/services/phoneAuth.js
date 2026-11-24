import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { auth } from "./firebase";

let recaptchaVerifier = null;

// 1. Create reCAPTCHA
export const setupRecaptcha = (containerId) => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "normal"
      }
    );
  }

  return recaptchaVerifier;
};

// 2. Send OTP
export const sendPhoneOtp = async (mobile, containerId) => {
  const cleanMobile = String(mobile).replace(/\D/g, "");

  if (!/^[0-9]{10}$/.test(cleanMobile)) {
    throw new Error("Enter a valid 10-digit mobile number");
  }

  const phoneNumber = `+91${cleanMobile}`;

  const verifier = setupRecaptcha(containerId);

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    verifier
  );

  return confirmationResult;
};

// 3. Verify OTP
export const verifyPhoneOtp = async (confirmationResult, otp) => {
  if (!/^[0-9]{6}$/.test(String(otp))) {
    throw new Error("Enter a valid 6-digit OTP");
  }

  const result = await confirmationResult.confirm(String(otp));

  const firebaseIdToken = await result.user.getIdToken();

  return {
    user: result.user,
    firebaseIdToken
  };
};

// 4. Reset reCAPTCHA
export const resetRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};
