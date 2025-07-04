"use client";
import React, { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
  requiredPermission?: string;
  adminOnly?: boolean;
  nonAdminOnly?: boolean;
}

interface Permissions {
  add_user_status: boolean;
  edit_user_status: boolean;
  delete_user_status: boolean;
  list_user_status: boolean;
  add_ticket_status: boolean;
  edit_ticket_status: boolean;
  delete_ticket_status: boolean;
  list_ticket_status: boolean;
  list_ticket_assign: boolean;
  add_user_rules: boolean;
  edit_user_rules: boolean;
  delete_user_rules: boolean;
  list_user_rules: boolean;
  add_station: boolean;
  edit_station: boolean;
  delete_station: boolean;
  list_station: boolean;
  list_dashboard: boolean;
  list_track: boolean;
  list_report: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/pages/admin/dashboard",
    icon: <LayoutDashboard size={20} aria-label="Dashboard" />,
    requiredPermission: "list_dashboard",
  },
  {
    label: "Ticket",
    href: "/pages/admin/ticket",
    icon: <Ticket size={20} aria-label="Ticket" />,
    requiredPermission: "list_ticket_status",
    adminOnly: true,
  },
  {
    label: "My Tickets",
    href: "/pages/Users/ticket",
    icon: <Ticket size={20} aria-label="My Tickets" />,
    requiredPermission: "list_ticket_status",
    nonAdminOnly: true,
  },
  {
    label: "Station",
    href: "/pages/Users/station",
    icon: <MapPin size={20} aria-label="Station" />,
    requiredPermission: "list_station",
    nonAdminOnly: true,
  },
  {
    label: "Station",
    href: "/pages/admin/station",
    icon: <MapPin size={20} aria-label="Station" />,
    requiredPermission: "list_station",
    adminOnly: true,
  },
  {
    label: "Users",
    href: "/pages/admin/user",
    icon: <Users size={20} aria-label="Users" />,
    requiredPermission: "list_user_status",
  },
  {
    label: "Users Rules",
    href: "/pages/admin/user_rules",
    icon: <ClipboardList size={20} aria-label="Users Rules" />,
    requiredPermission: "list_user_rules",
    adminOnly: true,
  },
  {
    label: "Users Rules",
    href: "/pages/Users/user_rules",
    icon: <ClipboardList size={20} aria-label="Users Rules" />,
    requiredPermission: "list_user_rules",
    nonAdminOnly: true,
  },
  {
    label: "Track",
    href: "/pages/admin/track",
    icon: <LineChart size={20} aria-label="Track" />,
    requiredPermission: "list_track",
  },
  {
    label: "Report",
    href: "/pages/admin/report",
    icon: <Calendar size={20} aria-label="Report" />,
    requiredPermission: "list_report",
  },
  {
    label: "Logout",
    action: () => {},
    icon: <LogOut size={20} aria-label="Logout" />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  handleLogout,
}) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true); // Prevent effect from running on server-side render
    let isCancelled = false;

    async function loadPermissions() {
      if (isCancelled) return;

      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          if (!isCancelled) {
            router.push("/");
          }
          return;
        }

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          if (data.error?.includes("Invalid token") && !isCancelled) {
            router.push("/");
            return;
          }
          throw new Error(data.error || "Failed to fetch permissions");
        }
        const { user, rules } = await response.json();
        if (!isCancelled) {
          setIsAdmin(user.rules_id === 1461);
          const perms: Permissions = {
            add_user_status: !!rules.add_user_status,
            edit_user_status: !!rules.edit_user_status,
            delete_user_status: !!rules.delete_user_status,
            list_user_status: !!rules.list_user_status,
            add_ticket_status: !!rules.add_ticket_status,
            edit_ticket_status: !!rules.edit_ticket_status,
            delete_ticket_status: !!rules.delete_ticket_status,
            list_ticket_status: !!rules.list_ticket_status,
            list_ticket_assign: !!rules.list_ticket_assign,
            add_user_rules: !!rules.add_user_rules,
            edit_user_rules: !!rules.edit_user_rules,
            delete_user_rules: !!rules.delete_user_rules,
            list_user_rules: !!rules.list_user_rules,
            add_station: !!rules.add_station,
            edit_station: !!rules.edit_station,
            delete_station: !!rules.delete_station,
            list_station: !!rules.list_station,
            list_dashboard: rules.list_dashboard !== undefined ? !!rules.list_dashboard : true,
            list_track: rules.list_track !== undefined ? !!rules.list_track : true,
            list_report: rules.list_report !== undefined ? !!rules.list_report : true,
          };
          setPermissions(perms);
          console.log("Sidebar: Permissions loaded:", JSON.stringify(perms, null, 2));
        }
      } catch (err) {
        console.error("Sidebar: Error fetching permissions:", err);
        if (!isCancelled) {
          router.push("/");
        }
      }
    }

    loadPermissions();

    return () => {
      isCancelled = true; // Cleanup to prevent setting state on unmounted component
    };
  }, [router]);

  const openLogoutDialog = () => setIsLogoutDialogOpen(true);
  const closeLogoutDialog = () => setIsLogoutDialogOpen(false);
  const confirmLogout = () => {
    handleLogout();
    closeLogoutDialog();
    router.push("/");
  };

  // Avoid rendering until mounted to prevent hydration issues
  if (!isMounted) {
    return null;
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.label === "Logout") return true;
    if (!permissions || !item.requiredPermission) return false;
    if (item.adminOnly && !isAdmin) return false;
    if (item.nonAdminOnly && isAdmin) return false;
    return permissions[item.requiredPermission as keyof Permissions];
  });

  console.log(
    "Sidebar: Filtered menu items:",
    filteredMenuItems.map((item) => `${item.label} (${item.href || item.label})`)
  );

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
          {filteredMenuItems.map((item) => (
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 transition-all ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
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
                      Are you sure you want to logout? You will need to sign in
                      again to access the dashboard.
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