'use client';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6">
      <h1 className="flex items-center justify-center text-[8rem] md:text-[10rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-500 animate-pulse drop-shadow-xl">
        <span>4</span>
        <Image
          src="/img/logo_Station2.png"
          alt="Logo"
          width={128}
          height={128}
          className="mx-2 md:mx-4 md:w-[160px] md:h-[180px] cursor-pointer"
        />
        <span>4</span>
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-base md:text-lg text-gray-300 mb-8 text-center max-w-xl">
        Sorry, the page you're looking for doesn't exist or has been delete by PTT.
      </p>
      <Link
        href="/admin/dashboard"
        className="px-6 py-3 md:px-8 md:py-4 bg-red-600 hover:bg-red-700 transition text-white text-base md:text-lg rounded-full shadow-lg"
      >
        ⬅ Back to Admin Home
      </Link>
    </div>
  );
};

export default ErrorPage;