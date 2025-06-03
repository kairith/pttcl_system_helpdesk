

'use client';

import NavSlide from '@/app/components/navbar/navbar';
import { useState } from 'react';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  return (
    <div className="flex">
      <NavSlide onToggle={handleSidebarToggle} />
      <main
        className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-lg">Welcome to the admin dashboard.</p>
        </div>
      </main>
    </div>
  );
}