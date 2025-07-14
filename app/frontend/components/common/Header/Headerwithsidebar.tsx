// app/frontend/components/common/Header/Headerwithsidebar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "./head";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import UserDataProvider, { useUserData } from "./UserDataProvider";

interface HeaderWithSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const HeaderWithSidebarInner: React.FC<HeaderWithSidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [users_id, setUsersId] = useState<string>("");
  const { user, userImage, handleLogout } = useUserData();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleUserIdFetched = (userId: string) => {
    setUsersId(userId);
    console.log(`HeaderWithSidebar: Received users_id: ${userId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        headerRef.current &&
        !sidebarRef.current.contains(target) &&
        !headerRef.current.contains(target)
      ) {
        toggleSidebar();
      }
      if (
        isProfileOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, isProfileOpen, toggleSidebar]);

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
      onUserIdFetched={handleUserIdFetched}
      />
      {isProfileOpen && (
      <ProfileDropdown
      
        isProfileOpen={isProfileOpen}
        user={user}
        userImage={userImage}
        handleLogout={handleLogout}
      />
      )}
    </div>
  );
};

const HeaderWithSidebar: React.FC<HeaderWithSidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
}) => (
  <UserDataProvider>
    <HeaderWithSidebarInner isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
  </UserDataProvider>
);

export default HeaderWithSidebar;