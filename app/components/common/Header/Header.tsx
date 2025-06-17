"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  MapPin,
  Users,
  ClipboardList,
  LineChart,
  Calendar,
  LogOut,
} from "lucide-react";

const HeaderWithSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // controls visual state
const [isProfileVisible, setIsProfileVisible] = useState(false); // controls mounting

  const [user, setUser] = useState<{
    users_id?: number;
    users_name?: string;
    email?: string;
  } | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  



  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  // Load user data and fetch user image
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedImage = sessionStorage.getItem("userImage");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (storedImage) {
        setUserImage(storedImage);
        console.log("Loaded userImage from sessionStorage:", storedImage);
      } else if (parsedUser.users_id) {
        const fetchUserImage = async () => {
          try {
            const response = await fetch(
              `/api/data/user_image?users_id=${parsedUser.users_id}`
            );
            const data = await response.json();
            if (response.ok) {
              const imagePath = data.imagePath;
              setUserImage(imagePath);
              sessionStorage.setItem("userImage", imagePath);
              console.log(
                "Fetched userImage from API:",
                imagePath,
                "for users_id:",
                parsedUser.users_id
              );
            } else {
              console.error("Error fetching image:", data.error);
              setUserImage("/Uploads/user_image/Default-avatar.jpg");
              sessionStorage.setItem(
                "userImage",
                "/Uploads/user_image/Default-avatar.jpg"
              );
            }
          } catch (error) {
            console.error("Failed to fetch user image:", error);
            setUserImage("/Uploads/user_image/Default-avatar.jpg");
            sessionStorage.setItem(
              "userImage",
              "/Uploads/user_image/Default-avatar.jpg"
            );
          }
        };
        fetchUserImage();
      } else {
        setUserImage("/Uploads/user_image/Default-avatar.jpg");
        sessionStorage.setItem(
          "userImage",
          "/Uploads/user_image/Default-avatar.jpg"
        );
        console.log("No users_id in parsedUser, using default image");
      }
    } else {
      setUserImage("/Uploads/user_image/Default-avatar.jpg");
      console.log("No user in sessionStorage, using default image");
    }
  }, []);

  // Close sidebar and profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        headerRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
      if (
        isProfileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, isProfileOpen]);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userImage");
      setUser(null);
      setUserImage(null);
      router.push("/");
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { label: "Ticket", href: "/admin/ticket", icon: <Ticket size={20} /> },
    { label: "Station", href: "/admin/station", icon: <MapPin size={20} /> },
    { label: "Users", href: "/admin/user", icon: <Users size={20} /> },
    {
      label: "Users Roles",
      href: "/admin/user_rules",
      icon: <ClipboardList size={20} />,
    },
    { label: "Track", href: "/admin/track", icon: <LineChart size={20} /> },
  ];

  return (
    <div>
      <style jsx>{`
        .profile-dropdown {
          transition: opacity 0.35s ease-in-out, transform 0.35s ease-in-out;
          transform-origin: top right;
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
        .profile-toggle {
          transition: transform 0.2s ease-in-out,
            background-color 0.2s ease-in-out;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }
        .profile-toggle.active {
          transform: scale(1.05);
          background-color: rgba(
            229,
            231,
            235,
            0.5
          ); /* Tailwind gray-200 with opacity */
        }
      `}</style>
      <header
        ref={headerRef}
        className="bg-white shadow-md h-16 fixed top-0 left-0 right-0 z-50"
      >
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center">
            <Image
              src="/img/menu.png"
              alt="Toggle menu"
              width={32}
              height={32}
              className="cursor-pointer"
              onClick={toggleSidebar}
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
              />
            </div>
          </div>
          <div className="relative">
            <div
              className={`profile-toggle flex items-center space-x-6 cursor-pointer ${
                isProfileOpen ? "active" : ""
              }`}
              onClick={toggleProfile}
              role="button"
              tabIndex={0}
              aria-expanded={isProfileOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  toggleProfile();
                }
              }}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <Image
                  src={userImage || "/Uploads/user_image/Default-avatar.jpg"}
                  alt={`${user?.users_name || "Guest"}'s profile`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("Image load error in header:", e);
                    setUserImage("/Uploads/user_image/Default-avatar.jpg");
                  }}
                />
              </div>
              <span className="text-sm font-medium">
                {user?.users_name || "Guest"}
              </span>
            </div>
            {isProfileOpen && (
              <div
                ref={profileRef}
                className={`profile-dropdown absolute right-2 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 py-4 z-50
                           transition-all duration-300 ease-in-out transform origin-top-right
                           ${isProfileOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-3 invisible pointer-events-none"}

                        }
                     `}
              >
                <div className="flex flex-col items-center text-center px-6">
                  <div className="relative w-20 h-20 mb-2">
                    <Image
                      src={
                        userImage || "/Uploads/user_image/Default-avatar.jpg"
                      }
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                      onError={(e) => {
                        console.log("Image load error in profile:", e);
                        setUserImage("/Uploads/user_image/Default-avatar.jpg");
                      }}
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
                  <p className="text-lg font-semibold">
                    Hi, {user?.users_name || "Guest"}!
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email || "No email"}
                  </p>
                  <button className="mt-3 px-4 py-2 border border-gray-300 rounded-full text-sm text-blue-600 hover:bg-gray-100">
                    Manage your Account
                  </button>
                </div>
                <div className="px-6 py-2 flex flex-col space-y-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm text-red-600 hover:bg-gray-100 rounded-md px-3 py-2"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          <Image
            src="/img/logo_Station2.png"
            alt="Logo"
            width={32}
            height={32}
            className="cursor-pointer"
            onClick={toggleSidebar}
          />
          {isSidebarOpen && (
            <span className="text-blue-700 text-sm font-semibold">
              PTT (Cambodia) Limited
            </span>
          )}
        </div>
        <nav className="mt-6 px-2 space-y-1 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all"
            >
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 w-full px-2">
          {isSidebarOpen && (
            <p className="text-xs text-gray-400 px-1 mb-2">Finalize</p>
          )}
          <Link
            href="/admin/report"
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all"
          >
            <Calendar size={20} />
            {isSidebarOpen && <span>Report</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition-all w-full text-left"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderWithSidebar;
