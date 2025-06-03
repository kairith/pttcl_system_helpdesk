'use client';

import React, { useState } from 'react';
import Image from 'next/image';


const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNotificationClick = () => {
    alert('You have 6 new notifications');
  };

  return (
    <header className="bg-white shadow-md h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Menu icon */}
        <div className="flex items-center">
          <Image 
            src="/images/img_icon_gray_900.svg"
            alt="Menu"
            width={25}
            height={23}
            className="cursor-pointer"
          />
        </div>

        {/* Center - Search bar */}
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
              value={searchQuery}
              onChange={handleSearch}
              className="bg-transparent outline-none flex-1 text-gray-600"
            />
          </div>
        </div>

        {/* Right side - Notifications, Language, Profile */}
        <div className="flex items-center space-x-6">
          {/* Notification */}
          <div className="relative cursor-pointer" onClick={handleNotificationClick}>
            <Image 
              src="/images/img_icon_blue_a200_01.svg"
              alt="Notifications"
              width={25}
              height={23}
            />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              6
            </div>
          </div>

          {/* Language selector */}
          <div className="flex items-center space-x-2">
            <Image 
              src="/images/img_flag.png"
              alt="Flag"
              width={27}
              height={39}
            />
            <span className="text-gray-600 font-medium">English</span>
            <Image 
              src="/images/img_drop_down.svg"
              alt="Dropdown"
              width={4}
              height={8}
            />
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <Image 
              src="/images/img_man438081960720.png"
              alt="Profile"
              width={44}
              height={43}
              className="rounded-full"
            />
            <div>
              <p className="text-gray-800 font-bold text-sm">Kairith</p>
              <p className="text-gray-600 text-xs">Admin</p>
            </div>
            <Image 
              src="/images/img_more.svg"
              alt="More"
              width={18}
              height={17}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;