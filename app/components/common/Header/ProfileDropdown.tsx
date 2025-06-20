"use client";

import React from "react";
import Image from "next/image";
import { User } from "./UserDataProvider";

interface ProfileDropdownProps {
  isProfileOpen: boolean;
  user: User | null;
  userImage: string | null;
  handleLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isProfileOpen,
  user,
  userImage,
  handleLogout,
}) => {
  return (
    <>
      <style jsx>{`
        .profile-dropdown {
          transition: opacity 0.35s ease-in-out, transform 0.35s ease-in-out;
          transform-origin: top right;
          will-change: opacity, transform;
          padding-right: env(safe-area-inset-right);
          padding-left: env(safe-area-inset-left);
        }
        .profile-dropdown.open {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .profile-dropdown.closed {
          opacity: 0;
          transform: translateY(-12px) scale(0.95);
          pointer-events: none;
        }
      `}</style>
      {isProfileOpen && (
        <div
          className={`profile-dropdown fixed mt-18 right-2 sm:right-4 w-[calc(100vw-16px)] max-w-80 bg-white rounded-2xl shadow-lg border border-gray-200 py-4 z-50 ${
            isProfileOpen ? "open" : "closed"
          }`}
        >
          <div className="flex flex-col items-center text-center px-6">
            <div className="relative w-20 h-20 mb-2">
              <Image
                src={userImage || "/Uploads/user_image/Default-avatar.jpg"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                priority
              />
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow">
                <Image
                  src="/img/camera-icon.png"
                  alt="Edit"
                  width={16}
                  height={16}
                />
              </div>
            </div>
            <p className="text-lg font-semibold">Hi, {user?.users_name || "Guest"}!</p>
            <p className="text-sm text-gray-500 truncate w-full">{user?.email || "No email"}</p>
            <button className="mt-3 px-4 py-3 border border-gray-300 rounded-full text-sm text-blue-600 hover:bg-gray-100">
              Manage your Account
            </button>
          </div>
          <div className="px-6 py-2 flex flex-col space-y-1">
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-600 hover:bg-gray-100 rounded-md px-3 py-3"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;