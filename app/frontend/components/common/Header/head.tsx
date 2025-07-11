"use client";

import React, { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

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
            priority
          />
        </div>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative bg-gray-50 rounded-full px-3 py-2 flex items-center">
            <label htmlFor="search-input" className="sr-only">Search</label>
            <Image
              src="/images/img_search.svg"
              alt="Search icon"
              width={15}
              height={15}
              className="mr-3"
            />
            <input
              id="search-input"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-black-90"
              aria-label="Search"
            />
          </div>
        </div>
        <div className="relative">
          <div
            className={`profile-toggle flex items-center space-x-4 sm:space-x-6 cursor-pointer relative ${
              isProfileOpen ? "active" : ""
            }`}
            onClick={toggleProfile}
            role="button"
            tabIndex={0}
            aria-expanded={isProfileOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleProfile();
              if (e.key === "Escape" && isProfileOpen) toggleProfile();
            }}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <Image
                src={userImage || "/Uploads/user_image/Default-avatar.jpg"}
                alt={`${user?.users_name || "Guest"}'s profile`}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {user?.users_name || "Guest"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;