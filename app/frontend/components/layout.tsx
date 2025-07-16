// app/layout.tsx (or wherever your layout component is)
'use client';

import { useState } from 'react';
import Header from './common/Header/Headerwithsidebar';


export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {/* Header */}
        

        {/* Main Content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}