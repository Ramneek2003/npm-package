import React, { useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import Input from "./Input";
import { useForm } from "react-hook-form";
import axios from "axios";
import { validatePhoneNumber } from "../../utils/validatePhone";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import OtpInput from "./OtpInput";
import { ArrowPathIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

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
  //   const [isOpenInternal, setIsOpenInternal] = useState(isOpen);

  //   const handleClose = () => {
  //     setIsOpenInternal(false);
  //     setTimeout(() => {
  //       onClose();
  //     }, 300); // Adjust the timeout to match your transition duration
  //   };
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

    axios
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

          //   eventBus.$emit("showToast", {
          //     message: `Welcome ${data.data.data.name}!`,
          //     type: "success",
          //   });
          //   router.replace(`/new-dashboard`);
        }
        return Promise.resolve(data);
      })
      .catch((error) => {
        return Promise.reject(error);
      });

    // mixpanel.track("verify_otp", {
    //   user: {
    //     phone: user?.phone,
    //   },
    //   lms: "lms_otpVerify",
    // });
    // axios
    //   .get(
    //     `${process.env.NEXT_PUBLIC_BASE_API}auth/verify-otp?phone=${
    //       "+91" + user?.phone?.toString()
    //     }&otp=${code}`
    //   )
    //   .then((response) => {
    //     if (response.data && response.data.data) {
    //       if (response.data.data?.type === "error") {
    //         // eventBus.$emit("showToast", {
    //         //   message: `OTP is incorrect, Please try again!`,
    //         //   type: "error",
    //         // });
    //       } else if (response.data.data?.type === "success") {
    //         return axios
    //           .post(
    //             `${process.env.NEXT_PUBLIC_BASE_API}auth/otpless-login`,
    //             {
    //               phone: user?.phone,
    //             },
    //             { withCredentials: true }
    //           )
    //           .then((data) => {
    //             if (data?.data?.data?.token) {
    //               signIn("fireAuth", {
    //                 ...data.data.data,
    //                 redirect: false,
    //               });
    //               localStorage.setItem("token", data.data.token);

    //               //   eventBus.$emit("showToast", {
    //               //     message: `Welcome ${data.data.data.name}!`,
    //               //     type: "success",
    //               //   });
    //               //   router.replace(`/new-dashboard`);
    //             }
    //             return Promise.resolve(data);
    //           })
    //           .catch((error) => {
    //             return Promise.reject(error);
    //           });
    //       } else {
    //         // eventBus.$emit("showToast", {
    //         //   message: `Unknown Error, Please try again!`,
    //         //   type: "error",
    //         // });
    //       }
    //       return;
    //     } else {
    //       return;
    //     }
    //   })
    //   .catch((error) => {
    //     alert("Some Error occurred, please try again!");
    //   });
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
      className={`${
        darkMode ? "bg-blue-1" : "bg-white"
      } fixed z-30 flex flex-col justify-start items-start ${
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
      <div
        className={`shadow-lg ${
          position === "right"
            ? "h-full p-24"
            : `${isFullHeight ? "h-full" : "h-72"} w-full p-4`
        } overflow-y-auto flex flex-col justify-center items-center gap-3`}
      >
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Close
        </button>
        <div className="flex flex-col justify-center items-center gap-2">
          <img
            src={darkMode ? "/astroLogo.svg" : "/logo.svg"}
            alt="Logo"
            width={100}
            height={100}
          />
          <h4 className="text-[#383838] font-semibold">
            Welcome to TradeWise!
          </h4>
          <p className="text-[#43465180]">
            Discover India's Best Learning Platform text!
          </p>
        </div>
        <form
          className="w-full flex flex-col gap-6 relative"
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
                  className="h-12 font-semibold"
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
                className="bg-[#0A21331A] !text-[#0A2133] h-12 w-full"
              >
                Send OTP
              </button>
            </>
          )}
        </form>

        {loginState === LOGIN_STATE.FINAL && (
          <form
            className="w-full flex flex-col gap-6 relative"
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
                className="h-12 font-semibold"
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
            {/* <PencilSquareIcon
              className="h-6 w-6 text-gray-500 absolute right-1 top-9 max-lg:top-10 cursor-pointer"
              onClick={() => setLoginState(LOGIN_STATE.INITIAL)}
              title="Edit"
              role="Edit"
            /> */}
            <div className="w-full flex flex-col gap-4 justify-end items-end">
              <form className="w-full flex flex-col gap-4 items-start">
                <p className="text-[#828282]">One time password</p>
                <OtpInput onOtpSubmit={onOtpSubmit} phone={user?.phone} />
              </form>
              <div
                className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer hover:underline"
                onClick={resendCode}
              >
                <div className="text-[#828282]">
                  {resending ? "..Resending" : "Resend"}
                </div>
                <ArrowPathIcon className="w-4 h-4 text-[#828282]" />
              </div>
            </div>
            <button
              className="bg-[#0A21331A] !text-[#0A2133] h-12 w-full"
              type="submit"
            >
              Login
            </button>
          </form>
        )}
        <small className="text-[#434651] font-semibold">
          *By signing in you agree to our{" "}
          <span className="text-[#43465180]">Terms & Conditions</span>
        </small>
      </div>
    </Transition>
  );
};

export default SlidingSheet;
