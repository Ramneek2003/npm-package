import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "./components/Input";
// import { useRouter } from "next/router";
import Modal from "./components/Modal";
import OtpInput from "./components/OtpInput";
import axios from "axios";
import { signIn } from "next-auth/react";
import { validatePhoneNumber } from "../utils/validatePhone";
import { toast } from "sonner";

type Inputs = {
  phone: string;
};

const LOGIN_STATE = {
  INITIAL: "initial",
  FINAL: "final",
};

export default function Button() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<Inputs>();

  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };
  // const router = useRouter();
  const [loginState, setLoginState] = useState(LOGIN_STATE.INITIAL);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    phone: "",
  });

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

    setLoading(true);

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

                  // eventBus.$emit("showToast", {
                  //   message: `Welcome ${data.data.data.name}!`,
                  //   type: "success",
                  // });
                  closeModal();
                  // router.push(`/`);
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
          setLoading(false);
          return;
        } else {
          setLoading(false);
          return;
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Some Error occurred, please try again!");
      })
      .finally(() => {
        setLoading(false);
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
          setLoading(false);
        });
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Login</button>
      <Modal isOpen={isOpen} closeModal={closeModal} className="border-none">
        <div className="flex p-20 max-md:py-6 max-md:px-4 flex-col justify-center items-center max-w-2xl w-full gap-10">
          {/* <XMarkIcon
          onClick={closeModal}
          className="h-6 w-6 bg-black rounded-full p-1 text-slate-200 absolute right-5 top-5 hover:cursor-pointer"
        /> */}
          <Image src="/logo.svg" alt="logo" width={120} height={120} />
          <h3 className="text-[#525252]">Login to your Account</h3>
          {loginState === LOGIN_STATE.INITIAL && (
            <form
              className="w-full flex flex-col gap-6"
              onSubmit={handleSubmit(submit)}
            >
              <Input
                type="text"
                label="Mobile Number"
                placeholder="Enter your phone number"
                name="phone"
                className="h-12"
                register={register}
                errors={errors}
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
              />
              <button
                type="submit"
                className="bg-[#0066FF] !text-white h-12 w-full"
              >
                Login
              </button>
            </form>
          )}
          {loginState === LOGIN_STATE.FINAL && (
            <>
              <form className="w-full flex flex-col gap-6 items-center">
                <p className="text-[#525252] font-semibold text-lg max-md:text-sm">
                  We have sent you a 6 digit OTP on +91 {user?.phone}
                </p>
                <p className="text-[#828282]">One time password</p>
                <OtpInput onOtpSubmit={onOtpSubmit} phone={user?.phone} />
                {loading && <p>Verifying...</p>}
              </form>
              <button
                className="bg-[#0066FF] !text-white h-12 w-full"
                onClick={resendCode}
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
