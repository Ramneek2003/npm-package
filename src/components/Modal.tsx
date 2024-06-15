import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import React from "react";

export interface EnrollNowFormProps {
  isOpen: boolean;
  closeModal: () => void;
  children?: React.ReactNode;
  className: string;
}

export default function Modal({
  isOpen,
  closeModal,
  children,
  className,
}: EnrollNowFormProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={closeModal}>
        <div className="fixed flex justify-center items-center bg-black bg-opacity-30 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center md:p-4 text-center w-full h-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={
                  "w-full md:p-24 p-8 bg-white max-w-2xl gap-5 border-none flex flex-col border-4 justify-center items-center transform overflow-hidden rounded-2xl mx-2 text-left align-middle shadow-xl transition-all" +
                  " " +
                  className
                }
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
