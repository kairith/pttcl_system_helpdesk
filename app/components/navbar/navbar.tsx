'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavSlideProps {
  onToggle?: (isOpen: boolean) => void;
}

const NavSlide = ({ onToggle }: NavSlideProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Sidebar with Dynamic Width Animation */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-16'
        } z-40 overflow-hidden`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Hamburger Button */}
          <button
            onClick={toggleSidebar}
            className="focus:outline-none mb-4 self-start"
            aria-label="Toggle sidebar"
          >
            <div className="w-6 h-6 relative">
              <span
                className={`absolute block w-6 h-0.5 bg-white rounded transition-all duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 translate-y-0 top-2.5' : 'top-0.5'
                }`}
              ></span>
              <span
                className={`absolute block w-6 h-0.5 bg-white rounded transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-0' : 'top-2.5'
                }`}
              ></span>
              <span
                className={`absolute block w-6 h-0.5 bg-white rounded transition-all duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 translate-y-0 top-2.5' : 'top-4.5'
                }`}
              ></span>
            </div>
          </button>

          {/* Sidebar Content */}
          <div className="flex-1">
            <h1 className={`text-2xl font-bold mb-8 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              MyApp
            </h1>
            <nav className="flex flex-col space-y-4">
                <Link
                href="/admin/dashboard"
                className={`hover:bg-gray-700 p-2 rounded transition-colors duration-200 flex items-center ${
                  isOpen ? 'justify-start' : 'justify-center'
                }`}
              >
                <span className="mr-2">📊</span>
                <span className={`${isOpen ? 'inline' : 'hidden'}`}>Dashboard</span>
              </Link>
              <Link
                href="/admin/ticket"
                className={`hover:bg-gray-700 p-2 rounded transition-colors duration-200 flex items-center ${
                  isOpen ? 'justify-start' : 'justify-center'
                }`}
              >
                <span className="mr-2">🏠</span>
                <span className={`${isOpen ? 'inline' : 'hidden'}`}>ticket</span>
              </Link>
              <Link
                href="/admin/user"
                className={`hover:bg-gray-700 p-2 rounded transition-colors duration-200 flex items-center ${
                  isOpen ? 'justify-start' : 'justify-center'
                }`}
              >
                <span className="mr-2">ℹ️</span>
                <span className={`${isOpen ? 'inline' : 'hidden'}`}>User</span>
              </Link>
              <Link
                href="/admin/user_rules"
                className={`hover:bg-gray-700 p-2 rounded transition-colors duration-200 flex items-center ${
                  isOpen ? 'justify-start' : 'justify-center'
                }`}
              >
                <span className="mr-2">📬</span>
                <span className={`${isOpen ? 'inline' : 'hidden'}`}>User Rules</span>
              </Link>
              
            </nav>
          </div>
        </div>
      </div>

      {/* Custom CSS for Smooth Width Transition */}
      <style jsx global>{`
        .w-64 {
          width: 256px;
        }
        .w-16 {
          width: 64px;
        }
      `}</style>
    </>
  );
};

export default NavSlide;