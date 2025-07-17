"use client";

import { useState, useEffect } from "react";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";

interface HeaderResponsiveProps {
  children: React.ReactNode;
}

const HeaderResponsive: React.FC<HeaderResponsiveProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Detect mobile device and set sidebar state
  useEffect(() => {
    const handleResize = () => {
      // Set to false if window width is less than 640px (Tailwind's 'sm' breakpoint)
      setIsSidebarOpen(window.innerWidth >= 640);
    };

    // Run on mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div
      className={`min-h-screen bg-gray-50 ${
        isSidebarOpen ? "sm:ml-64" : ""
      } transition-all duration-300 overflow-x-hidden box-border`}
    >
      <HeaderWithSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex w-full">
        <main className="w-full max-w-full transition-all duration-300 box-border">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HeaderResponsive;