// app/components/common/Header/Header.tsx
"use client";

import React from "react";
import Image from "next/image";
import { User } from "./UserDataProvider";

interface HeaderProps {
  toggleSidebar: () => void;
  toggleProfile: () => void;
  user: User | null;
  userImage: string | null;
  isProfileOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  toggleProfile,
  user,
  userImage,
  isProfileOpen,
}) => {
  return (
    <header className="header bg-white shadow-md h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <Image
            src="/img/menu.png"
            alt="Toggle menu"
            width={32}
            height={32}
            className="cursor-pointer"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          />
        </div>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative bg-gray-50 rounded-full px-4 py-2 flex items-center">
            <Image
              src="/images/img_search.svg"
              alt="Search"
              width={15}
              height={15}
              className="mr-3"
            />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-black-90"
              aria-label="Search"
            />
          </div>
        </div>
        <div className="relative">
          <div
            className={`profile-toggle flex items-center space-x-6 cursor-pointer relative ${
              isProfileOpen ? "active" : ""
            }`}
            onClick={toggleProfile}
            role="button"
            tabIndex={0}
            aria-expanded={isProfileOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleProfile();
            }}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <Image
                src={userImage || "/Uploads/user_image/Default-avatar.jpg"}
                alt={`${user?.users_name || "Guest"}'s profile`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium">
              {user?.users_name || "Guest"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;