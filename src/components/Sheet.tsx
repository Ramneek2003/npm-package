import React, { useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import Input from "./Input";
import { useForm } from "react-hook-form";
import axios from "axios";
import { validatePhoneNumber } from "../../utils/validatePhone";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import OtpInput from "./OtpInput";
import {
  ArrowPathIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Inputs = {
  phone: string;
};

const LOGIN_STATE = {
  INITIAL: "initial",
  FINAL: "final",
};

const SlidingSheet = ({
  isOpen,
  onClose,
  position,
  darkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: string;
  darkMode: boolean;
}) => {
  const [isFullHeight, setIsFullHeight] = useState(false);
  const [resending, setResending] = useState(false);
  const isRegistered = useRef(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    phone: "",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const [loginState, setLoginState] = useState(LOGIN_STATE.INITIAL);

  const submit = (data: any) => {
    setLoginState(LOGIN_STATE.FINAL);
    setUser({
      name: data?.name,
      phone: data?.phone,
    });

    let phone = data.phone;
    if (phone != undefined) {
      if (!validatePhoneNumber(phone)) {
        if (validatePhoneNumber("+91" + phone)) {
          phone = "+91" + data.phone;
        } else {
          alert("Invalid Phone Number");
          return;
        }
      }

      //   mixpanel.track("send_otp", {
      //     user: {
      //       phone: data?.phone,
      //     },
      //     lms: "lms_otpSend",
      //   });

      axios
        .get(
          `${
            process.env.NEXT_PUBLIC_BASE_API
          }auth/sms-otp?phone=${phone?.toString()}&platform=${"lms"}`
        )
        .then((response: any) => {
          toast.success("OTP sent successfully");
        })
        .catch((error: any) => {
          console.log("Error in sending otp: ", error);
        });
    }
  };

  const onOtpSubmit = (otp: any) => {
    const code = otp;
    if (!code) {
      alert("Please Enter Code");
      return;
    }

    // mixpanel.track("verify_otp", {
    //   user: {
    //     phone: user?.phone,
    //   },
    //   lms: "lms_otpVerify",
    // });
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_API}auth/verify-otp?phone=${
          "+91" + user?.phone?.toString()
        }&otp=${code}`
      )
      .then((response) => {
        if (response.data && response.data.data) {
          if (response.data.data?.type === "error") {
            // eventBus.$emit("showToast", {
            //   message: `OTP is incorrect, Please try again!`,
            //   type: "error",
            // });
          } else if (response.data.data?.type === "success") {
            return axios
              .post(
                `${process.env.NEXT_PUBLIC_BASE_API}auth/otpless-login`,
                {
                  phone: user?.phone,
                },
                { withCredentials: true }
              )
              .then((data) => {
                if (data?.data?.data?.token) {
                  signIn("fireAuth", {
                    ...data.data.data,
                    redirect: false,
                  });
                  localStorage.setItem("token", data.data.token);
                  onClose();
                  //   eventBus.$emit("showToast", {
                  //     message: `Welcome ${data.data.data.name}!`,
                  //     type: "success",
                  //   });
                  window.location.href =
                    "https://www.thefuture.university/new-dashboard";
                }
                return Promise.resolve(data);
              })
              .catch((error) => {
                return Promise.reject(error);
              });
          } else {
            // eventBus.$emit("showToast", {
            //   message: `Unknown Error, Please try again!`,
            //   type: "error",
            // });
          }
          return;
        } else {
          return;
        }
      })
      .catch((error) => {
        alert("Some Error occurred, please try again!");
      });
  };

  const resendCode = () => {
    let phone = user?.phone;

    if (phone != undefined) {
      if (!validatePhoneNumber(phone)) {
        if (validatePhoneNumber("+91" + phone)) {
          phone = "+91" + phone;
        } else {
          alert("Invalid Phone Number");
          return;
        }
      }

      setResending(true);

      //   mixpanel.track("resend_otp", {
      //     user: {
      //       phone: user?.phone,
      //     },
      //     lms: "lms_resendOtp",
      //   });

      axios
        .get(
          `${
            process.env.NEXT_PUBLIC_BASE_API
          }auth/send-otp?phone=${phone?.toString()}&platform=${"lms"}`
        )
        .then((response: any) => {
          toast("OTP sent successfully");
          toast.success("OTP Sent");
        })
        .catch((error: any) => {
          console.log("Error in otp: ", error);
        })
        .finally(() => {
          setResending(false);
        });
    }
  };

  return (
    <Transition
      show={isOpen}
      as="div"
      style={{ backgroundColor: `${darkMode ? "#00163A" : "white"}` }}
      className={` fixed z-30 flex flex-col justify-start items-start ${
        position === "bottom"
          ? "bottom-0 left-0 right-0"
          : "top-0 bottom-0 right-0"
      } transform transition-transform ease-out duration-300`}
      enter="transition-transform ease-out duration-300"
      enterFrom={`${
        position === "bottom" ? "translate-y-full" : "translate-x-full"
      }`}
      enterTo="translate-x-0"
      leave="transition-transform ease-in duration-300"
      leaveFrom="translate-x-0"
      leaveTo={`${
        position === "bottom" ? "translate-y-full" : "translate-x-full"
      }`}
    >
      <button
        onClick={onClose}
        className="mt-4 p-1 absolute right-8 border-none rounded-full"
        style={{
          backgroundColor: "#0A21331A",
        }}
      >
        <XMarkIcon className={`${darkMode ? "text-white" : ""} w-6 h-6`} />
      </button>
      <div
        className={`shadow-lg ${
          position === "right"
            ? "h-full p-24"
            : `${isFullHeight ? "h-screen" : "h-96"} w-full p-8`
        } overflow-y-auto flex flex-col justify-center items-center gap-3`}
      >
        <div className="flex flex-col justify-center items-center gap-2">
          <img
            src={
              darkMode
                ? require("../../public/astroLogo.svg")
                : require("../../public/logo.svg")
            }
            alt="Logo"
            className="max-md:w-20"
          />
          <h4
            className={`font-semibold ${
              darkMode ? "text-white" : "text-[#383838]"
            }`}
          >
            Welcome to{" "}
            <span
              className={`${darkMode ? "text-[#FFD700]" : "text-[#383838]"}`}
            >
              {darkMode ? "AstroLearn!" : "TradeWise!"}
            </span>
          </h4>
          <p
            className={`${
              darkMode ? "text-white" : "text-[#43465180]"
            } max-md:text-sm`}
          >
            Discover India's Best Learning Platform text!
          </p>
        </div>
        <form
          className="w-full flex flex-col gap-6 relative justify-center items-center"
          onSubmit={handleSubmit(submit)}
          onClick={() => {
            if (!isRegistered.current) {
              //   mixpanel.track("form_start", {
              //     lms: "LMS Login",
              //   });
              isRegistered.current = true;
            }
          }}
        >
          {loginState === LOGIN_STATE.INITIAL && (
            <>
              <div className="flex flex-row justify-center items-start gap-2">
                <Input
                  type="text"
                  label=""
                  placeholder="+91"
                  name="code"
                  disabled={true}
                  errors={errors}
                  register={register}
                  className="h-12 !w-16 font-semibold"
                />
                <Input
                  type="text"
                  label=""
                  labelClassName="!normal-case"
                  placeholder="Enter your phone number"
                  name="phone"
                  className="h-12 !w-80 max-md:!w-72 max-xs:!w-64 font-semibold"
                  register={register}
                  errors={errors}
                  rules={{
                    required: true,
                    minLength: {
                      value: 10,
                      message:
                        "Phone number must be at least 10 characters long",
                    },
                    maxLength: {
                      value: 10,
                      message:
                        "Phone number must be at most 10 characters long",
                    },
                    pattern: {
                      value: /^[0-9]*$/,
                      message: "Please enter only numbers",
                    },
                  }}
                  onClick={() => setIsFullHeight(true)}
                />
              </div>
              <button
                type="submit"
                className="h-12 w-full border-none max-lg:max-w-md max-md:max-w-sm"
                style={{
                  backgroundColor: `${darkMode ? "#FFD700" : "#0A21331A"}`,
                  color: "#0A2133",
                }}
              >
                Send OTP
              </button>
            </>
          )}
        </form>

        {loginState === LOGIN_STATE.FINAL && (
          <form
            className="w-full flex flex-col gap-6 relative max-lg:max-w-md max-md:max-w-sm"
            onSubmit={handleSubmit(onOtpSubmit)}
          >
            <div className="flex flex-row justify-center items-start gap-2">
              <Input
                type="text"
                label=""
                placeholder="+91"
                name="code"
                disabled={true}
                errors={errors}
                register={register}
                className="h-12 !w-16 font-semibold"
              />
              <Input
                type="text"
                label=""
                placeholder="Enter your phone number"
                name="phone"
                className="h-12 !w-80 max-md:!w-72 max-xs:!w-64 font-semibold"
                register={register}
                errors={errors}
                disabled={true}
                rules={{
                  required: true,
                  minLength: {
                    value: 10,
                    message: "Phone number must be at least 10 characters long",
                  },
                  maxLength: {
                    value: 10,
                    message: "Phone number must be at most 10 characters long",
                  },
                  pattern: {
                    value: /^[0-9]*$/,
                    message: "Please enter only numbers",
                  },
                }}
                onClick={() => setIsFullHeight(true)}
              />
            </div>
            <PencilSquareIcon
              className="h-6 w-6 text-gray-500 absolute right-1 top-3 cursor-pointer"
              onClick={() => setLoginState(LOGIN_STATE.INITIAL)}
              title="Edit"
              role="Edit"
            />
            <div className="w-full flex flex-col gap-4 justify-end items-end">
              <form className="w-full flex flex-col gap-4 items-start">
                <p style={{ color: `${darkMode ? "white" : "#828282"}` }}>
                  One time password
                </p>
                <OtpInput
                  onOtpSubmit={onOtpSubmit}
                  phone={user?.phone}
                  darkMode={darkMode}
                />
              </form>
              <div
                className="flex flex-row justify-end items-center gap-2 hover:cursor-pointer hover:underline"
                onClick={resendCode}
              >
                <div style={{ color: `${darkMode ? "white" : "#828282"}` }}>
                  {resending ? "..Resending" : "Resend"}
                </div>
                <ArrowPathIcon
                  className={`w-4 h-4  ${
                    darkMode ? "text-white" : "text-[#828282]"
                  }`}
                />
              </div>
            </div>
            <button
              className="h-12 w-full border-none"
              style={{
                backgroundColor: `${darkMode ? "#FFD700" : "#0A21331A"}`,
                color: "#0A2133",
              }}
              type="submit"
            >
              Login
            </button>
          </form>
        )}
        <small
          className="font-semibold"
          style={{ color: `${darkMode ? "#FFD700" : "#434651"}` }}
        >
          *By signing in you agree to our{" "}
          <span style={{ color: `${darkMode ? "#FFD700" : "#43465180"}` }}>
            Terms & Conditions
          </span>
        </small>
      </div>
    </Transition>
  );
};

export default SlidingSheet;
