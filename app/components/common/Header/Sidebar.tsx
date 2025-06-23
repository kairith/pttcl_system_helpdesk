"use client";

import React, { useState, Fragment } from "react";
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
import { Dialog, Transition } from "@headlessui/react";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

interface MenuItem {
  label: string;
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/pages/admin/dashboard",
    icon: <LayoutDashboard size={20} aria-label="Dashboard" />,
  },
  {
    label: "Ticket",
    href: "/pages/admin/ticket",
    icon: <Ticket size={20} aria-label="Ticket" />,
  },
  {
    label: "Station",
    href: "/pages/admin/station",
    icon: <MapPin size={20} aria-label="Station" />,
  },
  {
    label: "Users",
    href: "/pages/admin/user",
    icon: <Users size={20} aria-label="Users" />,
  },
  {
    label: "Users Roles",
    href: "/pages/admin/user_rules",
    icon: <ClipboardList size={20} aria-label="Users Roles" />,
  },
  {
    label: "Track",
    href: "/pages/admin/track",
    icon: <LineChart size={20} aria-label="Track" />,
  },
  {
    label: "Report",
    href: "/pages/admin/report",
    icon: <Calendar size={20} aria-label="Report" />,
  },
  {
    label: "Logout",
    action: () => {}, // Will be overridden in component
    icon: <LogOut size={20} aria-label="Logout" />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  handleLogout,
}) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const openLogoutDialog = () => setIsLogoutDialogOpen(true);
  const closeLogoutDialog = () => setIsLogoutDialogOpen(false);
  const confirmLogout = () => {
    handleLogout();
    closeLogoutDialog();
  };

  return (
    <>
      <div
        className={`sidebar fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-expanded={isSidebarOpen}
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
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all"
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={openLogoutDialog}
                className="flex items-center gap-3 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition-all w-full text-left"
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            )
          ))}
        </nav>
      </div>

      <Transition appear show={isLogoutDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeLogoutDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirm Logout
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to logout? You will need to sign in again to access the dashboard.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeLogoutDialog}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={confirmLogout}
                    >
                      Confirm 
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Sidebar;