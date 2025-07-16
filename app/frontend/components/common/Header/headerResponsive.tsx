"use client";

import { useState } from "react";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";

interface HeaderResponsiveProps {
  children: React.ReactNode;
}

const HeaderResponsive: React.FC<HeaderResponsiveProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

// className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border"
