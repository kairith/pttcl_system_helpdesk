
"use client";
import React, { useState, useEffect, Fragment, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import dynamic from "next/dynamic";

// Dynamically import lucide-react icons to reduce bundle size
const LayoutDashboard = dynamic(() => import("lucide-react").then(mod => mod.LayoutDashboard), { ssr: false });
const Ticket = dynamic(() => import("lucide-react").then(mod => mod.Ticket), { ssr: false });
const MapPin = dynamic(() => import("lucide-react").then(mod => mod.MapPin), { ssr: false });
const Users = dynamic(() => import("lucide-react").then(mod => mod.Users), { ssr: false });
const ClipboardList = dynamic(() => import("lucide-react").then(mod => mod.ClipboardList), { ssr: false });
const LineChart = dynamic(() => import("lucide-react").then(mod => mod.LineChart), { ssr: false });
const Calendar = dynamic(() => import("lucide-react").then(mod => mod.Calendar), { ssr: false });
const LogOut = dynamic(() => import("lucide-react").then(mod => mod.LogOut), { ssr: false });
const Bell = dynamic(() => import("lucide-react").then(mod => mod.Bell), { ssr: false });

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
  onUserIdFetched: (users_id: string) => void;
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
  list_alertbot: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/pages/admin/dashboard",
    icon: <LayoutDashboard size={20} aria-label="Dashboard" />,
    requiredPermission: "list_dashboard",
    adminOnly: true,
  },
  {
    label: "Dashboard",
    href: "/pages/Users/dashboard",
    icon: <LayoutDashboard size={20} aria-label="Dashboard" />,
    requiredPermission: "list_dashboard",
    nonAdminOnly: true,
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
    href: "/pages/admin/station",
    icon: <MapPin size={20} aria-label="Station" />,
    requiredPermission: "list_station",
    adminOnly: true,
  },
  {
    label: "Station",
    href: "/pages/Users/station",
    icon: <MapPin size={20} aria-label="Station" />,
    requiredPermission: "list_station",
    nonAdminOnly: true,
  },
  {
    label: "Users",
    href: "/pages/admin/user",
    icon: <Users size={20} aria-label="Users" />,
    requiredPermission: "list_user_status",
    adminOnly: true,
  },
  {
    label: "Users",
    href: "/pages/Users/user",
    icon: <Users size={20} aria-label="Users" />,
    requiredPermission: "list_user_status",
    nonAdminOnly: true,
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
    adminOnly: true,
  },
  {
    label: "Track",
    href: "/pages/Users/track",
    icon: <LineChart size={20} aria-label="Track" />,
    requiredPermission: "list_track",
    nonAdminOnly: true,
  },
  {
    label: "Report",
    href: "/pages/admin/report",
    icon: <Calendar size={20} aria-label="Report" />,
    requiredPermission: "list_report",
    adminOnly: true,
  },
  {
    label: "Config Alert",
    href: "/pages/admin/test_alert_bot",
    icon: <Bell size={20} aria-label="Config Alert" />,
    requiredPermission: "list_alertbot",
    adminOnly: true,
  },
  {
    label: "Report",
    href: "/pages/Users/report",
    icon: <Calendar size={20} aria-label="Report" />,
    requiredPermission: "list_report",
    nonAdminOnly: true,
  },
  {
    label: "Logout",
    action: () => {},
    icon: <LogOut size={20} aria-label="Logout" />,
  },
];

const Sidebar: React.FC<SidebarProps> = React.memo(({ isSidebarOpen, toggleSidebar, handleLogout, onUserIdFetched }) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users_id, setUsersId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Handle permissions fetching with type-safe error handling
  useEffect(() => {
    const controller = new AbortController();
    async function loadPermissions() {
      setLoading(true);
      try {
        if (typeof window === "undefined") return;
        const cached = sessionStorage.getItem("permissions");
        const token = sessionStorage.getItem("token");
        const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
        const userId = sessionUser.users_id || "";

        if (!token || !userId) {
          router.push("/");
          return;
        }

        setUsersId(userId);
        onUserIdFetched(userId);

        if (cached) {
          const parsed = JSON.parse(cached);
          setPermissions(parsed.permissions);
          setIsAdmin(parsed.isAdmin);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch permissions");
        }

        const { user, rules } = await response.json();
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
          list_alertbot: rules.list_alertbot !== undefined ? !!rules.list_alertbot : user.rules_id === 1461,
        };

        setPermissions(perms);
        setIsAdmin(user.rules_id === 1461);
        sessionStorage.setItem(
          "permissions",
          JSON.stringify({ permissions: perms, isAdmin: user.rules_id === 1461 })
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching permissions:", err);
        setError(`Failed to load permissions: ${errorMessage}`);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
    return () => controller.abort();
  }, [router, onUserIdFetched]);

  // Debug navigation by tracking pathname changes (App Router compatible)
  useEffect(() => {
    console.log("Current pathname:", pathname);
  }, [pathname]);

  const openLogoutDialog = () => setIsLogoutDialogOpen(true);
  const closeLogoutDialog = () => setIsLogoutDialogOpen(false);
  const confirmLogout = () => {
    handleLogout();
    sessionStorage.clear();
    closeLogoutDialog();
    router.push("/");
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.label === "Logout") return true;
      if (item.label === "Config Alert") return isAdmin;
      if (!item.requiredPermission) return false;
      if (item.adminOnly && !isAdmin) return false;
      if (item.nonAdminOnly && isAdmin) return false;
      return permissions && permissions[item.requiredPermission as keyof Permissions];
    });
  }, [permissions, isAdmin]);

  if (loading || !permissions) {
    return (
      <div className="fixed top-0 left-0 h-screen w-64 bg-white p-6 flex flex-col justify-between shadow-md">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4" />
          <div className="space-y-4">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-300 rounded-md" />
                <div className="h-4 bg-gray-300 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-white shadow-sm transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 p-4">
          <Image
            src="/img/logo_Station2.png"
            alt="PTT Cambodia Logo"
            width={32}
            height={32}
            className="cursor-pointer"
            onClick={toggleSidebar}
            loading="lazy"
          />
          {isSidebarOpen && (
            <span className="text-blue-700 text-sm font-semibold">
              PTT (Cambodia) Limited
            </span>
          )}
        </div>
        <nav className="mt-6 px-2 space-y-1 text-sm font-medium">
          {filteredMenuItems.map((item) =>
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 rounded px-3 py-2 transition-all ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={openLogoutDialog}
                className="flex items-center gap-3 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition-all w-full text-left"
                aria-label="Log out"
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            )
          )}
        </nav>
      </div>

      <Transition appear show={isLogoutDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeLogoutDialog} initialFocus={cancelButtonRef}>
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
              className="fixed inset-0 bg-white-100 bg-opacity-50"
              style={{ backdropFilter: "blur(6px)" }}
              aria-hidden="true"
            />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
                <Dialog.Title className="text-lg font-medium text-gray-800">
                  Confirm Logout
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to log out?
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    ref={cancelButtonRef}
                    onClick={closeLogoutDialog}
                    className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100"
                    aria-label="Cancel logout"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    aria-label="Confirm logout"
                  >
                    Log Out
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {error && (
        <div
          className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50"
          role="alert"
        >
          {error}
          <button
            className="ml-4 hover:text-red-900"
            onClick={() => setError(null)}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
});

export default Sidebar;
