// components/NavSlide.tsx
'use client';

import { useState, useEffect } from 'react';
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

interface NavSlideProps {
  onToggle?: (isOpen: boolean) => void;
}

const NavSlide = ({ onToggle }: NavSlideProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen, onToggle]);

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Ticket', href: '/admin/ticket', icon: <Ticket size={20} /> },
    { label: 'Station', href: '/admin/station', icon: <MapPin size={20} /> },
    { label: 'Users', href: '/admin/user', icon: <Users size={20} /> },
    { label: 'Users Roles', href: '/admin/user_rules', icon: <ClipboardList size={20} /> },
    { label: 'Track', href: '/admin/track', icon: <LineChart size={20} /> },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Top Logo Section */}
      <div className="flex items-center gap-3 p-4">
        <Image src="/img/logo_Station2.png" alt="Logo" width={32} height={32} />
        {isOpen && <span className="text-blue-700 text-sm font-semibold">PTT (Cambodia) Limited</span>}
      </div>

      {/* Main Menu */}
      <nav className="mt-6 px-2 space-y-1 text-sm font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all"
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Finalize Section */}
      <div className="absolute bottom-4 left-0 w-full px-2">
        {isOpen && <p className="text-xs text-gray-400 px-1 mb-2">Finalize</p>}

        <Link
          href="/admin/report"
          className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded px-3 py-2 transition-all"
        >
          <Calendar size={20} />
          {isOpen && <span>Report</span>}
        </Link>

        <Link
          href="/logout"
          className="flex items-center gap-3 text-red-600 hover:bg-red-100 rounded px-3 py-2 transition-all"
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default NavSlide;