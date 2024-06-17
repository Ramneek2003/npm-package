import { useEffect, useRef, useState } from "react";
import React from "react";

export default function OtpInput({
  phone,
  onOtpSubmit,
  darkMode,
}: {
  phone: string;
  onOtpSubmit: (otp: any) => void;
  darkMode: boolean;
}) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, e: any) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];

    //allow only one input
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const combineOtp = newOtp.join("");
    if (combineOtp.length === 6) onOtpSubmit(combineOtp);

    //move to next input if current field is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleClick = (index: number) => {
    inputRefs.current[index]?.setSelectionRange(1, 1);

    //optional
    if (index > 0) {
      inputRefs.current[otp.findIndex((val) => val == "")]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  return (
    <div className="flex flex-row items-center justify-between w-full">
      {otp.map((value: number, index: number) => {
        return (
          <input
            key={index}
            required={true}
            type="text"
            name="otp"
            ref={(input) => (inputRefs.current[index] = input)}
            value={value}
            placeholder=""
            onChange={(e) => handleChange(index, e)}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`!w-12 !h-12 text-center bg-transparent ${
              darkMode ? "text-white" : ""
            }`}
          />
        );
      })}
    </div>
  );
}
