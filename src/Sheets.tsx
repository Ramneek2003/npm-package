import React, { useState, useEffect } from "react";
import SlidingSheet from "./components/Sheet";

export default function Home({ darkMode }: { darkMode: boolean }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetPosition, setSheetPosition] = useState("bottom");

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 720) {
        setSheetPosition("bottom");
      } else {
        setSheetPosition("right");
      }
    };

    // Set initial position on component mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSheet = () => {
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={toggleSheet}
        className={`px-4 py-2 rounded-md border-none ${
          darkMode ? "bg-[#FFD700] !text-black" : "bg-[#0A2133] !text-white"
        }`}
      >
        Login
      </button>

      <SlidingSheet
        darkMode={darkMode}
        isOpen={sheetOpen}
        onClose={closeSheet}
        position={sheetPosition}
      />
    </div>
  );
}
