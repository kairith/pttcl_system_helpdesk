// app/components/common/Header/header.tsx
"use client";

import React, { useState, useEffect } from "react";
import UserDataProvider, { useUserData } from "./UserDataProvider";
import ProfileDropdown from "./ProfileDropdown";
import Header from "./head";
import Sidebar from "./Sidebar";


const HeaderWithSidebarInner: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, userImage, handleLogout } = useUserData();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const sidebar = document.querySelector(".sidebar");
      const header = document.querySelector(".header");
      const profileDropdown = document.querySelector(".profile-dropdown");

      // Close sidebar if click is outside sidebar and header
      if (
        isSidebarOpen &&
        sidebar &&
        header &&
        !sidebar.contains(target) &&
        !header.contains(target)
      ) {
        setIsSidebarOpen(false);
      }

      // Close profile dropdown if click is outside profile dropdown
      if (isProfileOpen && profileDropdown && !profileDropdown.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, isProfileOpen]);

  return (
    <div>
      <Header
        toggleSidebar={toggleSidebar}
        toggleProfile={toggleProfile}
        user={user}
        userImage={userImage}
        isProfileOpen={isProfileOpen}
      />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleLogout={handleLogout}
      />
      <ProfileDropdown
        isProfileOpen={isProfileOpen}
        user={user}
        userImage={userImage}
        handleLogout={handleLogout}
      />
    </div>
  );
};

const HeaderWithSidebar: React.FC = () => (
  <UserDataProvider>
    <HeaderWithSidebarInner />
  </UserDataProvider>
);

export default HeaderWithSidebar;