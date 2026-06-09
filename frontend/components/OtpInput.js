"use client";

import { useState, useRef, useEffect } from "react";

export default function OtpInput({ length = 6, value, onChange }) {
  const [otpArray, setOtpArray] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  // Sync internal state if external value changes (e.g. cleared after submit)
  useEffect(() => {
    if (value === "") {
      setOtpArray(new Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const char = e.target.value;
    if (/[^0-9]/.test(char)) return; // Only allow numbers

    const newOtpArray = [...otpArray];
    // Keep only the last character typed in case they type fast
    newOtpArray[index] = char.slice(-1);
    
    setOtpArray(newOtpArray);
    onChange(newOtpArray.join(""));

    // Move to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        // If current box is empty and they hit backspace, move to prev box and delete its value
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = "";
        setOtpArray(newOtpArray);
        onChange(newOtpArray.join(""));
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length).replace(/[^0-9]/g, "");
    
    if (pastedData) {
      const newOtpArray = [...otpArray];
      pastedData.split("").forEach((char, index) => {
        if (index < length) newOtpArray[index] = char;
      });
      
      setOtpArray(newOtpArray);
      onChange(newOtpArray.join(""));

      // Focus the next empty box or the last box
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex].focus();
    }
  };

  return (
    <div className="flex justify-between items-center gap-2">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={2} // Allow 2 so we can catch the second char in handleChange and slice it
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-14 rounded-xl border border-white/10 bg-black/40 text-center text-2xl font-bold text-white outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] transition-all placeholder:text-white/20"
          placeholder="-"
        />
      ))}
    </div>
  );
}
