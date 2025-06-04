// components/HeaderWithSidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Ticket,
  MapPin,
  Users,
  ClipboardList,
  LineChart,
  Calendar,
  LogOut,
} from 'lucide-react';

const HeaderWithSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Ticket', href: '/admin/ticket', icon: <Ticket size={20} /> },
    { label: 'Station', href: '/admin/station', icon: <MapPin size={20} /> },
    { label: 'Users', href: '/admin/user', icon: <Users size={20} /> },
    { label: 'Users Roles', href: '/admin/user_rules', icon: <ClipboardList size={20} /> },
    { label: 'Track', href: '/admin/track', icon: <LineChart size={20} /> },
  ];

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-md h-16 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center">
            <Image
              src="/img/logo_Station2.png"
              alt="Logo"
              width={32}
              height={32}
              className="cursor-pointer"
              onClick={toggleSidebar} // Toggle sidebar on logo click
            />
          </div>
          <div className="flex-1 max-w-md mx-8">
            <div className="relative bg-gray-50 rounded-full px-4 py-2 flex items-center">
              <Image src="/images/img_search.svg" alt="Search" width={15} height={15} className="mr-3" />
              <input type="text" placeholder="Search" className="bg-transparent outline-none flex-1 text-black-90" />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* Notifications and Profile */}
            {/* Add your notifications and profile here */}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        >
        {/* Top Logo Section */}
        <div className="flex items-center gap-3 p-4">
          <Image
            src="/img/logo_Station2.png"
            alt="Logo"
            width={32}
            height={32}
            className="cursor-pointer"
            onClick={toggleSidebar} // Toggle sidebar on logo click
          />
          {isSidebarOpen && <span className="text-blue-700 text-sm font-semibold">PTT (Cambodia) Limited</span>}
      </div>

        {/* Main Menu */}
        <nav className="mt-6 px-2 space-y-1 text-sm font-medium">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all">
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Finalize Section */}
        <div className="absolute bottom-4 left-0 w-full px-2">
          {isSidebarOpen && <p className="text-xs text-gray-400 px-1 mb-2">Finalize</p>}
          <Link href="/admin/report" className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all">
            <Calendar size={20} />
            {isSidebarOpen && <span>Report</span>}
          </Link>
          <Link href="/" className="flex items-center gap-3 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeaderWithSidebar;