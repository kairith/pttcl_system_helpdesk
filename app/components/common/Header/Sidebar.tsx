// app/components/common/Header/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/pages/admin/dashboard",
    icon: <LayoutDashboard size={20} aria-label="Dashboard" />,
  },
  { label: "Ticket", href: "/pages/admin/ticket", icon: <Ticket size={20} aria-label="Ticket" /> },
  { label: "Station", href: "/pages/admin/station", icon: <MapPin size={20} aria-label="Station" /> },
  { label: "Users", href: "/pages/admin/user", icon: <Users size={20} aria-label="Users" /> },
  {
    label: "Users Roles",
    href: "/pages/admin/user_rules",
    icon: <ClipboardList size={20} aria-label="Users Roles" />,
  },
  { label: "Track", href: "/pages/admin/track", icon: <LineChart size={20} aria-label="Track" /> },
];

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  handleLogout,
}) => {
  return (
    <div
      className={`sidebar fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 z-50 ${
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
          aria-label="Toggle sidebar"
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
        {isSidebarOpen && <p className="text-xs text-gray-400 px-1 mb-2">Finalize</p>}
        <Link
          href="/pages/admin/report"
          className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all"
        >
          <Calendar size={20} aria-label="Report" />
          {isSidebarOpen && <span>Report</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition-all w-full text-left"
        >
          <LogOut size={20} aria-label="Logout" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;