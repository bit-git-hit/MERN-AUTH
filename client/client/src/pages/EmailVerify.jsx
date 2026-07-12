import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EmailVerify = () => {
  const navigate = useNavigate();

  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContext);

  const inputRefs = useRef([]);

  // Move to next input
  const handleInput = (e, index) => {
    // Allow only numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, "");

    if (
      e.target.value.length > 0 &&
      index < inputRefs.current.length - 1
    ) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Move to previous input on backspace
  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      e.target.value === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();

    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.trim().slice(0, 6).split("");

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char.replace(/[^0-9]/g, "");
      }
    });

    if (pasteArray.length > 0) {
      inputRefs.current[
        Math.min(pasteArray.length - 1, 5)
      ]?.focus();
    }
  };

  // Verify OTP
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const otpArray = inputRefs.current.map((input) => input.value);
      const otp = otpArray.join("");

      if (otp.length !== 6) {
        return toast.error("Please enter a valid 6-digit OTP");
      }

      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        await getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Send Verification OTP
  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Redirect if already verified
  useEffect(() => {
    if (isLoggedin && userData?.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedin, userData, navigate]);

  // Send OTP when page opens
  useEffect(() => {
    if (isLoggedin && userData && !userData.isAccountVerified) {
      sendVerificationOtp();
    }
  }, [isLoggedin, userData]);

    return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>

        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit OTP sent to your email.
        </p>

        <div
          className="flex justify-between mb-8"
          onPaste={handlePaste}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              required
              className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
              ref={(el) => (inputRefs.current[index] = el)}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:opacity-90 transition-all"
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;